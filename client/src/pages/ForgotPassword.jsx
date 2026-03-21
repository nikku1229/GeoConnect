import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { useLoader } from "../context/LoaderContext";
import LocationIcon from "../assets/LocationIcon.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();
  const { loader, setLoader } = useLoader();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoader(true);

      await API.post("/auth/forgot-password", { email });
      showToast("Reset link sent to your email");
    } catch (err) {
      showToast(err.response?.data?.message || "Error");
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
        )}
      </div>
    </>
  );
};

export default ForgotPassword;
