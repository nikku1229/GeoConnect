import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Link } from "react-router-dom";
import Toast from "../common/Toast"; // ✅ FIXED
import Loader from "../common/Loader"; // ✅ FIXED
import { useToast } from "../../context/ToastContext";
import { useLoader } from "../../context/LoaderContext";
import LocationIcon from "../../assets/LocationIcon.svg"; // ✅ FIXED
import EyeIcon from "../../assets/EyeIcon.svg"; // ✅ FIXED
import EyeOffIcon from "../../assets/EyeOffIcon.svg"; // ✅ FIXED

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loader, setLoader } = useLoader();

  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoader(true);

      await API.post("/auth/reset-password", {
        token,
        password,
      });

      showToast("Password reset successful");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.message === "Invalid or expired token") {
        showToast("Link expired. Please request again.");
      } else {
        showToast(err.response?.data?.message || "Error");
      }
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
          <p>Welcome back! Sign in to continue.</p>
        </div>
        {loader ? (
          <div className="user-form-loader">
            <Loader />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="password"></label>
              <div className="password-input-wrapper">
                <input
                  type={togglePassword ? "text" : "password"}
                  id="password"
                  placeholder="New password"
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
              Reset Password
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ResetPassword;
