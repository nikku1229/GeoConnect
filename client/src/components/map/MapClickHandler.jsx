import { useMapEvents } from "react-leaflet";

const MapClickHandler = ({ isMapPickMode, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (isMapPickMode && onMapClick) {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      }
    },
  });
  return null;
};

export default MapClickHandler;
