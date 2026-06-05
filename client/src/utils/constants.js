export const COLORS = [
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

export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 28.6139, lng: 77.209 },
  DEFAULT_ZOOM: 15,
  CLUSTER_RADIUS: 50,
  SEARCH_ZOOM: 20,
  DISTANCE_THRESHOLD: 10,
};

export const TOAST_DURATION = 2000;
export const SEARCH_DEBOUNCE_DELAY = 500;
export const LOCATION_WATCH_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 10000,
};

export const SOCKET_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  LOCATION_UPDATE: "location_update",
  ALL_LOCATIONS: "all_locations",
  USER_STATUS: "user_status",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  NEW_PIN: "new_pin",
  DELETE_PIN: "delete_pin",
  SEARCH_LOCATION: "search_location",
  CLEAR_SEARCH: "clear_search_location",
  KICK_USER: "kick_user",
  USER_KICKED: "user_kicked",
  ROOM_CREATOR: "room_creator",
};
