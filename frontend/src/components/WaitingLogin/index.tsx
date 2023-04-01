import { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';



function SuspenseLoader() {
  const [backToLogin, setBackToLogin]: any = useState(false);
  const [errorMsg, seterrorMsg]: any = useState("");
  const temporary_42_code = new URLSearchParams(location.search).get('code');
  const { isAuthenticated, login42Method } = useAuth();

  AsynLogincall();

  async function AsynLogincall() {
    if (!isAuthenticated && location.pathname == "/" && temporary_42_code != undefined) {
      try {
        const res = await login42Method(temporary_42_code);
        if (+res.status != 200)
        {
          seterrorMsg(res.message)
          setBackToLogin(true)
        }
      } catch (err) {
        seterrorMsg(err)
        setBackToLogin(true)
        console.error(err);
      }
    }
  }
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {(backToLogin && !isAuthenticated) ?
        <Navigate replace to={"/login?ErrorMsgReload=" + errorMsg} /> :
        <Box sx={{
          position: 'fixed',
          left: 0,
          top: 100,
          width: '100%',
          height: '100%'
        }}
          display="flex"
          alignItems="center"
          justifyContent="center">
          <Typography variant={"h2"}>
            Trying to log with 42 API...
          </Typography>
          <CircularProgress sx={{ marginLeft: "20px" }} size={64} disableShrink thickness={3} />
        </Box>
      }
    </Box>
  );
}

export default SuspenseLoader;

