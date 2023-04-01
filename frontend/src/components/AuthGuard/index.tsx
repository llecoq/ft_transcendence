import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Waiting from "../WaitingLogin"
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginTwoFa from '../LoginTwoFa';
import { isValidToken } from '../../contexts/JWTAuthContext';

const AuthGuard = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const temporary_42_code = searchParams.get('code');
  const [twoFaCodeVerified, setTwoFaCodeVerified] = useState(() => {
    const cookie = localStorage.getItem("accessTokenTwoFa");
    if (cookie && isValidToken(cookie))
      return (true);
    else
      return (false);
  });

  useEffect(() => {
    if (isAuthenticated && temporary_42_code) {
      searchParams.delete('code');
      setSearchParams(searchParams);
    }
  }, [isAuthenticated]);
  if (!isAuthenticated && (location.pathname !== "/" && location.pathname !== "/register" && location.pathname !== "/login" || temporary_42_code == undefined)) {
    return <Navigate replace to="/login" />;
  }
  else if (!isAuthenticated && location.pathname == "/" && temporary_42_code != undefined) {
    return (
      <Waiting />
      );
    }
  else if (isAuthenticated && user.is2FAactive && !twoFaCodeVerified ) {
    return (
      <LoginTwoFa setTwoFaCodeVerified={setTwoFaCodeVerified} />
    );
  }
  return (
    <Outlet />
  );
};
export default AuthGuard;
