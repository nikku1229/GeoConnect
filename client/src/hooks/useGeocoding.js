import { useState, useCallback } from "react";
import { useToast } from "../context/ToastContext";

export const useGeocoding = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { showToast } = useToast();

  const searchLocation = useCallback(
    async (query) => {
      if (!query || query.length < 3) {
        showToast("Please enter at least 3 characters");
        return null;
      }

      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        );
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Search error:", err);
        showToast("Search failed");
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [showToast],
  );

  const getLocationDetails = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      return await res.json();
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return null;
    }
  }, []);

  return { searchLocation, getLocationDetails, isSearching };
};
