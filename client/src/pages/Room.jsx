import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { shouldSendLocation } from "../utils/locationThrottle";
import MapView from "../components/MapView";

const Room = () => {
  const { roomId } = useParams();

  const [users, setUsers] = useState({});
  const [myLocation, setMyLocation] = useState(null);

  const socketRef = useRef(null);
  const prevLocation = useRef(null);

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("join_room", {
      roomId,
      userId,
      username,
    });

    socket.on("location_update", (data) => {
      const { userId, latitude, longitude } = data;

      setUsers((prev) => ({
        ...prev,
        [userId]: {
          lat: latitude,
          lng: longitude,
        },
      }));
    });

    socket.on("user-disconnected", (userId) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    startLocationTracking();

    return () => {
      socket.off("location_update");
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

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapView users={users} myLocation={myLocation} />
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
