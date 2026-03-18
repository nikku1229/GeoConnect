import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import LocationIcon from "../assets/LocationIcon.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/forgot-password", { email });
      alert("Reset link sent to your email");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="user-form-container">
      <div className="form-title">
        <div className="title">
          <img src={LocationIcon} alt="Logo" />
          <Link to="/">
            <h1>
              Geo<span>Connect</span>
            </h1>
          </Link>
        </div>
        <p>Welcome back! Sign in to continue.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="secondary-btn">
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
