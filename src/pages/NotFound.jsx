import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Oops — that page doesn't exist.</p>
      <Link
        to="/"
        style={{
          background: "#d8b12d",
          color: "#000",
          padding: "10px 22px",
          borderRadius: "999px",
          fontWeight: 700,
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}