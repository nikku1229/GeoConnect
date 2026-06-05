import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import Toast from "../common/Toast";
import Loader from "../common/Loader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLoader } from "../../context/LoaderContext";
import LocationIcon from "../../assets/LocationIcon.svg";
import EyeIcon from "../../assets/EyeIcon.svg";
import EyeOffIcon from "../../assets/EyeOffIcon.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
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
              <div className="password-input-wrapper">
                <input
                  type={togglePassword ? "text" : "password"}
                  id="password"
                  placeholder="******"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span onClick={() => setTogglePassword(!togglePassword)}>
                  {togglePassword ? (
                    <img src={EyeOffIcon} alt="Hide Password" />
                  ) : (
                    <img src={EyeIcon} alt="Show Password" />
                  )}
                </span>
              </div>
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
