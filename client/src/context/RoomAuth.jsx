import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useToast } from "./ToastContext";

const RoomAuthContext = createContext();

export const RoomAuthProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  const { showToast } = useToast();

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

      if (err.response?.status !== 401 && err.response?.data?.message) {
        showToast(err.response.data.message);
      } else if (err.response?.status !== 401) {
        showToast("Failed to join room");
      }
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await API.post(`/rooms/${roomId}/leave`);
    } catch (err) {
      console.error("Leave room error:", err);
      showToast("Failed to leave room");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms/myrooms");
      setRooms(res.data);
      return res.data;
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
