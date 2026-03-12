import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import LocationIcon from "../assets/LocationIcon.svg";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful");

      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
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
        <p>Create your account to get started.</p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Nitish Sharma"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="email@example.com"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="******"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="secondary-btn">
          Create Account
        </button>
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
