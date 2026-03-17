import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { useRoomAuth } from "../context/RoomAuth";
import MapView from "../components/MapView";
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

  const socketRef = useRef(null);
  const prevLocation = useRef(null);

  const [users, setUsers] = useState({});
  const [creatorId, setCreatorId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const [showUsers, setShowUsers] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const isCreator = creatorId && creatorId === userId;
  const watchIdRef = useRef(null);

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

    socket.on("room_creator", ({ creatorId }) => {
      setCreatorId(creatorId);
    });

    socket.on("user_kicked", () => {
      alert("You were kicked from the room");

      socketRef.current.disconnect();

      navigate("/dashboard");
    });

    return () => {
      if (!socketRef.current) return;

      socketRef.current.off("location_update");
      socketRef.current.off("user_status");
      socketRef.current.off("receive_message");
      socketRef.current.off("user-disconnected");
      socketRef.current.off("user_kicked");
      socketRef.current.off("room_creator");

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

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (!socketRef.current) return;

      socketRef.current.off("location_update");
      socketRef.current.off("user_status");
      socketRef.current.off("receive_message");
      socketRef.current.off("user-disconnected");
      socketRef.current.off("user_kicked");
      socketRef.current.off("room_creator");

      disconnectSocket();
    };
  };

  const sendMessage = (e) => {
    e.preventDefault();
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

  const kickUser = (targetId) => {
    socketRef.current.emit("kick_user", {
      roomId,
      targetUserId: targetId,
    });
  };

  return (
    <>
      <MapView users={users} myLocation={myLocation} selfId={userId} />
      <div className="room-container">
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
