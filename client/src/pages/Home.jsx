import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="home-container">
        <h1>GeoConnect</h1>

        <p>
          Share your live location with family & friends. Create private rooms,
          track distances, and stay connected on every trip.
        </p>

        <Link to="/login">
          <button
            className="secondary-btn"
            onClick={() => {
              user ? navigate("/dashboard") : navigate("/login");
            }}
          >
            Get Started
          </button>
        </Link>
      </div>
    </>
  );
}

export default Home;
