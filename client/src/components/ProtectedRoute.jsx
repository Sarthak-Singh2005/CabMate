import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function ProtectedRoute({ children }) {
  const userId = useCurrentUser();
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}