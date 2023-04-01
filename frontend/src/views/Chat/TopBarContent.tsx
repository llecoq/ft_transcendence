import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import {
  Avatar, AvatarGroup, Badge, Box,
  IconButton, styled, Tooltip, Typography
} from '@mui/material';
import { formatDistance, subMinutes } from 'date-fns';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import ChannelDrawer from './ChannelDrawer';


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

function TopBarContent(props) {
  const { user } = useAuth();

  const [drawerOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!drawerOpen);
  };
  return (
    <>
      {props.channel && props.users &&
        <>
          <Box display="flex" alignItems="center">
            {props.channel.type == "direct" ?
              props.users.find(userr => props.channel.users.find(usersearch => usersearch.id != user.id).id == userr.id).status == "offline" ?
                <StyledBadgeUnavailable
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar sx={{
                    width: 48,
                    height: 48
                  }}
                    src={props.channel.users.find(usersearch => usersearch.id != user.id).avatar}
                    alt={props.channel.users.find(usersearch => usersearch.id != user.id).username} />
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
                    src={props.channel.users.find(usersearch => usersearch.id != user.id).avatar}
                    alt={props.channel.users.find(usersearch => usersearch.id != user.id).username} />
                </StyledBadgeAvailable>
            :
            <AvatarGroup max={5}>
              {props.channel.users.map((user, index) => (
                <Tooltip arrow title={user.username} key={index}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44
                    }}
                    src={user.avatar}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
            }
            <Box ml={1}>
              <Typography variant="h4">{props.channel.type == "direct" ? props.channel.users.find(usersearch => usersearch.id != user.id).username : props.channel.name}</Typography>
              <Typography variant="subtitle1">
                {formatDistance(subMinutes(new Date(), 8), new Date(), {
                  addSuffix: true
                })}
              </Typography>
            </Box>
          </Box>
          <Box
            display="flex"
          >
            <Tooltip placement="bottom" title="Conversation information">
              <IconButton color="primary" onClick={handleDrawerToggle}>
                <InfoTwoToneIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <ChannelDrawer users={props.users} handleDrawerToggle={handleDrawerToggle} drawerOpen={drawerOpen} channel={props.channel} setUserBoxOpen={props.setUserBoxOpen} isUserBoxOpen={props.isUserBoxOpen} handleBlockOrUnBlock={props.handleBlockOrUnBlock} relationshipStatus={props.relationshipStatus} FriendShipStatus={props.FriendShipStatus} userSelected={props.userSelected} setUserSelected={props.setUserSelected} />
        </>
      }
    </>
  );
}

export default TopBarContent;
