import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import TopBarContent from './TopBarContent';
import BottomBarContent from './BottomBarContent';
import LeftSidebarContent from './LeftSidebarContent';
import RightSidebarContent from './RightSidebarContent';
import ChatContent from './ChatContent';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import useAuth from '../../hooks/useAuth';
import Scrollbar from 'src/components/Scrollbar';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import { isMobile } from 'react-device-detect';
import {
  Box,
  styled,
  Divider,
  Drawer,
  Snackbar,
  CircularProgress,
  Alert,
  Typography,
  Button,
  IconButton,
  useTheme
} from '@mui/material';

const RootWrapper = styled(Box)(
  ({ theme }) => `
       height: calc(100vh - ${theme.header.height});
       display: flex;
`
);

const LeftSidebar = styled(Box)(
  ({ theme }) => `
        width: 300px;
        background: ${theme.colors.alpha.white[100]};
        border-right: ${theme.colors.alpha.black[10]} solid 1px;
`
);

const RightSidebar = styled(Box)(
  ({ theme }) => `
        width: 300px;
        background: ${theme.colors.alpha.white[100]};
        border-left: ${theme.colors.alpha.black[10]} solid 1px;
`
);

const ChatWindow = styled(Box)(
  () => `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
`
);

const ChatTopBar = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.white[100]};
        border-bottom: ${theme.colors.alpha.black[10]} solid 1px;
        padding: ${theme.spacing(2)};
        align-items: center;
`
);

const IconButtonToggle = styled(IconButton)(
  ({ theme }) => `
  width: ${theme.spacing(4)};
  height: ${theme.spacing(4)};
  background: ${theme.colors.alpha.white[100]};
`
);

const DrawerWrapperMobile = styled(Drawer)(
  () => `
    width: 340px;
    flex-shrink: 0;

  & > .MuiPaper-root {
        width: 340px;
        z-index: 3;
  }
