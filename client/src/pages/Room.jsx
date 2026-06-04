import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { useRoomAuth } from "../context/RoomAuth";
import { useToast } from "../context/ToastContext";
import { pinApi } from "../services/pinApi";
import MapView from "../components/MapView";
import Toast from "../components/Toast";
import Sidebar from "../components/Sidebar";
import { shouldSendLocation } from "../utils/locationThrottle";
import LeftArrowIcon from "../assets/LeftArrowIcon.svg";
import OutIcon from "../assets/OutIcon.svg";
import ChatIcon from "../assets/ChatIcon.svg";
import RoomUserIcon from "../assets/RoomUserIcon.svg";
import UserIcon from "../assets/UserIcon.svg";
import SendIcon from "../assets/SendIcon.svg";

const Room = () => {
  const { leaveRoom } = useRoomAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const roomPass = location.state?.password || "";

  const socketRef = useRef(null);
  const prevLocation = useRef(null);

  const [users, setUsers] = useState({});
  const [creatorId, setCreatorId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const [pins, setPins] = useState([]);
  const [isMapPickMode, setIsMapPickMode] = useState(false);
  const [pendingPinComment, setPendingPinComment] = useState("");

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const [showUsers, setShowUsers] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const isCreator = creatorId && creatorId === userId;
  const watchIdRef = useRef(null);

  // Fetch pins function
  const fetchPins = async () => {
    try {
      const res = await pinApi.getRoomPins(roomId);
      setPins(res.data);
    } catch (err) {
      console.error("Fetch pins error:", err);
    }
  };

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", {
        roomId,
        userId,
        username,
      });

      if (!watchIdRef.current) {
        startLocationTracking();
      }

      setTimeout(() => {
        fetchPins();
      }, 500);
    });

    socket.on("location_update", (data) => {
      const { userId, latitude, longitude, name } = data;

      setUsers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          lat: latitude,
          lng: longitude,
          name,
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
        [userId]: {
          ...prev[userId],
          online: status === "online",
        },
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
      socketRef.current.disconnect();

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      navigate("/dashboard");
    });

    socket.on("user-disconnected", (userId) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    socket.on("all_pins", (existingPins) => {
      setPins(existingPins);
    });

    socket.on("pin_added", (newPin) => {
      setPins((prev) => {
        const exists = prev.some((p) => p._id === newPin._id);
        if (exists) return prev;
        return [newPin, ...prev];
      });
    });

    socket.on("pin_removed", ({ pinId }) => {
      setPins((prev) => prev.filter((p) => p._id !== pinId));
      showToast("Pin removed");
    });

    return () => {
      if (!socketRef.current) return;

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      socketRef.current.off("location_update");
      socketRef.current.off("user_status");
      socketRef.current.off("receive_message");
      socketRef.current.off("user-disconnected");
      socketRef.current.off("user_kicked");
      socketRef.current.off("room_creator");
      socketRef.current.off("all_locations");
      socketRef.current.off("all_pins");
      socketRef.current.off("pin_added");
      socketRef.current.off("pin_removed");

      disconnectSocket();
    };
  }, [roomId]);

  const startLocationTracking = () => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!shouldSendLocation(prevLocation.current, newLocation)) {
          return;
        }

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
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socketRef.current.emit("send_message", {
      roomId,
      userId,
      username,
      message: message.trim(),
    });

    setMessage("");
  };

  const handleLeave = async () => {
    try {
      await leaveRoom(roomId);

      if (socketRef.current) {
        socketRef.current.emit("leave_room", { roomId, userId });
        socketRef.current.disconnect();
      }
      navigate("/dashboard");
      showToast("Leave room successful");
    } catch (err) {
      console.error("Error leaving room:", err);
      showToast("Failed to leave room");
    }
  };

  const handleBack = () => {
    if (socketRef.current) {
      socketRef.current.emit("user_inactive", {
        roomId,
        userId,
      });

      socketRef.current.disconnect();
    }

    navigate("/dashboard");
  };

  const kickUser = (targetId) => {
    try {
      socketRef.current.emit("kick_user", {
        roomId,
        targetUserId: targetId,
      });

      showToast("User kicked");
    } catch {
      showToast("Failed to kick");
    }
  };

  const handleAddPin = async (pinData) => {
    try {
      const res = await pinApi.createPin({
        roomId,
        ...pinData,
      });

      // Emit via socket for real-time
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("new_pin", {
          roomId,
          pin: pinData,
        });
      }

      setPins((prev) => [res.data, ...prev]);

      showToast("Pin added successfully");
      return res.data;
    } catch (err) {
      console.error("Add pin error:", err);
      showToast("Failed to add pin");
      throw err;
    }
  };

  const handleDeletePin = async (pinId) => {
    try {
      await pinApi.deletePin(pinId);

      // Update local state
      setPins((prev) => prev.filter((p) => p._id !== pinId));

      // Emit via socket
      if (socketRef.current) {
        socketRef.current.emit("delete_pin", { roomId, pinId });
      }

      showToast("Pin deleted successful");
    } catch (err) {
      console.error("Delete pin error:", err);
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

      const res = await pinApi.createPin({
        roomId,
        ...pinData,
      });

      // Add to local state immediately
      setPins((prev) => [res.data, ...prev]);

      // Emit via socket for others
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("new_pin", {
          roomId,
          pin: pinData,
        });
      }

      showToast("Pin added successfully");
    } catch (err) {
      console.error("Add pin error:", err);
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
      />

      <MapView
        users={users}
        myLocation={myLocation}
        selfId={userId}
        pins={pins}
        onDeletePin={handleDeletePin}
        onMapClick={handleMapClick}
        isMapPickMode={isMapPickMode}
      />

      <div className="room-container">
        <div className="room-blocks top-left">
          <button onClick={handleBack} className="primary-btn">
            <img src={LeftArrowIcon} alt="Back" />
          </button>

          <div
            className="room-id"
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              showToast("Room id copy");
            }}
          >
            {roomId}
            <br />
            <small>{isCreator ? `Pass: ${roomPass}` : ""}</small>
          </div>
        </div>

        <div className="room-blocks top-right">
          <div className="detail">
            <div className="indicator"></div>
            {Object.values(users).filter((u) => u?.online).length}/
            {Object.keys(users).length} online
          </div>

          <button onClick={handleLeave} className="primary-btn">
            <img src={OutIcon} alt="Leave" />
          </button>
        </div>

        <div
          className="room-blocks bottom-left"
          onClick={() => {
            setShowUsers(!showUsers);
            if (showChat) setShowChat(!showChat);
          }}
        >
          <img src={RoomUserIcon} alt="Members" />
          Members
        </div>

        <div
          className="room-blocks bottom-right"
          onClick={() => {
            setShowChat(!showChat);
            if (showUsers) setShowUsers(!showUsers);
          }}
        >
          <img src={ChatIcon} alt="Open Chat" /> Chat
        </div>

        {showUsers && (
          <div className="room-blocks members-list">
            <div className="member-block-title">
              <h3>Members</h3>
              <strong
                className="close"
                onClick={() => {
                  setShowUsers(!showUsers);
                }}
              >
                X
              </strong>
            </div>
            <div className="seperator"></div>
            <div className="member-list">
              {Object.entries(users).map(([id, user]) => (
                <div key={id} className="member">
                  <div className="avatar-name">
                    <div className="avatar">
                      <img src={UserIcon} alt="Img" />
                    </div>
                    <div className="name">
                      {user.name} {id === creatorId && " 👑"}
                      {id === userId && " (You)"}{" "}
                      <span>
                        {user.name && user.online
                          ? "🟢"
                          : user.name
                            ? "⚪"
                            : ""}
                      </span>
                    </div>
                  </div>

                  {isCreator && id !== userId && (
                    <div className="kick" onClick={() => kickUser(id)}>
                      <img src={OutIcon} alt="kick" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showChat && (
          <div className="room-blocks chats">
            <div className="chat-block-title">
              <h3>Chats</h3>
              <strong
                className="close"
                onClick={() => {
                  setShowChat(!showChat);
                }}
              >
                X
              </strong>
            </div>
            <div className="seperator"></div>
            <div className="chat-messages">
              {chat.map((msg, i) => (
                <div key={i}>
                  <p className="username">{msg.username}</p>
                  <p className="user-msg">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="seperator"></div>

            <div className="chat-input">
              <form onSubmit={sendMessage}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message..."
                />

                <button type="submit" className="secondary-btn">
                  <img src={SendIcon} alt="send" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Room;
