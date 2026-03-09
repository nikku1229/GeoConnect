import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ users, myLocation }) => {
  const center = myLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%" }}>
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.entries(users).map(([id, location]) => (
        <Marker key={id} position={[location.lat, location.lng]} />
      ))}
    </MapContainer>
  );
};

export default MapView;