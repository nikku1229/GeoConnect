import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function createAvatarIcon(name) {
  const colors = ["#4f46e5", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4"];

  const color = colors[Math.floor(Math.random() * colors.length)];

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background:${color};
        width:35px;
        height:35px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
      ">
        ${name ? name[0].toUpperCase() : "U"}
      </div>
    `,
  });
}

function AutoZoom({ users }) {
  const map = useMap();

  useEffect(() => {
    const locations = Object.values(users).map((user) => [user.lat, user.lng]);

    if (locations.length > 0) {
      map.fitBounds(locations);
    }
  }, [users]);

  return null;
}

export default function LiveMap({ users }) {
  const [center, setCenter] = useState([28.6139, 77.209]);

  useEffect(() => {
    const firstUser = Object.values(users)[0];
    if (firstUser) {
      setCenter([firstUser.lat, firstUser.lng]);
    }
  }, [users]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "70vh", width: "100%" }}
    >
      <AutoZoom users={users} />
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.entries(users).map(([id, user]) => (
        <Marker
          key={id}
          position={[user.lat, user.lng]}
          icon={createAvatarIcon(user.name)}
        >
          <Popup>
            <b>{user.name}</b>
            <br />
            {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
