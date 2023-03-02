import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";

import useAuth from "src/hooks/useAuth";
import SnackBarComponent from "../../../components/CustomSnackBar";

function ChangeUsername() {
  const { user, socket } = useAuth();
  const [usernameChangeSuccess, setUsernameChangeSuccess] = useState(false);
  const [usernameChangeFailure, setUsernameChangeFailure] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");

  const handleChangeUsername = (e) => {
    e.preventDefault();
    const newUsername = e.target[0].value;
    if (
      newUsername.length <= 4 ||
      newUsername.length > 20 ||
      !(/^[A-Za-z0-9]+$/.test(newUsername))
    ) {
      setSnackBarMsg(
        "Username must be 5 to 20 characters : letters or digits only"
      );
      setUsernameChangeFailure(true);
      return;
    }
    socket.emit("changeUsername", newUsername, (res) => {
      if (res.status == 200) {
        setSnackBarMsg("Username changed !");
				setUsernameChangeSuccess(true);
				location.reload();
      } else {
        setSnackBarMsg(res.message);
        setUsernameChangeFailure(true);
      }
    });
  };

  return (
    <>
      <Typography variant="h3">Change username</Typography>
      <Typography marginBottom={1} variant="subtitle1" paddingBottom="10px">
        5 to 20 char, letters or digits only
      </Typography>
      <form onSubmit={handleChangeUsername}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            gap: "20px",
            height: "100px",
          }}
        >
          <TextField
            id="outlined-required"
            label="Username"
            placeholder={user.username}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
          >
            Change
          </Button>
        </div>
      </form>
      {usernameChangeSuccess && (
        <SnackBarComponent
          severity="success"
          closeSnack={function () {
            setUsernameChangeSuccess(false);
          }}
          snackbarMessage={snackBarMsg}
        />
      )}
      {usernameChangeFailure && (
        <SnackBarComponent
          severity="error"
          closeSnack={function () {
            setUsernameChangeFailure(false);
          }}
          snackbarMessage={snackBarMsg}
        />
      )}
    </>
  );
}

export default ChangeUsername;
