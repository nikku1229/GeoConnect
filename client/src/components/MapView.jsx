import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import PinMarker from "./PinMarker";

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

// Custom search marker icon
const createSearchIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #ff9800;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid white;
        box-shadow: 0 0 15px rgba(255, 152, 0, 0.8);
        animation: pulse 1.5s infinite;
      ">
        <span style="font-size: 18px;">🔍</span>
      </div>
    `,
    className: "search-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createAvatarIcon = (name, color) => {
  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";
  return L.divIcon({
    html: `
      <div style="
        background:${color};
        width:42px;
        height:42px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        font-size:16px;
        border:2px solid rgba(255,255,255,0.8);
        box-shadow:0 0 15px ${color};
        backdrop-filter: blur(10px);
      ">
        ${firstLetter}
      </div>
    `,
    className: "map-avatar",
  });
};

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

const MapView = ({
  users,
  myLocation,
  selfId,
  pins = [],
  onDeletePin,
  onMapClick,
  isMapPickMode = false,
  sharedSearchLocation = null,
}) => {
  const markerRefs = useRef({});
  const searchIcon = createSearchIcon();

  const firstUser = Object.values(users).find((u) => u.lat && u.lng);
  const center = sharedSearchLocation?.location ||
    myLocation ||
    (firstUser ? { lat: firstUser.lat, lng: firstUser.lng } : null) || {
      lat: 28.6139,
      lng: 77.209,
    };

  let sharedDistance = null;
  if (sharedSearchLocation && myLocation) {
    sharedDistance = getDistance(myLocation, {
      lat: sharedSearchLocation.location.lat,
      lng: sharedSearchLocation.location.lng,
    });
  }

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
          if (i < steps) requestAnimationFrame(animate);
        };
        animate();
      }
    });
  }, [users]);

  return (
    <MapContainer
      className="map"
      center={center}
      zoom={sharedSearchLocation ? 20 : 15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors & Stadia Maps"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <AutoCenter users={users} sharedSearchLocation={sharedSearchLocation} />
      <MapClickHandler isMapPickMode={isMapPickMode} onMapClick={onMapClick} />

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
              getDistance(myLocation, { lat: user.lat, lng: user.lng }) + " km";
          }
          return (
            <Marker
              key={id}
              position={[user.lat, user.lng]}
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current[id] = ref;
                else delete markerRefs.current[id];
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

      {pins.map((pin) => (
        <PinMarker
          key={pin._id}
          pin={pin}
          isOwn={pin.userId === selfId}
          onDoubleClick={onDeletePin}
        />
      ))}

      {sharedSearchLocation && (
        <Marker
          position={[
            sharedSearchLocation.location.lat,
            sharedSearchLocation.location.lng,
          ]}
          icon={searchIcon}
        >
          <Tooltip permanent={false} direction="top" offset={[0, -20]}>
            <div className="search-marker-tooltip">
              <strong>Searched by: {sharedSearchLocation.searchedBy}</strong>
              <br />
              <span>{sharedSearchLocation.location.name.split(",")[0]}</span>
              {sharedDistance && (
                <>
                  <br />
                  <span>{sharedDistance} km from you</span>
                </>
              )}
              <br />
            </div>
          </Tooltip>
        </Marker>
      )}

      {isMapPickMode && (
        <div className="map-pick-overlay">
          <div className="map-pick-banner">
            📍 Click anywhere on the map to place a pin
            <button onClick={() => onMapClick?.cancel?.()}>Cancel</button>
          </div>
        </div>
      )}
    </MapContainer>
  );
};

export default MapView;
