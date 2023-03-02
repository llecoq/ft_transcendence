import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	TextField,
	Typography,
} from "@mui/material";
import useAuth from "../../hooks/useAuth";
import SnackBarComponent from "../CustomSnackBar";
import { setSession } from "../../contexts/JWTAuthContext";

export const setSessionTwoFa = (accessToken) => {
	if (accessToken)
		localStorage.setItem("accessTokenTwoFa", accessToken);
	else
		localStorage.removeItem("accessTokenTwoFa");
};

function LoginTwoFa({ setTwoFaCodeVerified }) {
	const { socket } = useAuth();
	const [typedOtpCode, setTypedOtpCode] = useState("");
	const [disableVerifyBtn, setDisableVerifyBtn] = useState(true);

	//snack bars
	const [displayCodeVerifError, setDisplayCodeVerifError] = useState(false);

	useEffect(() => {
		socket.on("logginTwoFa", (response) => {
			setSessionTwoFa(response);
		})
	}, [socket]);

  useEffect(() => {
    return () => {
      socket.off("logginTwoFa");
    }
  }, []);

  const handleVerifyOtpCode = (e) => {
    e.preventDefault();
    const inputValue = e.target[0].value;
    socket.emit("logginTwoFa", inputValue, (res) => {
      if (res.status == 200) {
        setTwoFaCodeVerified(true);
      } else {
        setDisplayCodeVerifError(true);
        setTwoFaCodeVerified(false);
        setTypedOtpCode("");
        setDisableVerifyBtn(true);
      }
    });
  };

	const handleGoBackToLogin = () => {
		setSession(null);
		window.location.reload();
	}

	const removeNonDigits = (e) => {
		if (displayCodeVerifError) setDisplayCodeVerifError(false);
		const result = e.target.value.replace(/\D/g, "").slice(0, 6);
		setTypedOtpCode(result);
		if (result.length == 6) setDisableVerifyBtn(false);
		else setDisableVerifyBtn(true);
	};

	return (
		<>

			<div style={{
				margin: 20,
			}} >
				<Button onClick={handleGoBackToLogin} variant="contained">{"< Go back to Login"}</Button>
			</div>
			<Box
				sx={{
					position: "fixed",
					left: 0,
					top: 100,
					width: "100%",
					height: "100%",
				}}
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				padding={2}
			>
				<Card elevation={4}>
					<CardContent>
						<Typography
							align="center"
							sx={{
								margin: 3,
								color: '#5569ff',
							}}
							variant="h2"
						>
							Sign-in with two factor authentication
						</Typography>

						<Typography variant="subtitle1" align="center">
							1. Open the Google Authenticator App
						</Typography>
						<Typography variant="subtitle1" align="center">
							2. Type the code from Transcendence below and verify
						</Typography>
						<form onSubmit={handleVerifyOtpCode}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
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
					</CardContent>
				</Card>
			</Box>
			<Box>
			</Box>
			{displayCodeVerifError && (
				<SnackBarComponent
					severity="error"
					closeSnack={setDisplayCodeVerifError}
					snackbarMessage={"Wrong code"}
				/>
			)}
		</>
	);
}

export default LoginTwoFa;
