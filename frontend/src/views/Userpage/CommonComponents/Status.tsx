//Status
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import Brightness1RoundedIcon from '@mui/icons-material/Brightness1Rounded';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Chip } from '@mui/material';


export function Status({ status }) {
	if (status === "online")
		return <Chip sx={{ maxWidth: 100 }} variant="outlined" color="success" icon={<Brightness1RoundedIcon />} label="Online" />;
	else if (status === "offline")
		return <Chip sx={{ maxWidth: 100 }} disabled variant="outlined" color="secondary" icon={<BedtimeRoundedIcon />} label="Offline" />;
	return <Chip sx={{ maxWidth: 100 }} variant="outlined" color="primary" icon={<SportsEsportsIcon />} label="Playing" />;
}