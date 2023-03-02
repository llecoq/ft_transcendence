import { ConstructionOutlined } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckTwoToneIcon from "@mui/icons-material/CheckTwoTone";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import NotificationsActiveTwoToneIcon from "@mui/icons-material/NotificationsActiveTwoTone";
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import SnackBarComponent from "../../../../../components/CustomSnackBar";
import useAuth from "../../../../../hooks/useAuth";
import AutoMatchmaking from "./AutoMatchmaking";
import GameInviteNotification from "./GameInvite";

const NotificationsBadge = styled(Badge)(
  ({ theme }) => `
    
    .MuiBadge-badge {
        background-color: ${alpha(theme.palette.error.main, 0.1)};
        color: ${theme.palette.error.main};
        min-width: 16px; 
        height: 16px;
        padding: 0;

        &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 0 0 1px ${alpha(theme.palette.error.main, 0.3)};
            content: "";
        }
    }
`
);

export const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
          background-color: ${theme.colors.success.lighter};
          color: ${theme.colors.success.main};
          width: ${theme.spacing(8)};
          height: ${theme.spacing(8)};
          margin-left: auto;
          margin-right: auto;
    `
);

export const ListItemWrapper = styled(ListItemButton)(
  ({ theme }) => `
        &.MuiButtonBase-root {
            margin: ${theme.spacing(1)} 0;
        }
  `
);

const StyledBadgeUnavailable = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#cccfd3",
    color: "#cccfd3",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

export const StyledBadgeAvailable = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

type GameInvitation = {
  gameRoomId: string;
  map: string;
  userId: number;
  username: string;
  avatar: string;
};

function HeaderNotifications({setNotifyGameInvite}) {
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [pendingrequests, setPendingRequests] = useState([]);
  const [gameInvites, setGameInvites] = useState<GameInvitation[]>([]);

  const { socket } = useAuth();
  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  useEffect(() => {
    socket.emit("getAllMyFriendsRequests");
		socket.on("cancelInvite", (response) => {
			setGameInvites(current =>
				current.filter(obj => {
					return obj.gameRoomId != response;
				}),
			);
		});
    return () => {
			socket.off("cancelInvite");
      socket.off("getAllMyFriendsRequests");
      socket.off("getFriendshipNotify");
			socket.off("GameRoomInvitation");
    };
  }, []);

  useEffect(() => {
    socket.on("GameRoomInvitation", (response) => {
      setGameInvites((prevGameInvites) => [...prevGameInvites, response]);
      setNotifyGameInvite(true);
    });
    socket.on("getAllMyFriendsRequests", (response) => {
      setPendingRequests(response);
    });
    socket.on("getFriendshipNotify", (response) => {
      socket.emit("getAllMyFriendsRequests");
    });
  }, [socket]);

  const handleAcceptFriend = async (userElem) => {
    await socket.emit("createFriendship", userElem.id, (res) => {});
  };

  const handleRemoveFriendRequest = async (userElem) => {
    await socket.emit("removeFriendshipEntirely", userElem.id, (res) => {});
  };


  return (
    <>
      <Tooltip arrow title="Notifications">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <NotificationsBadge
            badgeContent={pendingrequests.length + gameInvites.length}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <NotificationsActiveTwoToneIcon />
          </NotificationsBadge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box
          sx={{ p: 2 }}
          display="flex"
          width="250px"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Game Invitations</Typography>
        </Box>
        <GameInviteNotification
          gameInvites={gameInvites}
          setGameInvites={setGameInvites}
          setOpen={setOpen}
        />
        <Box
          sx={{ pb: 1, pl: 2 }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Friends requests</Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {pendingrequests.map((userElem, index) => (
            <ListItemWrapper selected key={index}>
              <ListItemAvatar>
                {userElem.status != "offline" ? (
                  <StyledBadgeAvailable
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar src={userElem.avatar} />
                  </StyledBadgeAvailable>
                ) : (
                  <StyledBadgeUnavailable
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar src={userElem.avatar} />
                  </StyledBadgeUnavailable>
                )}
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
                primary={userElem.username}
                secondary={
                  (userElem.status != "online" && userElem.status != "offline") ? userElem.status :  "Level " + Math.floor(userElem.xp / 1000)
                }
              />
              <HowToRegRoundedIcon
                color={"success"}
                fontSize={"large"}
                onClick={() => {
                  handleAcceptFriend(userElem);
                }}
              />
              <CancelIcon
                color={"error"}
                fontSize={"large"}
                onClick={() => {
                  handleRemoveFriendRequest(userElem);
                }}
              />
            </ListItemWrapper>
          ))}
          {pendingrequests.length == 0 && (
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
                No pending friends requests
              </Typography>
            </Box>
          )}
        </List>
      </Popover>
      <AutoMatchmaking/>
    </>
  );
}

export default HeaderNotifications;
