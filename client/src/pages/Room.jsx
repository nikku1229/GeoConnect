import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { useRoomAuth } from "../context/RoomAuth";
import { shouldSendLocation } from "../utils/locationThrottle";
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

  // return (
  //   <div style={{ height: "100vh", width: "100%" }}>
  //     <MapView users={users} myLocation={myLocation} />
  //   </div>
  // );

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapView users={users} myLocation={myLocation} selfId={userId} />

      {/* TOP LEFT */}

      <div className="room-top-left">
        <button onClick={handleBack}>Back</button>

        <div>Room: {roomId}</div>

        <button onClick={() => navigator.clipboard.writeText(roomId)}>
          Copy
        </button>
      </div>

      {/* TOP RIGHT */}

      <div className="room-top-right">
        <div>
          Active:
          {Object.values(users).filter((u) => u?.online).length}/
          {Object.keys(users).length}
        </div>

        <button onClick={handleLeave}>Leave</button>
      </div>

      {/* USER LIST */}

      {showUsers && (
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

      {/* CHAT */}

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
      )}

      {/* BOTTOM LEFT */}

      <button className="toggle-users" onClick={() => setShowUsers(!showUsers)}>
        Users
      </button>

      {/* BOTTOM RIGHT */}

      <button className="toggle-chat" onClick={() => setShowChat(!showChat)}>
        Chat
      </button>
    </div>
  );
};

export default Room;

// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import socket from "../socket/socket";
// import LiveMap from "../components/LiveMap";
// import UserSidebar from "../components/UserSidebar";

// function Room() {
//   const [users, setUsers] = useState({});
//   const { roomId } = useParams();

//   const copyRoomLink = () => {
//     const link = window.location.href;

//     navigator.clipboard.writeText(link);

//     alert("Room link copied!");
//   };

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");
//     const username = localStorage.getItem("username") || "User";

//     socket.emit("join_room", {
//       roomId,
//       userId,
//       username,
//     });
//   }, [roomId]);

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");
//     const username = localStorage.getItem("username") || "User";

//     navigator.geolocation.watchPosition((position) => {
//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;

//       socket.emit("location_update", {
//         userId,
//         roomId,
//         latitude,
//         longitude,
//         name: username,
//       });
//     });
//   }, [roomId]);

//   useEffect(() => {
//     socket.on("location_update", (data) => {
//       setUsers((prev) => ({
//         ...prev,
//         [data.userId]: {
//           lat: data.latitude,
//           lng: data.longitude,
//           name: data.name,
//         },
//       }));
//     });

//     socket.on("user-disconnected", (userId) => {
//       setUsers((prev) => {
//         const updated = { ...prev };
//         delete updated[userId];
//         return updated;
//       });
//     });

//     return () => {
//       socket.off("location_update");
//       socket.off("user-disconnected");
//     };
//   }, []);

//   return (
//     <div style={{ display: "flex" }}>
//       <UserSidebar users={users} />

//       <div style={{ flex: 1 }}>
//         <h1>Room ID: {roomId}</h1>
//         <button onClick={copyRoomLink}>Copy Invite Link</button>

//         <h3>Users in Room: {Object.keys(users).length}</h3>

//         <LiveMap users={users} />
//       </div>
//     </div>
//   );
// }

// export default Room;
