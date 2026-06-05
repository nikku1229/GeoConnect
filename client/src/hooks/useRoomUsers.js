import { useState, useCallback } from "react";

export const useRoomUsers = (userId) => {
  const [users, setUsers] = useState({});
  const [creatorId, setCreatorId] = useState(null);
  const [showUsers, setShowUsers] = useState(false);

  const updateUserLocation = useCallback(
    ({ userId, latitude, longitude, name }) => {
      setUsers((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], lat: latitude, lng: longitude, name },
      }));
    },
    [],
  );

  const setAllLocations = useCallback((locations) => {
    setUsers((prev) => {
      const updated = { ...prev };
      locations.forEach((loc) => {
        updated[loc.userId] = {
          ...updated[loc.userId],
          lat: loc.latitude,
          lng: loc.longitude,
          name: loc.name,
          online: loc.online,
        };
      });
      return updated;
    });
  }, []);

  const updateUserStatus = useCallback(({ userId, status }) => {
    setUsers((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], online: status === "online" },
    }));
  }, []);

  const removeUser = useCallback((userId) => {
    setUsers((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  }, []);

  const isCreator = creatorId === userId;

  return {
    users,
    setUsers,
    creatorId,
    setCreatorId,
    showUsers,
    setShowUsers,
    isCreator,
    updateUserLocation,
    setAllLocations,
    updateUserStatus,
    removeUser,
  };
};
