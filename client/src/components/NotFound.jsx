import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>
        <h2>Page Not Found</h2>

        <p>
          Sorry, the page you are looking for doesn't exist or may have been
          moved.
        </p>

        <Link to="/rides" className="createbutton">
          Back to Home
        </Link>
      </div>
    </div>
  );
}