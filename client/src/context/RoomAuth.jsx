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

  return (
    <RoomAuthContext.Provider value={{ createRoom }}>
      {children}
    </RoomAuthContext.Provider>
  );
};

export const useRoomAuth = () => useContext(RoomAuthContext);
