import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

const createPinIcon = (isOwn = false) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${isOwn ? "#18c5dc" : "#ff4444"};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 1px solid white;
      ">
        <span style="transform: rotate(45deg); color: white; font-size: 10px;">📍</span>
      </div>
    `,
    className: "custom-pin",
    iconSize: [24, 24],
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
        <div className="pin-marker-comment-tooltip">
          <strong>
            {pin.userName || pin.username || "Unknown"}
            {isOwn && <span> (You)</span>}
          </strong>
          <br />
          <span>{pin.comment}</span>

          {isOwn && <div className="note">Double-click to delete</div>}
        </div>
      </Tooltip>
    </Marker>
  );
};

export default PinMarker;
