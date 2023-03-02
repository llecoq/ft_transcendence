import {
  Avatar,
  Tooltip,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  styled,
  InputBase,
  useTheme
} from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import * as React from 'react';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

const MessageInputWrapper = styled(InputBase)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(18)};
    padding: ${theme.spacing(1)};
    width: 100%;
`
);

const Input = styled('input')({
  display: 'none'
});

function BottomBarContent(props) {
  const theme = useTheme();
  const { socket, user } = useAuth();
  const [channelPassword, setchannelPassword] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [snackBarMsg, setSnackBarMsg] = useState("");
  const [displaySnackbar, setDisplaySnackbar] = useState(false);
  const [isSendingMsg, setisSendingMsg] = useState(false);

  const handleNewMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleChannelPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setchannelPassword(event.target.value);
  };

  useEffect(() => {
    setchannelPassword("");
    setNewMessage("");
  }, [props.currentChannel]);
  const SendMessage = async () => {
    if (newMessage == "" || !props.currentChannel || isSendingMsg)
      return;
    setisSendingMsg(true)
    setNewMessage("");
      if (
        newMessage.length > 150) {
        setSnackBarMsg(
            "Message too long. Max length 150 chars."
        );
        setDisplaySnackbar(true);
        return;
    }
    try {
      socket.emit('sendMessage', { channelId: props.currentChannel.id, content: newMessage }, (response) => {
        setisSendingMsg(false);
        if (response.status != 200) {
          setDisplaySnackbar(true);
          setSnackBarMsg(
            response.message
        );
        }
      });
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    }
    setisSendingMsg(false);
  };

  return (
    <Box
      sx={{
        background: theme.colors.alpha.white[50],
        display: 'flex',
        alignItems: 'center',
        p: 2
      }}
    >
      {
        props.currentChannel && props.currentChannel.type == "public" && !props.currentChannel.users.find(userSearch => userSearch.id == user.id) ?
          <Box flexGrow={1} display="flex" alignItems="center">
            <Typography>
              Veuillez rejoindre le channel pour envoyer des messages.
            </Typography>
          </Box>
          :
          props.currentChannel && props.currentChannel.type == "protected" && !props.currentChannel.messages ?
            <>
              <Box flexGrow={1} display="flex" alignItems="center">
                <MessageInputWrapper
                  value={channelPassword}
                  onChange={handleChannelPasswordChange}
                  autoFocus
                  placeholder="Enter Channel pasword"
                  fullWidth
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      props.getMessagesFromProtectedChannel(channelPassword); setchannelPassword("");
                    }
                  }}
                />
              </Box>
              <Box>
                <Button startIcon={<SendTwoToneIcon />} variant="contained" onClick={() => { props.getMessagesFromProtectedChannel(channelPassword); setchannelPassword(""); }}>
                  Send password
                </Button>
              </Box>
            </>
            :
            <>

              <Box flexGrow={1} display="flex" alignItems="center">
                <Avatar
                  sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }}
                  alt={user.name}
                  src={user.avatar}
                />
                <MessageInputWrapper
                  value={newMessage}
                  onChange={handleNewMessageChange}
                  autoFocus
                  inputProps={{ maxLength: 150 }}
                  placeholder="Write your message here..."
                  fullWidth
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      SendMessage();
                    }
                  }}
                />
              </Box>
              <Box>
                <Button startIcon={<SendTwoToneIcon />} variant="contained" onClick={SendMessage}>
                  Send
                </Button>
              </Box>
            </>
      }
      <Snackbar open={displaySnackbar} autoHideDuration={3000} onClose={function () { setDisplaySnackbar(false); }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackBarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BottomBarContent;
