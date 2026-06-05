import L from "leaflet";

export const createAvatarIcon = (name, color) => {
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
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

export const createSearchIcon = () => {
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

export const createPinIcon = (isOwn = false) => {
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
