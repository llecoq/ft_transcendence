import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import {
  Avatar, AvatarGroup,
  Badge, Box, Dialog, DialogTitle, Divider, IconButton, lighten, List, ListItemAvatar, ListItemButton, ListItemText, Slide, styled, Tab, Tabs, TextField, Tooltip, Typography
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { ChangeEvent, forwardRef, ReactElement, Ref, useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import NewConversationPopup from './NewConversationPopup';

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
          background-color: ${theme.colors.success.lighter};
          color: ${theme.colors.success.main};
          width: ${theme.spacing(8)};
          height: ${theme.spacing(8)};
          margin-left: auto;
          margin-right: auto;
    `
);

const StyledBadgeAvailable = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StyledBadgeUnavailable = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#cccfd3',
    color: '#cccfd3',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  }
}));

const RootWrapper = styled(Box)(
  ({ theme }) => `
        padding: ${theme.spacing(2.5)};
  `
);

const ListItemWrapper = styled(ListItemButton)(
  ({ theme }) => `
        &.MuiButtonBase-root {
            margin: ${theme.spacing(1)} 0;
        }
  `
);

const TabsContainerWrapper = styled(Box)(
  ({ theme }) => `
        .MuiTabs-indicator {
            min-height: 4px;
            height: 4px;
            box-shadow: none;
            border: 0;
        }
        .MuiTab-root {
            &.MuiButtonBase-root {
                padding: 0;
                margin-right: ${theme.spacing(3)};
                font-size: ${theme.typography.pxToRem(16)};
                color: ${theme.colors.alpha.black[50]};
                .MuiTouchRipple-root {
                    display: none;
                }
            }
            &.Mui-selected:hover,
            &.Mui-selected {
                color: ${theme.colors.alpha.black[100]};
            }
        }
  `
);

function SidebarContent(props) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [currentTab, setCurrentTab] = useState<string>('all');
  const [channelsToShow, setChannelsToShow] = useState(props.userChannels);
  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'publicGroups', label: 'Public Groups' },
  ];

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  useEffect(() => {
    if (currentTab == "all")
      setChannelsToShow(props.userChannels)
    else if (currentTab == "publicGroups")
      setChannelsToShow(props.publicChannels)
  }, [currentTab, props.userChannels]);

  return (
    <RootWrapper>
      <Box display="flex" alignItems="flex-start">
        <Avatar alt={user.username} src={user.avatar} />
        <Box
          sx={{
            ml: 1.5,
            flex: 1
          }}
        >
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" noWrap>
                {user.username}
              </Typography>
              <Typography variant="subtitle1" noWrap>
                Level {Math.floor(user.xp / 1000)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Typography
          sx={{
            mb: 1,
            mt: 2
          }}
          variant="h3"
        >
          Chats
        </Typography>
        <Box
          display="flex"
        >

          <Tooltip placement="bottom" title="Start conversation">
            <IconButton sx={{
              p: 1
            }}
              color="primary"
              onClick={handleClickOpen}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <NewConversationPopup open={open} handleClose={handleClose} users={props.users} setCurrentChannelId={props.setCurrentChannelId} channels={props.userChannels} />

      <TabsContainerWrapper>
        <Tabs
          onChange={handleTabsChange}
          value={currentTab}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </TabsContainerWrapper>
      <Box mt={2}>
        <List disablePadding component="div">
          {channelsToShow.map((channel, index) => (
            <ListItemWrapper selected={props.currentChannel ? channel.id == props.currentChannel.id : false} key={index} onClick={function () { props.setCurrentChannelId(channel.id); }}>
              <ListItemAvatar>
                {channel.type == "direct" ?
                  props.users.find(userr => channel.users.find(usersearch => usersearch.id != user.id).id == userr.id).status == "offline" ?
                  <StyledBadgeUnavailable
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                  >
                    <Avatar sx={{
                      width: 48,
                      height: 48
                    }}
                      src={channel.users.find(usersearch => usersearch.id != user.id).avatar}
                      alt={channel.users.find(usersearch => usersearch.id != user.id).username} />
                  </StyledBadgeUnavailable>
                  :
                  <StyledBadgeAvailable
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                  >
                    <Avatar sx={{
                      width: 48,
                      height: 48
                    }}
                      src={channel.users.find(usersearch => usersearch.id != user.id).avatar}
                      alt={channel.users.find(usersearch => usersearch.id != user.id).username} />
                  </StyledBadgeAvailable>
                  :
                  <AvatarGroup max={2}>
                    {channel.users.map((user, index) => (
                      <Tooltip arrow title={user.username} key={index}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28
                          }}
                          src={user.avatar}
                        />
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                }
              </ListItemAvatar>
              <ListItemText
                sx={{
                  mr: 1
                }}
                primaryTypographyProps={{
                  color: 'textPrimary',
                  variant: 'h5',
                  noWrap: true
                }}
                secondaryTypographyProps={{
                  color: 'textSecondary',
                  noWrap: true
                }}
                primary={channel.type == "direct" ? channel.users.find(usersearch => usersearch.id != user.id).username : channel.name}
                secondary={channel.type == "protected" ? "Protected channel" : channel.messages && channel.messages[channel.messages.length - 1] ? channel.messages[channel.messages.length - 1].content : "No message yet"}
              />
            </ListItemWrapper>))}
          {channelsToShow.length == 0 &&
            <Box pb={3}>
              <Divider
                sx={{
                  mb: 3
                }}
              />
              <AvatarSuccess>
                <CheckTwoToneIcon />
              </AvatarSuccess>
              <Typography
                sx={{
                  mt: 2,
                  textAlign: 'center'
                }}
                variant="subtitle2"
              >
                No conversation yet !
              </Typography>
              <Divider
                sx={{
                  mt: 3
                }}
              />
            </Box>}
        </List>
      </Box>
    </RootWrapper>
  );
}

export default SidebarContent;