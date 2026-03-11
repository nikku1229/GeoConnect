import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import AddIcon from "../assets/AddIcon.svg";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="container">
        <Header />
        <div className="home-container">
          <h1>
            Geo<span>Connect</span>
          </h1>

          <p>
            Share your live location with family & friends. <br /> Create
            private rooms, track distances, and stay connected on every trip.
          </p>

          <button
            className="secondary-btn"
            onClick={() => {
              user ? navigate("/dashboard") : navigate("/login");
            }}
          >
            <img src={AddIcon} alt="Add" />
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
