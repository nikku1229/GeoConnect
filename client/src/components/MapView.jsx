import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const colors = ["#ff4d4f", "#1890ff", "#52c41a", "#faad14", "#722ed1"];

const createAvatarIcon = (name, color) => {
  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";

  return L.divIcon({
    html: `
      <div style="
        background:${color};
        width:40px;
        height:40px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        font-size:16px;
        border:3px solid white;
      ">
        ${firstLetter}
      </div>
    `,
    className: "",
  });
};

const AutoCenter = ({ users }) => {
  const map = useMap();

  useEffect(() => {
    const coords = Object.values(users)
      .filter((u) => u.lat && u.lng)
      .map((u) => [u.lat, u.lng]);

    if (coords.length === 0) return;

    map.fitBounds(coords, { padding: [100, 100] });
  }, [users]);

  return null;
};

const getDistance = (a, b) => {
  const R = 6371e3;

  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;

  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;

  const x =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return ((R * y) / 1000).toFixed(2);
};

const MapView = ({ users, myLocation, selfId }) => {
  const center = myLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AutoCenter users={users} />

      {Object.entries(users).map(([id, user], index) => {
        if (!user?.lat) return null;

        const icon = createAvatarIcon(user.name, colors[index % colors.length]);

        let distance = "";

        if (selfId !== id && myLocation) {
          distance =
            getDistance(myLocation, {
              lat: user.lat,
              lng: user.lng,
            }) + " km";
        }

        return (
          <Marker key={id} position={[user.lat, user.lng]} icon={icon}>
            <Tooltip>
              {user.name}

              {id === selfId && " (You)"}

              {distance && ` • ${distance}`}
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;

// import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const MapView = ({ users, myLocation }) => {
//   const center = myLocation || { lat: 20.5937, lng: 78.9629 };

//   return (
//     <MapContainer center={center} zoom={15} style={{ height: "100%" }}>
//       <TileLayer
//         attribution="OpenStreetMap"
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {Object.entries(users).map(([id, location]) => (
//         <Marker key={id} position={[location.lat, location.lng]} />
//       ))}
//     </MapContainer>
//   );
// };

// export default MapView;
