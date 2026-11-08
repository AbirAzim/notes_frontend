import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

export function RequireAuth() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RequireAdmin() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/notes" replace />;
}
