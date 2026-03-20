import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_PRODUCTION_URL || import.meta.env.VITE_BACKEND_URL}/api`,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
