import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import AutoCenter from "./AutoCenter";
import MapClickHandler from "./MapClickHandler";
import PinMarker from "./PinMarker";
import { createAvatarIcon, createSearchIcon } from "./markers/iconHelpers";
import { COLORS, MAP_CONFIG } from "../../utils/constants";
import { getDistance } from "../../utils/distance";

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
  const searchIcon = createSearchIcon();

  const firstUser = Object.values(users).find((u) => u.lat && u.lng);
  const center =
    sharedSearchLocation?.location ||
    myLocation ||
    (firstUser ? { lat: firstUser.lat, lng: firstUser.lng } : null) ||
    MAP_CONFIG.DEFAULT_CENTER;

  let sharedDistance = null;
  if (sharedSearchLocation && myLocation) {
    sharedDistance = getDistance(myLocation, {
      lat: sharedSearchLocation.location.lat,
      lng: sharedSearchLocation.location.lng,
    });
  }

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
            COLORS[index % COLORS.length],
          );
          let distance = "";
          if (selfId !== id && myLocation) {
            distance =
              getDistance(myLocation, { lat: user.lat, lng: user.lng }) + " km";
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
              <strong>
                Searched by:{" "}
                {sharedSearchLocation.searchedBy ||
                  sharedSearchLocation.username}
              </strong>
              <br />
              <span>{sharedSearchLocation.location.name.split(",")[0]}</span>
              {sharedDistance && (
                <>
                  <br />
                  <span>{sharedDistance} km from you</span>
                </>
              )}
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
