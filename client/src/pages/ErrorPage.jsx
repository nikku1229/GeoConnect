import { Link } from "react-router-dom";
import Header from "../components/Header";
import AlertIcon from "../assets/AlertIcon.svg";

function ErrorPage() {
  return (
    <>
      <Header></Header>
      <div className="error-page-container">
        <img src={AlertIcon} alt="Alert" />
        <h2>Page Not Found</h2>
        <Link className="secondary-btn alert-page-btn" to="/">
          Back to Home
        </Link>
      </div>
    </>
  );
}

export default ErrorPage;
