import {
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import CheckTwoToneIcon from "@mui/icons-material/CheckTwoTone";
import CancelIcon from '@mui/icons-material/Cancel';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { AvatarSuccess, ListItemWrapper, StyledBadgeAvailable } from ".";
import { useNavigate } from "react-router";
import useAuth from "../../../../../hooks/useAuth";

function GameInviteNotification({ gameInvites, setGameInvites, setOpen }) {
  const navigate = useNavigate();
	const { socket } = useAuth();
	
	const handleAcceptInvite = async (gameElem) => {
		setOpen(false);
		setGameInvites(current =>
      current.filter(obj => {
        return obj !== gameElem;
      }),
    );
		navigate('/pong/accept/' + gameElem.gameRoomId)
  }

  const handleRefuseInvite = async (gameElem) => {
		socket.emit("refuseInvite", {gameRoomId: gameElem.gameRoomId, invitingFriendId: gameElem.userId});
		setGameInvites(current =>
      current.filter(obj => {
        return obj !== gameElem;
      }),
    );
  }

  return (
    <>
      <List sx={{ p: 0 }}>
        {gameInvites.length != 0 ? gameInvites.map((gameElem, index) => (
          <ListItemWrapper selected key={index}>
            <ListItemAvatar>
              <StyledBadgeAvailable
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <Avatar src={gameElem.avatar} />
              </StyledBadgeAvailable>
            </ListItemAvatar>
            <ListItemText
              sx={{
                mr: 1,
              }}
              primaryTypographyProps={{
                color: "textPrimary",
                variant: "h5",
                noWrap: true,
              }}
              secondaryTypographyProps={{
                color: "textSecondary",
                noWrap: true,
              }}
              primary={gameElem.username}
              secondary={"Invites you to play !"}
            />
            <SportsTennisIcon
              color={"success"}
              fontSize={"large"}
              onClick={() => {
              handleAcceptInvite(gameElem);
              }}
            />
            <CancelIcon
              color={"error"}
              fontSize={"large"}
              onClick={() => {
              handleRefuseInvite(gameElem);
              }}
            />
          </ListItemWrapper>
        ))
        : gameInvites.length == 0 && (
          <Box pb={3}>
            <Divider
              sx={{
                mb: 2,
              }}
            />
            <AvatarSuccess>
              <CheckTwoToneIcon />
            </AvatarSuccess>
            <Typography
              sx={{
                mt: 2,
                textAlign: "center",
              }}
              variant="subtitle2"
            >
              No pending game invite
            </Typography>
            <Divider
              sx={{
                mt: 2,
              }}
            />
          </Box>
        )}
      </List>
    </>
  );
}

export default GameInviteNotification;
