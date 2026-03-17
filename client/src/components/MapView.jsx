import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";

const colors = [
  "#740A03",
  "#1B211A",
  "#52c41a",
  "#faad14",
  "#722ed1",
  "#C3110C",
  "#132440",
  "#2F5755",
  "#090040",
  "#320A6B",
  "#27391C",
  "#3C2A21",
];

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
        border:2px solid white;
      ">
        ${firstLetter}
      </div>
    `,
    className: "map-avatar",
  });
};

const AutoCenter = ({ users }) => {
  const map = useMap();
  const prevCount = useRef(0);

  useEffect(() => {
    const coords = Object.values(users)
      .filter((u) => u.lat && u.lng)
      .map((u) => [u.lat, u.lng]);

    if (coords.length === 0) return;

    if (prevCount.current !== coords.length) {
      map.fitBounds(coords, { padding: [100, 100] });
      prevCount.current = coords.length;
    }
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
  const markerRefs = useRef({});

  const firstUser = Object.values(users).find((u) => u.lat && u.lng);

  const center = myLocation ||
    (firstUser ? { lat: firstUser.lat, lng: firstUser.lng } : null) || {
      lat: 28.6139,
      lng: 77.209,
    };

  useEffect(() => {
    Object.entries(users).forEach(([id, user]) => {
      const marker = markerRefs.current[id];

      if (marker && user.lat) {
        const current = marker.getLatLng();
        const target = L.latLng(user.lat, user.lng);

        let i = 0;
        const steps = 10;

        const animate = () => {
          i++;
          const lat = current.lat + (target.lat - current.lat) * (i / steps);
          const lng = current.lng + (target.lng - current.lng) * (i / steps);

          marker.setLatLng([lat, lng]);

          if (i < steps) {
            requestAnimationFrame(animate);
          }
        };

        animate();
      }
    });
  }, [users]);

  return (
    <MapContainer
      className="map"
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="FeatureMapByNikku1229"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AutoCenter users={users} />
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        {Object.entries(users).map(([id, user], index) => {
          if (!user?.lat) return null;

          const icon = createAvatarIcon(
            user.name,
            colors[index % colors.length],
          );

          let distance = "";

          if (selfId !== id && myLocation) {
            distance =
              getDistance(myLocation, {
                lat: user.lat,
                lng: user.lng,
              }) + " km";
          }

          return (
            <Marker
              key={id}
              position={[user.lat, user.lng]}
              icon={icon}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[id] = ref;
                } else {
                  delete markerRefs.current[id];
                }
              }}
            >
              <Tooltip>
                {user.name}

                {id === selfId && " (You)"}

                {distance && ` • ${distance}`}
              </Tooltip>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;
