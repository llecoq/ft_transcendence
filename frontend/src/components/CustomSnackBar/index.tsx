import { Snackbar, Alert } from "@mui/material";

export const SnackBarComponent = ({severity, closeSnack, snackbarMessage}) => {
	return (
		<>
			<Snackbar
				open={true}
				autoHideDuration={4000}
				onClose={closeSnack}
			>
				<Alert variant="filled" severity={severity} sx={{ width: "100%" }}>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</>
	);
};

export default SnackBarComponent;