import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const RoomAuthContext = createContext();

export const RoomAuthProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  const createRoom = async (roomName, password) => {
    try {
      const res = await API.post("/rooms/create", {
        roomName,
        password,
      });

      window.location.href = `/room/${res.data.roomId}`;
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async (roomId, password) => {
    try {
      const res = await API.post("/rooms/join", {
        roomId,
        password,
      });

      window.location.href = `/room/${res.data.roomId}`;
    } catch (err) {
      console.error("Join room error:", err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to join room");
      }
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await API.post(`/rooms/${roomId}/leave`);
    } catch (err) {
      console.error("Leave room error:", err);
      alert("Failed to leave room");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms/myrooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  return (
    <RoomAuthContext.Provider
      value={{ createRoom, joinRoom, leaveRoom, fetchRooms, rooms, setRooms }}
    >
      {children}
    </RoomAuthContext.Provider>
  );
};

export const useRoomAuth = () => useContext(RoomAuthContext);
