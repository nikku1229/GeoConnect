import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RoomAuthProvider } from "./context/RoomAuth.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RoomAuthProvider>
      <App />
    </RoomAuthProvider>
  </AuthProvider>,
);
