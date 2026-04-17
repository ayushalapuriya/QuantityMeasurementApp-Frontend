import { Navigate } from "react-router-dom";
import { getToken, isGuest } from "../utils/auth";

function ProtectedRoute({ children }) {
  const token = getToken();

  // ✅ Allow if logged in OR guest
  if (!token && !isGuest()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;