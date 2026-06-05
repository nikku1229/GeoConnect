import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import Toast from "../common/Toast"; // ✅ FIXED
import Loader from "../common/Loader"; // ✅ FIXED
import { useToast } from "../../context/ToastContext";
import { useLoader } from "../../context/LoaderContext";
import LocationIcon from "../../assets/LocationIcon.svg"; // ✅ FIXED
import EyeIcon from "../../assets/EyeIcon.svg"; // ✅ FIXED
import EyeOffIcon from "../../assets/EyeOffIcon.svg"; // ✅ FIXED

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loader, setLoader } = useLoader();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoader(true);

      const res = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      showToast("Registration successful");
      navigate("/login");
    } catch (error) {
      showToast("Registration Failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <Toast />
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

        {loader ? (
          <div className="user-form-loader">
            <Loader />
          </div>
        ) : (
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

            <button type="submit" className="secondary-btn">
              Create Account
            </button>
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </>
  );
}

export default Register;
