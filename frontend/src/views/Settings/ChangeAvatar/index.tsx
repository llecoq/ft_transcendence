import { Alert, Avatar, Box, Button, Typography } from "@mui/material";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import SnackBarComponent from "../../../components/CustomSnackBar";
import useAuth from "../../../hooks/useAuth";

const ChangeAvatar = () => {
  const { user, socket } = useAuth();
  const [avatarChangeFailure, setAvatarChangeFailure] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");

  const handleFileReception = async (e) => {
    const userParameterNewProfilePicture = e.target.files?.item(0);
    if (!userParameterNewProfilePicture) {
      return;
    }

    if (userParameterNewProfilePicture.size >= 2097152) {
      setSnackBarMsg("File size too large, max 2Mo");
      setAvatarChangeFailure(true);
      return;
    }
    var formData = new FormData();
    formData.append("photo", userParameterNewProfilePicture);

    axios({
      method: "post",
      url:
        "https://"+ process.env.REACT_APP_BACKEND_IP +":8080/users/changeAvatar/" +
        axios.defaults.headers.common.Authorization,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
      withCredentials: true,
    })
      .then((response) => {
        if (response.data.status == 400) {
          setSnackBarMsg(response.data.message);
          setAvatarChangeFailure(true);
        } else {
          socket.emit("usersNotify")
          window.location.reload();
        }
      })
      .catch((err) => {
        setSnackBarMsg(err);
        setAvatarChangeFailure(true);
      });

    e.target.value = null;
  };

  return (
    <>
      <Typography variant="h3">Change Avatar</Typography>
      <Typography marginBottom={1} variant="subtitle1" paddingBottom="10px">
        Less than 2Mo - jpg jpeg png format
      </Typography>
      <Box display="flex">
        <Avatar
          alt="Profile picture"
          src={user.avatar}
          sx={{ width: 100, height: 100 }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "30px",
          }}
        >
          <Button variant="contained" component="label" size="large">
            Chose picture
            <input
              hidden
              accept="image/png, image/jpeg, image/jpg"
              type="file"
              onChange={handleFileReception}
            />
          </Button>
        </div>
      </Box>
      {avatarChangeFailure && (
        <SnackBarComponent
          severity="error"
          closeSnack={function () {
            setAvatarChangeFailure(false);
          }}
          snackbarMessage={snackBarMsg}
        />
      )}
    </>
  );
};

export default ChangeAvatar;
