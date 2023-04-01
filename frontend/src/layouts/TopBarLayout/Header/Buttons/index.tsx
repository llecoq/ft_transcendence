import { Box } from '@mui/material';
import HeaderNotifications from './Notifications';

function HeaderButtons({setNotifyGameInvite}) {
  return (
    <Box sx={{ mr: 1 }}>
      <Box sx={{ mx: 0.5 }} component="span">
        <HeaderNotifications setNotifyGameInvite={setNotifyGameInvite} />
      </Box>
    </Box>
  );
}

export default HeaderButtons;
