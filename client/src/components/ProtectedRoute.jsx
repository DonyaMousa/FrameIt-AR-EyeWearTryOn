import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const adminToken = useAuthStore((state) => state.adminToken);
  const userToken = useAuthStore((state) => state.userToken);

  if (requireAdmin) {
    return adminToken ? children : <Navigate to="/admin/signin" replace />;
  }

  return userToken ? children : <Navigate to="/signin" replace />;
}
