import { useEffect, useRef, useState, Activity } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { useRoomAuth } from "../context/RoomAuth";
import { shouldSendLocation } from "../utils/locationThrottle";
import LeftArrowIcon from "../assets/LeftArrowIcon.svg";
import OutIcon from "../assets/OutIcon.svg";
import ChatIcon from "../assets/ChatIcon.svg";
import RoomUserIcon from "../assets/RoomUserIcon.svg";
import MapView from "../components/MapView";

const Room = () => {
  const { leaveRoom } = useRoomAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const prevLocation = useRef(null);

  const [users, setUsers] = useState({});
  const [myLocation, setMyLocation] = useState(null);

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const [showUsers, setShowUsers] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    startLocationTracking();

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("join_room", {
      roomId,
      userId,
      username,
    });

    socket.on("location_update", (data) => {
      const { userId, latitude, longitude, name } = data;

      setUsers((prev) => ({
        ...prev,
        [userId]: {
          lat: latitude,
          lng: longitude,
          name,
          online: true,
        },
      }));
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

    socket.on("user-disconnected", (userId) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    return () => {
      socket.off("location_update");
      socket.off("user_status");
      socket.off("receive_message");
      socket.off("user-disconnected");

      disconnectSocket();
    };
  }, [roomId]);

  const startLocationTracking = () => {
    navigator.geolocation.watchPosition(
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

        socketRef.current.emit("location_update", {
          userId,
          roomId,
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          name: username,
        });
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );
  };

  const sendMessage = () => {
    if (!message) return;

    socketRef.current.emit("send_message", {
      roomId,
      userId,
      username,
      message,
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
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  const handleBack = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    navigate("/dashboard");
  };

  return (
    <div className="room-container">
      <MapView users={users} myLocation={myLocation} selfId={userId} />

      <div className="room-blocks top-left">
        <button onClick={handleBack} className="primary-btn">
          <img src={LeftArrowIcon} alt="Back" />
        </button>

        <div
          className="room-id"
          onClick={() => navigator.clipboard.writeText(roomId)}
        >
          {roomId}
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

      <Activity mode={showUsers ? "visible" : "hidden"}>
        <div className="room-blocks members-list">
          {Object.entries(users).map(([id, user]) => (
            <div key={id} className="user-row">
              {user.name}

              {id === userId && " (You)"}

              <span>{user.online ? "🟢" : "⚪"}</span>
            </div>
          ))}
        </div>
      </Activity>

      <Activity mode={showChat ? "visible" : "hidden"}>
        <div className="room-blocks chats">
          <div className="chat-messages">
            {chat.map((msg, i) => (
              <div key={i}>
                <strong>{msg.username}</strong>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </Activity>

      {/* {showUsers && (
        <div className="user-panel">
          {Object.entries(users).map(([id, user]) => (
            <div key={id} className="user-row">
              {user.name}

              {id === userId && " (You)"}

              <span>{user.online ? "🟢" : "⚪"}</span>
            </div>
          ))}
        </div>
      )}

      {showChat && (
        <div className="chat-panel">
          <div className="chat-messages">
            {chat.map((msg, i) => (
              <div key={i}>
                <strong>{msg.username}</strong>

                <p>{msg.message}</p>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Room;
