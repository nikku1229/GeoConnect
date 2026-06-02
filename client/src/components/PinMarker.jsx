import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

const createPinIcon = (isOwn = false) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${isOwn ? "#18c5dc" : "#ff4444"};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); color: white; font-size: 14px;">📍</span>
      </div>
    `,
    className: "custom-pin",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const PinMarker = ({ pin, isOwn, onDoubleClick }) => {
  return (
    <Marker
      position={[pin.latitude, pin.longitude]}
      icon={createPinIcon(isOwn)}
      eventHandlers={{
        dblclick: () => {
          if (isOwn) {
            onDoubleClick(pin._id);
          }
        },
      }}
    >
      <Tooltip permanent={false} direction="top" offset={[0, -20]}>
        <div style={{ textAlign: "center", maxWidth: "200px" }}>
          <strong>{pin.userName}</strong>
          {isOwn && <span style={{ color: "#18c5dc" }}> (You)</span>}
          <br />
          <span style={{ fontSize: "12px" }}>📌 {pin.comment}</span>
          {pin.locationName && (
            <>
              <br />
              <span style={{ fontSize: "10px", color: "#aaa" }}>
                📍 {pin.locationName}
              </span>
            </>
          )}
          {isOwn && (
            <div
              style={{ fontSize: "10px", color: "#ff8888", marginTop: "4px" }}
            >
              Double-click to delete
            </div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
};

export default PinMarker;