`
);

export enum RelationshipStatus {
  FRIEND = "friend",
  PENDING = "pending",
  REQUESTED = "requested",
  NOTFRIEND = "notFriend",
}


function ApplicationsChat() {
  const theme = useTheme();
  const { socket } = useAuth();
  const [mobileOpenRight, setMobileOpenRight] = useState<boolean>(false);
  const [mobileOpenLeft, setMobileOpenLeft] = useState<boolean>(false);
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [friends, setFriendsList] = useState([]);
  const [publicChannels, setPublicChannels] = useState([]);
  const [userChannels, setUserChannels] = useState([]);
  const [displayPasswordError, setDisplayPasswordError] = useState(false);
  const [relationshipStatus, setRelationshipStatus]: any = useState(RelationshipStatus);
  const [isUserBoxOpenRightSidebar, setUserBoxOpenRightSidebar] = useState<boolean>(false);
  const [isUserBoxOpenDrawer, setUserBoxOpenDrawer] = useState<boolean>(false);
  const [notifFriendship, setNotifFriendship] = useState(false);
  const [userSelected, setUserSelected] = useState(null);
  const [showLoadingChannels, setShowLoadingChannels] = useState(true);

  const handleDrawerToggleLeft = () => {
    setMobileOpenLeft(!mobileOpenLeft);
  };

  const handleDrawerToggleRight = () => {
    setMobileOpenRight(!mobileOpenRight);
  }

  const getCurrentChannel = () => {
    if (!currentChannelId && !userChannels[0])
      return null
    if (!currentChannelId)
      setCurrentChannelId(userChannels[0].id)
    let currentChan = userChannels.find(channel => channel.id == currentChannelId);
    if (!currentChan)
      currentChan = publicChannels.find(channel => channel.id == currentChannelId);
    return currentChan;
  }

  useEffect(() => () => socket.emit("leaveAllChatRooms"), []);

  useEffect(() => {
    socket.emit("getUsers");
    socket.emit("getUserChannels");
    socket.emit("getPublicChannels");
    socket.emit("getAllFriends");

    return () => {
      socket.off("getUserChannels");
      socket.off("getPublicChannels");
      socket.off("getChannelsNotify");
			socket.off("getAllFriends");
			socket.off("getUsers");
			socket.off("newMessage");
			socket.off("getUsersNotify");
			socket.off("getFriendshipNotify");
			socket.off("getFriendshipStatus");
    }
  }, []);

  useEffect(() => {
    socket.on("getUserChannels", response => {
      setShowLoadingChannels(false)
      setUserChannels(response);
    });
    socket.on("getPublicChannels", response => {
      setPublicChannels(response);
    });
    socket.on("getChannelsNotify", response => {
      socket.emit("getUserChannels");
      socket.emit("getPublicChannels");
    });
    socket.on("getAllFriends", (response) => {
      setFriendsList(response);
    });
    socket.on("getUsers", response => {
      setUsers(response);
    });
    socket.on("newMessage", response => {
      setNewMessage(response);
    });
    socket.on("getUsersNotify", response => {
      socket.emit("getUsers");
    });

    socket.on("getFriendshipNotify", (response) => {
      setNotifFriendship(true);
      socket.emit("getAllFriends");
    });
    socket.on("getFriendshipStatus", (response) => {
      setRelationshipStatus(response);
    });
  }, [socket]);

  if (notifFriendship) {
    setNotifFriendship(false);
    if (userSelected)
      socket.emit("getFriendshipStatus", userSelected.id);
  };

  const handleAddFriend = async () => {
    await socket.emit('createFriendship', userSelected.id, (res) => {
      if (res.status == 200) {
        setRelationshipStatus(RelationshipStatus.PENDING);
        socket.emit("getFriendshipStatus", userSelected.id);
      }
    });
  }
  const handleAcceptFriend = async () => {
    await socket.emit('createFriendship', userSelected.id, (res) => {
      if (res.status == 200) {
        setRelationshipStatus(RelationshipStatus.FRIEND);
        socket.emit("getFriendshipStatus", userSelected.id);
      }
    });
  }
  const handleUnfriend = async () => {
    await socket.emit('removeFriendshipEntirely', userSelected.id, (res) => {
      if (res.status == 200) {
        setRelationshipStatus(RelationshipStatus.NOTFRIEND);
        socket.emit("getFriendshipStatus", userSelected.id);
        setUserBoxOpenDrawer(false);
        setUserBoxOpenRightSidebar(false);
      }
    });
  }

  const handleBlockOrUnBlock = async () => {
    await socket.emit('blockOrUnBlockUser', { userBlockedId: userSelected.id }, (res) => {
      if (res.status == 200) {
        setUserBoxOpenDrawer(false);
        setUserBoxOpenRightSidebar(false);
				socket.emit("getUsers")
				socket.emit("getUserChannels");
				socket.emit("getPublicChannels");
      }
    });
  }

  const FriendShipStatus = ({ relationshipStatus }) => {
    if (relationshipStatus === RelationshipStatus.FRIEND)
      return <Button onClick={handleUnfriend} fullWidth color='inherit' variant="contained" startIcon={<PersonRemoveRoundedIcon />}>Remove friend</Button>
    else if (relationshipStatus === RelationshipStatus.REQUESTED)
      return <Button onClick={handleAcceptFriend} fullWidth color='success' variant="contained" startIcon={<CheckCircleOutlineRoundedIcon />}>Accept Friendship</Button>
    else if (relationshipStatus === RelationshipStatus.PENDING)
      return <Button onClick={handleUnfriend} fullWidth color='inherit' variant="contained" startIcon={<MoreTimeRoundedIcon />}>Pending...</Button>
    else
      return <Button onClick={handleAddFriend} fullWidth color='primary' variant="contained" startIcon={<PersonAddRoundedIcon />}>Add Friend</Button>
  }

  if (newMessage) {
    let userchannel = userChannels.find(chan => chan.id == newMessage.channel.id)
    if (userchannel)
      userchannel.messages.push({ id: newMessage.id, createDateTime: newMessage.createDateTime, content: newMessage.content, author: newMessage.author })
    else {
      userchannel = publicChannels.find(chan => chan.id == newMessage.channel.id);
      if (userchannel)
        userchannel.messages.push({ id: newMessage.id, createDateTime: newMessage.createDateTime, content: newMessage.content, author: newMessage.author })
    }
    setUserChannels(userChannels)
    setNewMessage(null)
  }

  const getMessagesFromProtectedChannel = async (channelPasswordParam) => {
    await socket.emit("getMessages", { channelId: currentChannelId, password: channelPasswordParam }, (response) => {
      if (response.status == 200)
        setUserChannels(userChannels.map(chan => [response.channel].find(o => o.id === chan.id) || chan));
      else
        setDisplayPasswordError(true);
    });
  };
  return (
    <>
      <Helmet>
        <title>Chat</title>
      </Helmet>
      <RootWrapper className="Mui-FixedWrapper">
        {isMobile ?
          <DrawerWrapperMobile
            sx={{
              display: { lg: 'none', xs: 'inline-block' }
            }}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpenLeft}
            onClose={handleDrawerToggleLeft}
          >
            <Scrollbar>
              <LeftSidebarContent users={users} publicChannels={publicChannels} userChannels={userChannels} currentChannel={getCurrentChannel()} setCurrentChannelId={setCurrentChannelId} />
            </Scrollbar>
          </DrawerWrapperMobile>
          :
          <LeftSidebar>
            <Scrollbar>
              <LeftSidebarContent users={users} publicChannels={publicChannels} userChannels={userChannels} currentChannel={getCurrentChannel()} setCurrentChannelId={setCurrentChannelId} />
            </Scrollbar>
          </LeftSidebar>
        }
        <ChatWindow>
          <ChatTopBar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {isMobile &&
            <IconButtonToggle
              sx={{
                display: { lg: 'none', xs: 'flex' },
                mr: 2
              }}
              color="primary"
              onClick={handleDrawerToggleLeft}
              size="small"
            >
              <MenuTwoToneIcon />
            </IconButtonToggle>
}
            <TopBarContent users={users} channel={getCurrentChannel()} setUserBoxOpen={setUserBoxOpenRightSidebar} isUserBoxOpen={isUserBoxOpenRightSidebar} handleBlockOrUnBlock={handleBlockOrUnBlock} relationshipStatus={relationshipStatus} FriendShipStatus={FriendShipStatus} userSelected={userSelected} setUserSelected={setUserSelected} />
            {isMobile &&
            <IconButtonToggle
              sx={{
                display: { lg: 'none', xs: 'flex' },
                mr: 2
              }}
              color="primary"
              onClick={handleDrawerToggleRight}
              size="small"
            >
              <MenuTwoToneIcon />
            </IconButtonToggle>
}
          </ChatTopBar>
          <Box flex={1}>
            <Scrollbar>
              {showLoadingChannels ?
                <Box p={3} mt={10} display="flex"
                  alignItems="center"
                  justifyContent="center">
                  <CircularProgress size={50} />
                </Box>
                :
                (userChannels.length == 0 && publicChannels.length == 0) ?
                  <Box p={3}>
                    <Typography variant={"h4"}>
                      No Channel to show yet ! Please press the + button to start a conversation.
                    </Typography>
                  </Box>
                  :
                  <ChatContent currentChannel={getCurrentChannel()} />
              }
            </Scrollbar>
          </Box>
          <Divider />
          {getCurrentChannel() &&
            <BottomBarContent getMessagesFromProtectedChannel={getMessagesFromProtectedChannel} currentChannel={getCurrentChannel()} />
          }
          <Snackbar open={displayPasswordError} autoHideDuration={3000} onClose={function () { setDisplayPasswordError(false); }}>
            <Alert severity="error" sx={{ width: '100%' }}>
              Wrong password
            </Alert>
          </Snackbar>
        </ChatWindow>
        {isMobile ?
          <DrawerWrapperMobile
            sx={{
              flexDirection: 'row-reverse',
            }}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'left' : 'right'}
            open={mobileOpenRight}
            onClose={handleDrawerToggleRight}
          >
            <Scrollbar>
              <RightSidebarContent mobileOpenRight={mobileOpenRight} users={users} setUserBoxOpen={setUserBoxOpenDrawer} isUserBoxOpen={isUserBoxOpenDrawer} handleBlockOrUnBlock={handleBlockOrUnBlock} relationshipStatus={relationshipStatus} FriendShipStatus={FriendShipStatus} userSelected={userSelected} setUserSelected={setUserSelected} friends={friends} />
            </Scrollbar>
          </DrawerWrapperMobile>
          :
          <RightSidebar>
            <Scrollbar>
              <RightSidebarContent users={users} setUserBoxOpen={setUserBoxOpenDrawer} isUserBoxOpen={isUserBoxOpenDrawer} handleBlockOrUnBlock={handleBlockOrUnBlock} relationshipStatus={relationshipStatus} FriendShipStatus={FriendShipStatus} userSelected={userSelected} setUserSelected={setUserSelected} friends={friends} />
            </Scrollbar>
          </RightSidebar>
        }
      </RootWrapper>
    </>
  );
}

export default ApplicationsChat;
