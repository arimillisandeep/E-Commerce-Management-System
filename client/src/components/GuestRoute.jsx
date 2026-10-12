import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

// Redirects already-logged-in users away from login/register pages
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader text="Loading..." />;
  if (user) return <Navigate to={location.state?.from || '/'} replace />;
  return <Outlet />;
}
