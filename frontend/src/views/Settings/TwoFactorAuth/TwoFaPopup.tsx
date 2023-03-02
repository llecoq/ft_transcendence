import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  styled,
  Slide,
  TextField,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import axios from "axios";
import { forwardRef, ReactElement, Ref, useEffect, useState } from "react";
import { setSessionTwoFa } from "../../../components/LoginTwoFa";
import useAuth from "../../../hooks/useAuth";
import { SnackBarComponent } from "../../../components/CustomSnackBar";

const DialogWrapper = styled(Dialog)(
  () => `
  .MuiDialog-container {
      height: auto;
  }
  
  .MuiDialog-paperScrollPaper {
      max-height: calc(100vh - 64px)
  }
`
);

const DialogTitleWrapper = styled(DialogTitle)(
  ({ theme }) => `
  background: ${theme.colors.alpha.black[5]};
  padding: ${theme.spacing(3)}
`
);

const styles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function TwoFaPopup({handleTurnOffTwoFa, QrCode, setOpenPopup, setDisplayCodeVerifSuccess}) {
  const { socket } = useAuth();
  const [typedOtpCode, setTypedOtpCode] = useState("");
  const [disableVerifyBtn, setDisableVerifyBtn] = useState(true);

  //snack bars
  const [displayCodeVerifError, setDisplayCodeVerifError] = useState(false);

  useEffect(() => {
    socket.on("turnOnVerifyCode", (response) => {
      //set 2FA cookie
      setSessionTwoFa(response);
    })
  }, [socket]);

  useEffect(() => {
    return () => {
      socket.off("turnOnVerifyCode");
    }
  }, []);

  const handleVerifyOtpCode = (e) => {
    e.preventDefault();
    const inputValue = e.target[0].value;
    socket.emit("turnOnVerifyCode", inputValue, (res) => {
      if (res.status == 200) {
        setDisplayCodeVerifSuccess(true);
        setOpenPopup(false);
      } else {
        setDisplayCodeVerifError(true);
        setTypedOtpCode("");
        setDisableVerifyBtn(true);
      }
    });
  };

  const removeNonDigits = (e) => {
    if (displayCodeVerifError) setDisplayCodeVerifError(false);
    const result = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTypedOtpCode(result);
    if (result.length == 6) setDisableVerifyBtn(false);
    else setDisableVerifyBtn(true);
  };



  return (
    <>
      <DialogWrapper
        open={true}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="sm"
        fullWidth
        scroll="paper"
        onClose={handleTurnOffTwoFa}
      >
        <DialogTitleWrapper>
          <Typography
            align="center"
            sx={{
              mb: 2,
            }}
            variant="h3"
          >
            Activate two factor authentication
          </Typography>
          <Typography variant="h6" align="center">
            1. Scan the QR Code with the Google Authenticator App
          </Typography>
        </DialogTitleWrapper>
        <DialogContent>
          <div style={styles}>
            <img src={QrCode} alt="2FA QR Code"></img>
          </div>
        </DialogContent>

        <DialogTitleWrapper>
          <Typography variant="h6" align="center">
            2. Type the code from the Google Authenticator App below and verify
          </Typography>
          <Typography variant="body2" align="center">
            (Six digits, no space)
          </Typography>
        </DialogTitleWrapper>
        <form onSubmit={handleVerifyOtpCode}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
              gap: "20px",
              height: "100px",
            }}
          >
            <TextField
              placeholder="--- ---"
              required
              id="outlined-required"
              label="Required"
              size="small"
              onChange={removeNonDigits}
              value={typedOtpCode}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="medium"
              disabled={disableVerifyBtn}
            >
              Verify code
            </Button>
          </div>
        </form>
        {displayCodeVerifError && <SnackBarComponent severity="error" closeSnack={setDisplayCodeVerifError} snackbarMessage={"Wrong code"} />}
      </DialogWrapper>
    </>
  );
}

export default TwoFaPopup;