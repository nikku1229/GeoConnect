import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLoader } from "../context/LoaderContext";
import LocationIcon from "../assets/LocationIcon.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const { loader, setLoader } = useLoader();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoader(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      setUser(res.data.user._id);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("username", res.data.user.name);

      showToast("Login successful");
      navigate("/dashboard");
    } catch (error) {
      showToast("Login failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <Toast></Toast>
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

        {loader ? (
          <div className="user-form-loader">
            <Loader></Loader>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
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
            <Link to="/forgot-password">Forgot Password?</Link>
            <button type="submit" className="secondary-btn">
              Sign In
            </button>
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        )}
      </div>
    </>
  );
}

export default Login;
