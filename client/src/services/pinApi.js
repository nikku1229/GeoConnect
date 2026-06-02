import API from "./api";

export const pinApi = {
  getRoomPins: (roomId) => API.get(`/pins/room/${roomId}`),
  createPin: (data) => API.post("/pins/create", data),
  deletePin: (pinId) => API.delete(`/pins/${pinId}`),
};
