import { Navigate, Outlet } from 'react-router-dom';

/**
 * Route guard for Admin protected routes.
 * 1. Checks for authentication token in localStorage -> redirects to /login if missing.
 * 2. Checks for role === "ADMIN" -> redirects to /not-authorized if insufficient.
 * 3. Renders <Outlet /> for authorized administrators.
 */
export const AdminRoute = () => {
  // ADAPT: Retrieve token from your token key (e.g. 'token', 'it_admin_token', or AuthContext)
  const token = localStorage.getItem('token') || localStorage.getItem('it_admin_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ADAPT: Extract user role from localStorage or AuthContext
  let role = null;
  try {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('it_admin_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      role = parsed?.role;
    } else {
      role = localStorage.getItem('role');
    }
  } catch {
    role = null;
  }

  // ADAPT: Compare role against 'ADMIN' (case-insensitive for safety with backend representations)
  const isAdmin = role && typeof role === 'string' && role.toUpperCase() === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
