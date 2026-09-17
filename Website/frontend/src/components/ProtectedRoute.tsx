import type { ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../context";

interface ProtectedRouteProps {
  children?: ReactNode;
}
/**
 * Route Guard Component kiểm tra trạng thái xác thực của người dùng.
 * - Nếu chưa đăng nhập: chuyển hướng về /login (lưu lại URL hiện tại để redirect sau).
 * - Nếu đã đăng nhập: render component con (children) hoặc Outlet (nếu dùng dạng nested routes).
 */

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
