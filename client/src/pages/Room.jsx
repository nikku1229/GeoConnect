import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import LiveMap from "../components/LiveMap";
import UserSidebar from "../components/UserSidebar";

function Room() {
  const [users, setUsers] = useState({});
  const { roomId } = useParams();

  const copyRoomLink = () => {
    const link = window.location.href;

    navigator.clipboard.writeText(link);

    alert("Room link copied!");
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username") || "User";

    socket.emit("join_room", {
      roomId,
      userId,
      username,
    });
  }, [roomId]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username") || "User";

    navigator.geolocation.watchPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      socket.emit("location_update", {
        userId,
        roomId,
        latitude,
        longitude,
        name: username,
      });
    });
  }, [roomId]);

  useEffect(() => {
    socket.on("location_update", (data) => {
      setUsers((prev) => ({
        ...prev,
        [data.userId]: {
          lat: data.latitude,
          lng: data.longitude,
          name: data.name,
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

    return () => {
      socket.off("location_update");
      socket.off("user-disconnected");
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar users={users} />

      <div style={{ flex: 1 }}>
        <h1>Room ID: {roomId}</h1>
        <button onClick={copyRoomLink}>Copy Invite Link</button>

        <h3>Users in Room: {Object.keys(users).length}</h3>

        <LiveMap users={users} />
      </div>
    </div>
  );
}

export default Room;
