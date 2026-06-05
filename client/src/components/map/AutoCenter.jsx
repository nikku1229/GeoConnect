import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

const AutoCenter = ({ users, sharedSearchLocation }) => {
  const map = useMap();
  const prevCount = useRef(0);
  const prevSearch = useRef(null);

  useEffect(() => {
    if (sharedSearchLocation) {
      if (prevSearch.current !== sharedSearchLocation.location.name) {
        map.setView(
          [
            sharedSearchLocation.location.lat,
            sharedSearchLocation.location.lng,
          ],
          13,
        );
        prevSearch.current = sharedSearchLocation.location.name;
      }
      return;
    }

    const coords = Object.values(users)
      .filter((u) => u.lat && u.lng)
      .map((u) => [u.lat, u.lng]);

    if (coords.length === 0) return;

    if (prevCount.current !== coords.length) {
      map.fitBounds(coords, { padding: [100, 100] });
      prevCount.current = coords.length;
    }
  }, [users, map, sharedSearchLocation]);

  return null;
};

export default AutoCenter;
