import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const GuestGuard = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }
  return (
    <Outlet />
  );
};

export default GuestGuard;
