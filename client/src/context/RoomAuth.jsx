import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const RoomAuthContext = createContext();

export const RoomAuthProvider = ({ children }) => {
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

  return (
    <RoomAuthContext.Provider value={{ createRoom, joinRoom }}>
      {children}
    </RoomAuthContext.Provider>
  );
};

export const useRoomAuth = () => useContext(RoomAuthContext);
