import { Switch, FormGroup, FormControlLabel, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import SnackBarComponent from "../../../components/CustomSnackBar";
import TwoFaPopup from "./TwoFaPopup";

function TwoFactorAuth() {
  const { socket, user } = useAuth();
  const [openPopup, setOpenPopup] = useState(false);
  const [twoFaEnabled, setTwofaEnabled] = useState(false);
  const [QrCode, setQrcode] = useState("");

  //Snack bar
  const [displayCodeVerifSuccess, setDisplayCodeVerifSuccess] = useState(false);

  useEffect(() => {
    socket.on("twoFaStatus", (response) => {
      setTwofaEnabled(response);
    });

    try {
      socket.emit("getTwoFaStatus");
    } catch (error) {
      console.error("Error response:");
      console.error(error);
    }

    return () => {
      socket.off("twoFaStatus");
    };
  }, []);

  const handleTurnOffTwoFa = async () => {
    await socket.emit("turnOffTwoFa", (res) => {
      if (res.status == 200) {
        setTwofaEnabled(false);
        setOpenPopup(false);
      }
    });
  };

  const showTwoFaPopup = async (e) => {
    if (e.target.checked === false) {
      handleTurnOffTwoFa();
    } else if (e.target.checked === true) {
      axios({
        url:
          "https://"+ process.env.REACT_APP_BACKEND_IP +":8080/2fa/generate?userToken=" +
          axios.defaults.headers.common.Authorization,
        method: "post",
        responseType: "blob",
      })
        .then((response) => {
          const qrCodeUrl = URL.createObjectURL(response.data);
          setQrcode(qrCodeUrl);
          setTwofaEnabled(true);
          setOpenPopup(true);
        })
        .catch((err) => {
        });
    }
  };

  return (
    <>
      <Typography variant="h3">Google Authenticator</Typography>
      <Typography marginBottom={1} variant="subtitle1" paddingBottom="10px">
        Two-factor authentication helps secure your account
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={twoFaEnabled ? true : false}
              onChange={showTwoFaPopup}
              size="medium"
            />
          }
          label="Turn on 2FA"
        />
      </FormGroup>

      {openPopup && (
        <TwoFaPopup
          handleTurnOffTwoFa={handleTurnOffTwoFa}
          QrCode={QrCode}
          setOpenPopup={setOpenPopup}
          setDisplayCodeVerifSuccess={setDisplayCodeVerifSuccess}
        />
      )}
      {displayCodeVerifSuccess && (
        <SnackBarComponent
          severity="success"
          closeSnack={function () {
            setDisplayCodeVerifSuccess(false);
          }}
          snackbarMessage={"Two-factor authentication turned on"}
        />
      )}
    </>
  );
}

export default TwoFactorAuth;
