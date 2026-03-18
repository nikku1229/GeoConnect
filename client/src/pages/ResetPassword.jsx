import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Link } from "react-router-dom";
import LocationIcon from "../assets/LocationIcon.svg";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/reset-password", {
        token,
        password,
      });

      alert("Password reset successful");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.message === "Invalid or expired token") {
        alert("Link expired. Please request again.");
      } else {
        alert(err.response?.data?.message || "Error");
      }
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
          <label htmlFor="password"></label>
          <input
            type="password"
            id="password"
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="secondary-btn">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
