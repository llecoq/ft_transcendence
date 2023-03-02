import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import {
  Avatar, Badge, Box, Button, Divider, InputAdornment, lighten, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Popover, styled, Tab, Tabs, TextField, Typography
} from '@mui/material';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
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

const StyledBadgeUnavailable = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#cccfd3',
    color: '#cccfd3',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  }
}));

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


const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${lighten(theme.palette.secondary.main, 0.5)}
`
);


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

const applyFilters = (users, query) => {
  return users.filter((user) => {
    let matches = true;
    if (query && !user.username.toLowerCase().includes(query.toLowerCase())) {
      matches = false;
    }

    return matches;
  });
};

function SidebarContent(props) {
  const [currentTab, setCurrentTab] = useState<string>('friends');
  const [usersToShow, setUsersToShow] = useState(props.friends);
  const ref = useRef<any>(null);
  const { user, socket } = useAuth();
  const [query, setQuery] = useState('');


  const isUserBlocked = (userParam) => {
    if (!userParam.usersWhoBlockedMe)
      return false;
    return (userParam.usersWhoBlockedMe?.find(userSearch => userSearch.id == user.id))
  };
  useEffect(() => {
    if (currentTab == "all")
      setUsersToShow(props.users.filter(userParam => !isUserBlocked(userParam)))
    else if (currentTab == "friends")
      setUsersToShow(props.friends)
    else if (currentTab == "blocked")
      setUsersToShow(props.users.filter(userParam => isUserBlocked(userParam)))
  }, [currentTab, props.users, props.friends]);

  const tabs = [
    { value: 'friends', label: 'My Friends' },
    { value: 'all', label: 'All' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  const handleQueryChange = (event) => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleOpen = (user): void => {
    props.setUserSelected(user)
    try {
      socket.emit("getFriendshipStatus", user.id);
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    }
    props.setUserBoxOpen(true);
  };

  const handleClose = (): void => {
    props.setUserBoxOpen(false);
  };

  const filteredUsers = applyFilters(usersToShow, query);
  return (
    <RootWrapper>
      <Typography
        sx={{
          mb: 1,
          mt: 2
        }}
        variant="h3"
      >
        All users
      </Typography>
      <TextField
        sx={{
          mt: 2,
          mb: 1
        }}
        size="small"
        fullWidth
        value={query}
        onChange={handleQueryChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchTwoToneIcon />
            </InputAdornment>
          )
        }}
        placeholder="Search users..."
      />
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
        <List disablePadding component="div" ref={ref}>
          {filteredUsers.map((userElem, index) => (
            <ListItemWrapper selected key={index}>
              <ListItemAvatar onClick={() => { handleOpen(userElem); }}>
                {userElem.id == user.id || props.users.find(usersearch => usersearch.id == userElem.id).status != "offline" ?
                  <StyledBadgeAvailable
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                  >
                    <Avatar src={userElem.avatar} />
                  </StyledBadgeAvailable> :
                  <StyledBadgeUnavailable
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                  >
                    <Avatar src={userElem.avatar} />
                  </StyledBadgeUnavailable>
                }
              </ListItemAvatar>
              <ListItemText
                onClick={() => { handleOpen(userElem); }}
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
                primary={userElem.username}
                secondary={(userElem.status != "online" && userElem.status != "offline") ? userElem.status : "Level " + Math.floor(userElem.xp / 1000)}
              />
              {
                props.userSelected &&
                <Popover
                  anchorEl={ref.current}
                  onClose={handleClose}
                  open={props.isUserBoxOpen}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                  }}
                >
                  <MenuUserBox sx={{ minWidth: 250 }} display="flex">
                    <Avatar variant="rounded" alt={props.userSelected.username} src={props.userSelected.avatar} />
                    <UserBoxText>
                      <UserBoxLabel variant="body1">{props.userSelected.username}</UserBoxLabel>
                      <UserBoxDescription variant="body2">
                        Level {Math.floor(props.userSelected.xp / 1000)}
                      </UserBoxDescription>
                    </UserBoxText>
                  </MenuUserBox>
                  <Divider sx={{ mb: 0 }} />
                  <List sx={{ p: 1 }} component="nav">
                    <ListItem button to={"/userpage/" + props.userSelected.id} component={NavLink}>
                      <AccountBoxTwoToneIcon fontSize="small" />
                      <ListItemText primary="Visit Profile" />
                    </ListItem>
                    <ListItem button to={(props.userSelected.status != "online" && props.userSelected.status != "offline") ? "/pong/stream/" + props.userSelected.id : "/pong/invite/" + props.userSelected.id} component={NavLink}>
                      <SportsEsportsIcon fontSize="small" />
                      <ListItemText primary={(props.userSelected.status != "online" && props.userSelected.status != "offline") ? "Watch game" : "Invite to play"} />
                    </ListItem>
                    {isUserBlocked(props.userSelected) ?
                      <ListItem button onClick={props.handleBlockOrUnBlock}>
                        <LockOpenRoundedIcon fontSize="small" />
                        <ListItemText primary="Unblock user" />
                      </ListItem>
                      :
                      <ListItem button onClick={props.handleBlockOrUnBlock}>
                        <LockRoundedIcon fontSize="small" />
                        <ListItemText primary="Block user" />
                      </ListItem>
                    }
                  </List>
                  {!isUserBlocked(props.userSelected) &&
                    <>
                      <Divider />
                      <Box sx={{ m: 1 }}>
                        <props.FriendShipStatus relationshipStatus={props.relationshipStatus} />
                      </Box>
                    </>
                  }
                </Popover>
              }
            </ListItemWrapper>
          ))}
          {filteredUsers.length == 0 &&
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
                No users to show !
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
