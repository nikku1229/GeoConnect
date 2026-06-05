import { useRef, useState, useEffect } from "react";
import { shouldSendLocation } from "../utils/locationThrottle";
import { LOCATION_WATCH_OPTIONS } from "../utils/constants";
import { useToast } from "../context/ToastContext";

export const useLocationTracking = (socketRef, roomId, userId, username) => {
  const [myLocation, setMyLocation] = useState(null);
  const prevLocation = useRef(null);
  const watchIdRef = useRef(null);
  const { showToast } = useToast();

  const startTracking = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
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

        if (!socketRef.current?.connected) return;

        socketRef.current.emit("location_update", {
          userId,
          roomId,
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          name: username,
        });
      },
      (err) => {
        console.error(err);
        showToast("Location permission denied");
      },
      LOCATION_WATCH_OPTIONS,
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  return { myLocation, startTracking, stopTracking };
};
