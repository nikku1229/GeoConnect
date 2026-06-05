import { useState, useCallback } from "react";
import { pinApi } from "../services/pinApi";
import { useToast } from "../context/ToastContext";

export const usePins = (roomId, socketRef) => {
  const [pins, setPins] = useState([]);
  const [isMapPickMode, setIsMapPickMode] = useState(false);
  const [pendingPinComment, setPendingPinComment] = useState("");
  const { showToast } = useToast();

  const fetchPins = useCallback(async () => {
    try {
      const res = await pinApi.getRoomPins(roomId);
      setPins(res.data);
    } catch (err) {
      console.error("Fetch pins error:", err);
    }
  }, [roomId]);

  const addPin = useCallback(
    async (pinData) => {
      try {
        const res = await pinApi.createPin({ roomId, ...pinData });

        if (socketRef.current?.connected) {
          socketRef.current.emit("new_pin", { roomId, pin: pinData });
        }

        setPins((prev) => [res.data, ...prev]);
        showToast("Pin added successfully");
        return res.data;
      } catch (err) {
        showToast("Failed to add pin");
        throw err;
      }
    },
    [roomId, socketRef, showToast, userId, username],
  );

  const deletePin = useCallback(
    async (pinId) => {
      try {
        await pinApi.deletePin(pinId);
        setPins((prev) => prev.filter((p) => p._id !== pinId));

        if (socketRef.current) {
          socketRef.current.emit("delete_pin", { roomId, pinId });
        }

        showToast("Pin deleted successfully");
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to delete pin");
      }
    },
    [roomId, socketRef, showToast],
  );

  const enableMapPickMode = useCallback(
    (comment) => {
      setPendingPinComment(comment);
      setIsMapPickMode(true);
      showToast("Click anywhere on the map to place your pin");
    },
    [showToast],
  );

  const handleMapClick = useCallback(
    async (lat, lng) => {
      if (!isMapPickMode) return;
      if (!pendingPinComment) {
        showToast("Please enter a comment first");
        setIsMapPickMode(false);
        return;
      }

      await addPin({
        comment: pendingPinComment,
        latitude: lat,
        longitude: lng,
        locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });

      setIsMapPickMode(false);
      setPendingPinComment("");
    },
    [isMapPickMode, pendingPinComment, addPin, showToast],
  );

  return {
    pins,
    setPins,
    isMapPickMode,
    pendingPinComment,
    fetchPins,
    addPin,
    deletePin,
    enableMapPickMode,
    handleMapClick,
    setIsMapPickMode,
  };
};
