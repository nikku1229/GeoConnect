import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getSocket } from "../socket/socket";

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms/myrooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // useEffect(() => {
  //   fetchRooms();
  // }, []);

  useEffect(() => {
    fetchRooms();
    const socket = getSocket();
    if (!socket) return;
    socket.on("user_status", () => {
      fetchRooms();
    });

    return () => {
      socket.off("user_status");
    };
  }, []);

  if (rooms.length === 0) {
    return <p style={{ textAlign: "center" }}>No rooms joined yet</p>;
  }

  return (
    <div className="room-list-container">
      {rooms.map((room) => (
        <div
          key={room.roomId}
          className="room-card"
          onClick={() => navigate(`/room/${room.roomId}`)}
        >
          <div className="room-avatar">
            {room.roomName?.charAt(0).toUpperCase()}
          </div>

          <div className="room-info">
            <h3>{room.roomName}</h3>

            <p className="room-code">
              Code: <strong>{room.roomId}</strong>
            </p>

            <div className="room-stats">
              <span>👥 Members: {room.membersCount || 0}</span>
              <span>🟢 Active: {room.activeCount || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoomList;
