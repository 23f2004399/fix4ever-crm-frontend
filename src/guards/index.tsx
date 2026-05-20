import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

/** Redirects to /login if user is not authenticated */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirects to /login if not authenticated, or /unauthorized if not admin/super_admin */
export function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "super_admin")
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

/** CRM Manager route — allows crm_manager role or admin */
export function CrmRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const allowed =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    (user?.roles ?? []).includes("crm_manager");
  if (!allowed) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

/** Regional Manager route — allows regional_manager role or admin */
export function RegionalRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const allowed =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    (user?.roles ?? []).includes("regional_manager");
  if (!allowed) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

/** Route accessible to any authenticated admin-type user */
export function AnyRoleRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const hasRole =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    (user?.roles ?? []).length > 0;
  if (!hasRole) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
