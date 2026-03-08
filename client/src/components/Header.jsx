import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <header>
        <div className="header-container">
          <h2>GeoConnect</h2>
          <div className="header-btn">
            {user && (
              <span style={{ marginRight: "20px" }}>
                Hi, {localStorage.getItem("username")}
              </span>
            )}
            {user ? (
              <>
                {location.pathname === "/" ? (
                  <>
                    <button
                      className="primary-btn"
                      onClick={() => {
                        navigate("/dashboard");
                      }}
                    >
                      DashBoard
                    </button>
                  </>
                ) : (
                  <>
                    <button className="primary-btn" onClick={logout}>
                      SignOut
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  className="primary-btn"
                  onClick={() => navigate("/login")}
                >
                  SignIn
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
