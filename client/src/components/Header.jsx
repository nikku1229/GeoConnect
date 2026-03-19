import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LocationIcon from "../assets/LocationIcon.svg";
import UserIcon from "../assets/UserIcon.svg";
import OutIcon from "../assets/OutIcon.svg";

function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <header>
        <div className="header-container">
          <div className="logo">
            <img src={LocationIcon} alt="Logo" />
            <Link to="/">
              <h2>
                Geo<span>Connect</span>
              </h2>
            </Link>
          </div>
          <div className="header-btn">
            {user && (
              <p className="user-name">
                Hi, <span>{localStorage.getItem("username")}</span>
              </p>
            )}

            {user ? (
              <>
                {location.pathname === "/" ? (
                  <>
                    <button
                      className="primary-btn dashboard-btn"
                      onClick={() => {
                        navigate("/dashboard");
                      }}
                    >
                      <img src={UserIcon} alt="DashBoard" />
                      DashBoard
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="primary-btn sign-out-btn"
                      onClick={() => {
                        logout();
                        showToast("Logout successful");
                      }}
                    >
                      <img src={OutIcon} alt="Logout" />
                      Sign out
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  className="primary-btn sign-in-btn"
                  onClick={() => navigate("/login")}
                >
                  <img src={UserIcon} alt="Login" />
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
