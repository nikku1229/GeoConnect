import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../../socket/socket";
import { useRoomAuth } from "../../context/RoomAuth";
import { useToast } from "../../context/ToastContext";
import MapView from "../map/MapView";
import Toast from "../common/Toast";
import Sidebar from "../sidebar/Sidebar";
import RoomControls from "./RoomControls";
import MembersList from "./MembersList";
import ChatBox from "./ChatBox";
import { shouldSendLocation } from "../../utils/locationThrottle";
import { pinApi } from "../../services/pinApi";
import RoomUserIcon from "../../assets/RoomUserIcon.svg";
import ChatIcon from "../../assets/ChatIcon.svg";

const Room = () => {
  const { leaveRoom } = useRoomAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const roomPass = location.state?.password || "";

  const socketRef = useRef(null);
  const prevLocation = useRef(null);
  const watchIdRef = useRef(null);

  const [users, setUsers] = useState({});
  const [creatorId, setCreatorId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [pins, setPins] = useState([]);
  const [isMapPickMode, setIsMapPickMode] = useState(false);
  const [pendingPinComment, setPendingPinComment] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sharedSearchLocation, setSharedSearchLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const isCreator = creatorId === userId;

  const fetchPins = async () => {
    try {
      const res = await pinApi.getRoomPins(roomId);
      setPins(res.data);
    } catch (err) {
      console.error("Fetch pins error:", err);
    }
  };

  const startLocationTracking = () => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (!shouldSendLocation(prevLocation.current, newLocation)) return;
        prevLocation.current = newLocation;
        setMyLocation(newLocation);
        if (!socketRef.current?.connected) return;
        socketRef.current.emit("location_update", {
          userId,
          roomId,
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          name: username,
        });
      },
      (err) => {
        showToast("Location permission denied");
        console.error(err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
  };

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { roomId, userId, username });
      startLocationTracking();
      setTimeout(() => fetchPins(), 500);
    });

    socket.on("location_update", (data) => {
      setUsers((prev) => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          lat: data.latitude,
          lng: data.longitude,
          name: data.name,
        },
      }));
    });

    socket.on("all_locations", (locations) => {
      setUsers((prev) => {
        const updated = { ...prev };
        locations.forEach((loc) => {
          updated[loc.userId] = {
            ...updated[loc.userId],
            lat: loc.latitude,
            lng: loc.longitude,
            name: loc.name,
            online: loc.online,
          };
        });
        return updated;
      });
    });

    socket.on("user_status", ({ userId, status }) => {
      setUsers((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], online: status === "online" },
      }));
    });

    socket.on("receive_message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("room_creator", ({ creatorId }) => {
      setCreatorId(creatorId);
    });

    socket.on("user_kicked", () => {
      showToast("You were kicked from the room");
      socket.disconnect();
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      navigate("/dashboard");
    });

    socket.on("user-disconnected", (userId) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    socket.on("all_pins", (existingPins) => setPins(existingPins));
    socket.on("pin_added", (newPin) => {
      setPins((prev) => {
        if (prev.some((p) => p._id === newPin._id)) return prev;
        return [newPin, ...prev];
      });
    });
    socket.on("pin_removed", ({ pinId }) =>
      setPins((prev) => prev.filter((p) => p._id !== pinId)),
    );
    socket.on("location_searched", (data) => setSharedSearchLocation(data));
    socket.on("clear_searched_location", ({ userId }) => {
      setSharedSearchLocation((prev) =>
        prev?.userId === userId ? null : prev,
      );
    });

    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      socket.disconnect();
      disconnectSocket();
    };
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socketRef.current?.emit("send_message", {
      roomId,
      userId,
      username,
      message: message.trim(),
    });
    setMessage("");
  };

  const handleSearchLocation = async (query) => {
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      );
      const data = await res.json();
      if (data?.length > 0) {
        const locationData = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name,
        };
        socketRef.current?.emit("search_location", {
          roomId,
          location: locationData,
          userId,
          username,
        });
        setSharedSearchLocation({
          userId,
          searchedBy: username,
          location: locationData,
          timestamp: new Date(),
        });
        showToast(
          `📍 Shared: ${locationData.name.split(",")[0]} with everyone`,
        );
      } else {
        showToast("Location not found");
      }
    } catch (err) {
      showToast("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    socketRef.current?.emit("clear_search_location", { roomId, userId });
    setSharedSearchLocation(null);
    showToast("Cleared searched location");
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const handleLeave = async () => {
    await leaveRoom(roomId);
    socketRef.current?.emit("leave_room", { roomId, userId });
    navigate("/dashboard");
    showToast("Left room successfully");
  };

  const handleBack = () => {
    socketRef.current?.emit("user_inactive", { roomId, userId });
    socketRef.current?.disconnect();
    navigate("/dashboard");
  };

  const kickUser = (targetId) => {
    socketRef.current?.emit("kick_user", { roomId, targetUserId: targetId });

    setUsers((prev) => {
      const updated = { ...prev };
      delete updated[targetId];
      return updated;
    });

    showToast("User kicked");
  };

  const handleAddPin = async (pinData) => {
    try {
      const res = await pinApi.createPin({ roomId, ...pinData });
      socketRef.current?.emit("new_pin", { roomId, pin: pinData });
      setPins((prev) => [res.data, ...prev]);
      showToast("Pin added successfully");
      return res.data;
    } catch (err) {
      showToast("Failed to add pin");
      throw err;
    }
  };

  const handleDeletePin = async (pinId) => {
    try {
      await pinApi.deletePin(pinId);
      setPins((prev) => prev.filter((p) => p._id !== pinId));
      socketRef.current?.emit("delete_pin", { roomId, pinId });
      showToast("Pin deleted successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete pin");
    }
  };

  const handleMapClick = async (lat, lng) => {
    if (!isMapPickMode) return;
    if (!pendingPinComment) {
      showToast("Please enter a comment first");
      setIsMapPickMode(false);
      return;
    }
    try {
      const pinData = {
        comment: pendingPinComment,
        latitude: lat,
        longitude: lng,
        locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
      const res = await pinApi.createPin({ roomId, ...pinData });
      setPins((prev) => [res.data, ...prev]);
      socketRef.current?.emit("new_pin", { roomId, pin: pinData });
      showToast("Pin added successfully");
    } catch (err) {
      showToast("Failed to add pin");
    }
    setIsMapPickMode(false);
    setPendingPinComment("");
  };

  const enableMapPickMode = (comment) => {
    setPendingPinComment(comment);
    setIsMapPickMode(true);
    showToast("Click anywhere on the map to place your pin");
  };

  return (
    <>
      <Toast />
      <Sidebar
        onAddPin={handleAddPin}
        onEnableMapPickMode={enableMapPickMode}
        onDeletePin={handleDeletePin}
        pins={pins}
        onSearchLocation={handleSearchLocation}
        searchResult={sharedSearchLocation}
        searchDistance={
          sharedSearchLocation && myLocation
            ? calculateDistance(
                myLocation.lat,
                myLocation.lng,
                sharedSearchLocation.location.lat,
                sharedSearchLocation.location.lng,
              )
            : null
        }
        isSearching={isSearching}
        onClearSearch={handleClearSearch}
      />

      <MapView
        users={users}
        myLocation={myLocation}
        selfId={userId}
        pins={pins}
        onDeletePin={handleDeletePin}
        onMapClick={handleMapClick}
        isMapPickMode={isMapPickMode}
        sharedSearchLocation={sharedSearchLocation}
      />

      <div className="room-container">
        <RoomControls
          roomId={roomId}
          roomPass={roomPass}
          isCreator={isCreator}
          users={users}
          onBack={handleBack}
          onLeave={handleLeave}
        />

        <div
          className="room-blocks bottom-left"
          onClick={() => {
            setShowUsers(!showUsers);
            if (showChat) setShowChat(false);
          }}
        >
          <img src={RoomUserIcon} alt="Members" /> Members
        </div>

        <div
          className="room-blocks bottom-right"
          onClick={() => {
            setShowChat(!showChat);
            if (showUsers) setShowUsers(false);
          }}
        >
          <img src={ChatIcon} alt="Open Chat" /> Chat
        </div>

        <MembersList
          users={users}
          creatorId={creatorId}
          userId={userId}
          showUsers={showUsers}
          setShowUsers={setShowUsers}
          isCreator={isCreator}
          onKickUser={kickUser}
        />
        <ChatBox
          chat={chat}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          showChat={showChat}
          setShowChat={setShowChat}
        />
      </div>
    </>
  );
};

export default Room;
