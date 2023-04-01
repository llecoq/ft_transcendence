import { createContext, useEffect, useReducer, useState } from "react";
import jwtDecode from "jwt-decode";
import SuspenseLoader from "src/components/SuspenseLoader";
import socketIOClient from "socket.io-client";
import { useSnackbar } from "notistack";

import axios from "axios";
import { any, number, string } from "prop-types";
import { setSessionTwoFa } from "../components/LoginTwoFa";

const initialAuthState = {
  isAuthenticated: false,
  isInitialised: false,
  isFirstConnect: false,
  user: null,
  socket: null,
};

export interface decodedToken {
  exp: DoubleRange;
  iat: DoubleRange;
  id: DoubleRange;
}

export const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  const decoded: decodedToken = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

export const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALISE": {
      const { isAuthenticated, user, socket} = action.payload;

      return {
        ...state,
        isAuthenticated,
        isFirstConnect : false,
        isInitialised: true,
        user,
        socket,
      };
    }
    case "LOGIN": {
      const { user, socket, isFirstConnect } = action.payload;
      return {
        ...state,
        isFirstConnect,
        isAuthenticated: true,
        user,
        socket,
      };
    }
    case "LOGOUT": {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }
    case "REGISTER": {
      const { user, socket, isFirstConnect } = action.payload;

      return {
        ...state,
        isFirstConnect,
        isAuthenticated: true,
        user,
        socket,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialAuthState,
  method: "JWT",
  login42Method: (code: string) =>
    Promise.resolve({ status: number, message: string }),
  logout: () => {},
  registerFormMethod: (email: string, password: string, username: string) =>
    Promise.resolve({ status: number, message: string }),
  loginFormMethod: (email: string, password: string) =>
    Promise.resolve({ status: number, message: string }),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onConnectOrDisconnectManagment = (socket) => {
    var snack;
    socket.on("connect", () => {
      if (snack) {
        closeSnackbar(snack);
        snack = undefined;
        window.location.reload();
      }
    });

    // Handling token expiration and deconnections
    socket.on("connect_error", (error) => {
      console.error({ debug: "NEW SOCKET CONNECT ERROR", error: error });
      if (socket.disconnected) {
        if (!snack) {
          snack = enqueueSnackbar(
            "La connexion au serveur est perdue. Tentative de reconnexion",
            {
              variant: "error",
              preventDuplicate: true,
              persist: true,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
            }
          );
        }
      }
    });
  };

  const registerFormMethod = async (email, password, username) => {
    try {
      const response = await axios.post(
        "https://"+ process.env.REACT_APP_BACKEND_IP +":8080/auth/formRegister",
        {
          email,
          password,
          username,
          is2FAactive: false,
        }
      );
      if (!response.data || response.data.status != 200) return response.data;
      const { accessToken, avatar, xp } = response.data.data;
      setSession(accessToken);
      const socket = await socketIOClient("https://"+ process.env.REACT_APP_BACKEND_IP +":8080", {
        transports: ["websocket"],
        auth: { token: `Bearer ${accessToken}`, accessToken: accessToken },
      });
      const jwtDecoded: decodedToken = jwtDecode(accessToken);
      if (isValidToken(accessToken)) {
        onConnectOrDisconnectManagment(socket);
        dispatch({
          type: "REGISTER",
          payload: {
            isFirstConnect : true,
            user: { email, avatar, username, id: jwtDecoded.id, xp },
            socket,
          },
        });
      } else window.location.reload();
      socket.emit("usersNotify");
      return response.data;
    } catch (err) {
      return {
        message: "Server unreachable. Please try again later.",
        status: 400,
      };
    }
  };

  //=================================================================================
  //useAuth() calls this methods, returning the PAYLOAD -> user and socket
  const loginFormMethod = async (
    email: string,
    password: string
  ): Promise<{ message; status }> => {
    try {
      const response = await axios.post(
        "https://"+ process.env.REACT_APP_BACKEND_IP +":8080/auth/formLogin",
        {
          email,
          password,
        }
      );
      if (!response.data || response.data.status != 200) return response.data;
      const { accessToken, avatar, username, xp, is2FAactive } =
        response.data.data;
      setSession(accessToken);
      //create socket one user logged in successfully
      const socket = await socketIOClient("https://"+ process.env.REACT_APP_BACKEND_IP +":8080", {
        transports: ["websocket"],
        auth: { token: `Bearer ${accessToken}`, accessToken: accessToken },
      });
      const jwtDecoded: decodedToken = jwtDecode(accessToken);
      //isValidToken just checks expiration date
      if (isValidToken(accessToken)) {
        onConnectOrDisconnectManagment(socket);
        dispatch({
          type: "LOGIN",
          isFirstConnect : false,
          payload: {
            user: { email, avatar, username, id: jwtDecoded.id, xp, is2FAactive},
            socket,
          },
        });
      } else window.location.reload();
      socket.emit("usersNotify");
      return response.data;
    } catch (err) {
      return {
        message: "Server unreachable. Please try again later.",
        status: 400,
      };
    }
  };

  const login42Method = async (code: string) => {
    try {
      const response = await axios.get(
        "https://"+ process.env.REACT_APP_BACKEND_IP +":8080/auth/42auth?code=" + code
      );
      if (response.data.status != 200) 
      return {
        message: response.data.data,
        status: response.data.status,
      }
      const { username, accessToken, email, avatar, xp, is2FAactive, isFirstConnect } = response.data.data;
      const jwtDecoded: decodedToken = jwtDecode(accessToken);
      const user = {
        id: jwtDecoded.id,
        username: username,
        email: email,
        avatar: avatar,
        is2FAactive: is2FAactive,
        secretOf2FA: "",
        xp: xp,
      };
      setSession(accessToken);
      const socket = await socketIOClient("https://"+ process.env.REACT_APP_BACKEND_IP +":8080", {
        transports: ["websocket"],
        auth: { token: `Bearer ${accessToken}`, accessToken: accessToken },
      });

      if (isValidToken(accessToken)) {
        onConnectOrDisconnectManagment(socket);
        dispatch({
          type: "LOGIN",
          payload: {
            isFirstConnect,
            user,
            socket,
          },
        });
      } else window.location.reload();
      socket.emit("usersNotify");
      return response.data;
    } catch (err) {
      return {
        message: "Server unreachable. Please try again later.",
        status: 400,
        err,
      };
    }
  };

  const logout = () => {
    setSession(null);
    setSessionTwoFa(null);
    dispatch({ type: "LOGOUT" });
    window.location.reload();
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
          const jwtDecoded: decodedToken = jwtDecode(accessToken);
          const response = await axios.get(
            "https://"+ process.env.REACT_APP_BACKEND_IP +":8080/users/" + jwtDecoded.id
          ); //secret token is in config.headers['authorization'] / use axios here to verify the login of user
          if (!response.data) {
            logout();
            window.location.replace("/login");
            return;
          }
          const user = response.data;
          const socket = await socketIOClient("https://"+ process.env.REACT_APP_BACKEND_IP +":8080", {
            transports: ["websocket"],
            auth: { token: `Bearer ${accessToken}`, accessToken: accessToken },
          });
          onConnectOrDisconnectManagment(socket);
          socket.emit("usersNotify");

          dispatch({
            type: "INITIALISE",
            payload: {
              isAuthenticated: true,
              isFirstConnect : false,
              user,
              socket,
            },
          });
        } else {
          dispatch({
            type: "INITIALISE",
            payload: {
              isAuthenticated: false,
              isFirstConnect : false,
              user: null,
              socket: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALISE",
          payload: {
            isAuthenticated: false,
            isFirstConnect : false,
            user: null,
            socket: null,
          },
        });
      }
    };

    initialise();
  }, []);

  if (!state.isInitialised) {
    return <SuspenseLoader />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login42Method,
        loginFormMethod,
        registerFormMethod,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
