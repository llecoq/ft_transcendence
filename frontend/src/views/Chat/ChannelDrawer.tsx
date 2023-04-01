import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockTwoToneIcon from '@mui/icons-material/BlockTwoTone';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import NotificationsOffTwoToneIcon from '@mui/icons-material/NotificationsOffTwoTone';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import {
    Accordion, AccordionDetails, DialogContent, Link, Hidden, Chip, Autocomplete, Theme, AccordionSummary, Alert, Avatar, AvatarGroup, Badge, Box, Button, CircularProgress, Divider, Drawer, lighten, List, ListItem, ListItemAvatar, ListItemButton, AlertColor, ListItemIcon, ListItemText, MenuItem, Popover, Select, SelectChangeEvent, Snackbar, styled, TextField, Tooltip, Typography, useTheme
} from '@mui/material';
import { formatDistance, subMinutes } from 'date-fns';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface user {
    username: string;
    xp: string;
    avatar: string;
}

const StyledBadgeUnavailable = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#cccfd3',
        color: '#cccfd3',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
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

const ListItemWrapper = styled(ListItemButton)(
    ({ theme }) => `
          &.MuiButtonBase-root {
              margin: ${theme.spacing(1)} 0;
          }
    `
);

const UserBoxDescription = styled(Typography)(
    ({ theme }) => `
          color: ${lighten(theme.palette.secondary.main, 0.5)}
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

const AccordionSummaryWrapper = styled(AccordionSummary)(
    ({ theme }) => `
        &.Mui-expanded {
          min-height: 48px;
        }

        .MuiAccordionSummary-content.Mui-expanded {
          margin: 12px 0;
        }

        .MuiSvgIcon-root {
          transition: ${theme.transitions.create(['color'])};
        }

        &.MuiButtonBase-root {

          margin-bottom: ${theme.spacing(0.5)};

          &:last-child {
            margin-bottom: 0;
          }

          &.Mui-expanded,
          &:hover {
            background: ${theme.colors.alpha.black[10]};

            .MuiSvgIcon-root {
              color: ${theme.colors.primary.main};
            }
          }
        }
`
);


function ChannelDrawer(props) {
    const theme = useTheme();
    const { user, socket } = useAuth();
    const [expanded, setExpanded] = useState<string | false>('section2');
    const ref = useRef<any>(null);
    const [channelType, setchannelType] = useState(null);
    const [channelPassword, setchannelPassword] = useState("");
    const [channelName, setChannelName] = useState(props.channel.name);
    const [displaySnackbarError, setDisplaySnackbarError] = useState(false);
    const [displaySnackbarSuccess, setDisplaySnackbarSuccess] = useState(false);
    const [snackbarMessage, setDisplaySnackbarMessage] = useState("");
    const [showLoading, setShowLoading] = useState({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false });
    const [banDuration, setBanDuration] = useState(5);
    const [muteDuration, setMuteDuration] = useState(5);
    const [snackBarMsg, setSnackBarMsg] = useState("");
    const [snackbartype, setSnackBarType] = useState<AlertColor>("success");
    const [displaySnackbar, setDisplaySnackbar] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        setChannelName(props.channel.name)
        setchannelType(props.channel.type)
    }, [props.channel.id]);


    useEffect(() => {
        setShowLoading({ addUsers: false, ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false });
    }, [props.channel]);

    const handleChangechannelType = (event: SelectChangeEvent) => {
        setchannelType(event.target.value);
    };

    const handleChangechannelPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setchannelPassword(event.target.value);
    };

    const handleChangeChannelName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChannelName(event.target.value);
    };

    const handleChange =
        (section: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? section : false);
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

    const handleSetChannelName = (): void => {
        if (
            channelName.length <= 4 ||
            channelName.length > 20 ||
            !(/^[A-Za-z0-9 ]+$/.test(channelName))
        ) {
            setSnackBarMsg(
                "Channel name must be 5 to 20 characters : letters, spaces or digits only"
            );
            setSnackBarType("error");
            setDisplaySnackbar(true);
            return;
        }
        try {
            socket.emit("setChannelName", { channelName: channelName, channelId: props.channel.id }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Channel name modified");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };

    const handleAddUsers = (): void => {
        setShowLoading({ addUsers: true, ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false });
        try {
            socket.emit("addUsersToChannel", { channelId: props.channel.id, users: selectedUsers }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setSelectedUsers([])
                    setDisplaySnackbarMessage("Users added to channel");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };

    const handleSetUnsetAdmin = (): void => {
        setShowLoading({ addUsers: false, ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: true, quit: false });
        try {
            socket.emit("setUnsetChannelAdmin", { channelId: props.channel.id, userId: props.userSelected.id }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Channel admins updated");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };
    const handleSetChannelType = (): void => {
        if (
            channelType == "protected" && (
                channelPassword.length <= 4 ||
                channelPassword.length > 20 ||
                !(/^[A-Za-z0-9]+$/.test(channelPassword)))
        ) {
            setSnackBarMsg(
                "Channel password must be 5 to 20 characters : letters or digits only"
            );
            setSnackBarType("error");
            setDisplaySnackbar(true);
            return;
        }
        try {
            socket.emit("setChannelType", { channelType: channelType, channelPassword: channelPassword, channelId: props.channel.id }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setchannelPassword("");
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Channel type modified");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };

    const handleKickUser = (): void => {
        try {
            socket.emit("kickUserFromChannel", { channelId: props.channel.id, userId: props.userSelected.id }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    props.setUserSelected(null)
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Channel type modified");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };
    3
    const handleMuteUser = (): void => {
        setShowLoading({ addUsers: false, ban: false, unban: false, mute: true, unMute: false, setUnsetAdmin: false, quit: false });
        try {
            socket.emit("muteUserFromChannel", { channelId: props.channel.id, userId: props.userSelected.id, duration: muteDuration }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Mute user done");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };

    const handleUnmuteUser = (): void => {
        setShowLoading({ addUsers: false, ban: false, unban: false, mute: false, unMute: true, setUnsetAdmin: false, quit: false });
        try {
            socket.emit("muteUserFromChannel", { channelId: props.channel.id, userId: props.userSelected.id, duration: -1 }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Unmute user done");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };


    const handleBanUser = (): void => {
        setShowLoading({ addUsers: false, ban: true, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false });
        try {
            socket.emit("banUserFromChannel", { channelId: props.channel.id, userId: props.userSelected.id, duration: banDuration }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Ban user done");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };

    const handleUnbanUser = (): void => {
        setShowLoading({ addUsers: false, ban: false, unban: true, mute: false, unMute: false, setUnsetAdmin: false, quit: false });
        try {
            socket.emit("banUserFromChannel", { channelId: props.channel.id, userId: props.userSelected.id, duration: -1 }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Unban user done");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };


    const handleUserQuit = (): void => {
        setShowLoading({ addUsers: false, ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: true });
        try {
            socket.emit("quitChannel", { channelId: props.channel.id }, (response) => {
                if (response.status != 200) {
                    setDisplaySnackbarError(true);
                    setDisplaySnackbarMessage(response.message);
                    setShowLoading({ ban: false, unban: false, mute: false, unMute: false, setUnsetAdmin: false, quit: false, addUsers: false })
                }
                else {
                    props.setUserSelected(null)
                    setDisplaySnackbarSuccess(true);
                    setDisplaySnackbarMessage("Channel type modified");
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);
        }
    };

    const handleClose = (): void => {
        props.setUserBoxOpen(false);
    };

    const isUserBlocked = (userParam) => {
        return (userParam.usersWhoBlockedMe?.find(userSearch => userSearch.id == user.id))
    };

    const isUserMuted = () => {
        let res = props.channel.mutedUsers.slice().reverse().find(mutedUser => mutedUser.user.id == props.userSelected.id)
        if (res && new Date(res.until) >= new Date(Date.now()))
            return true
        else
            return false;
    };

    const isUserBanned = () => {
        let res = props.channel.bannedUsers.slice().reverse().find(bannedUser => bannedUser.user.id == props.userSelected.id)
        if (res && new Date(res.until) >= new Date(Date.now()))
            return true
        else
            return false;
    };

    return (
        <>
            {props.channel &&
                <Drawer
                    variant="temporary"
                    anchor={theme.direction === 'rtl' ? 'left' : 'right'}
                    open={props.drawerOpen}
                    onClose={props.handleDrawerToggle}
                    elevation={9}
                >
                    <Snackbar open={displaySnackbar} autoHideDuration={3000} onClose={function () { setDisplaySnackbar(false); }}>
                        <Alert severity={snackbartype} sx={{ width: '100%' }}>
                            {snackBarMsg}
                        </Alert>
                    </Snackbar>
                    <Box
                        sx={{
                            minWidth: 360
                        }}
                        p={2}
                    >
                        <Box
                            sx={{
                                textAlign: 'center'
                            }}
                        >
                            {props.channel.type == "direct" ?
                                props.channel.users.find(usersearch => usersearch.id != user.id)?.status == "offline" ?
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
                                                    mx: 'auto',
                                                    my: 2,
                                                    width: theme.spacing(12),
                                                    height: theme.spacing(12)
                                                }}
                                                src={user.avatar}
                                            />
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>
                            }
                            <Typography variant="h4">{props.channel.type == "direct" ? props.channel.users.find(usersearch => usersearch.id != user.id).username : props.channel.name}</Typography>
                            <Typography variant="subtitle2">
                                Active{' '}
                                {formatDistance(subMinutes(new Date(), 7), new Date(), {
                                    addSuffix: true
                                })}
                            </Typography>
                        </Box>
                        <Divider
                            sx={{
                                my: 3
                            }}
                        />
                        {(props.channel.type != "direct" && (props.channel.adminUsers.find(userSearch => user.id == userSearch.id) || props.channel.owner.id == user.id)) && !(props.channel.type == "protected" && !props.channel.messages) &&
                            <Accordion
                                expanded={expanded === 'section0'}
                                onChange={handleChange('section0')}
                            >
                                <AccordionSummaryWrapper expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h5">Add Users</Typography>
                                </AccordionSummaryWrapper>
                                <AccordionDetails
                                    sx={{
                                        p: 0
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between">
                                        <Autocomplete
                                            multiple
                                            value={selectedUsers}
                                            onChange={(event, value) => setSelectedUsers(value)}
                                            sx={{ width: "80%", pr: 2 }}
                                            id="tags-filled"
                                            options={props.users.filter(user => !props.channel.users.find(usr => user.id == usr.id)) ? props.users.filter(user => !props.channel.users.find(usr => user.id == usr.id)) : []}
                                            getOptionLabel={option => option.username}
                                            renderTags={(value: readonly user[], getTagProps) =>
                                                value.map((option: user, index: number) => (
                                                    <Chip variant="outlined" label={option.username} {...getTagProps({ index })} />
                                                ))
                                            }
                                            renderOption={(props: object, option: any, state: object) => (
                                                <DialogContent {...props}>
                                                    <Hidden smDown>
                                                        <ListItemAvatar>
                                                            {option.status == "offline" ?
                                                                <StyledBadgeUnavailable
                                                                    overlap="circular"
                                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                    variant="dot"
                                                                >
                                                                    <Avatar sx={{
                                                                        width: 48,
                                                                        height: 48
                                                                    }}
                                                                        src={option.avatar}
                                                                        alt={option.username} />
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
                                                                        src={option.avatar}
                                                                        alt={option.username} />
                                                                </StyledBadgeAvailable>
                                                            }
                                                        </ListItemAvatar>
                                                    </Hidden>
                                                    <Box flex="1">
                                                        <Box display="flex" justifyContent="space-between">
                                                            <Link
                                                                href="#"
                                                                underline="hover"
                                                                sx={{ fontWeight: 'bold' }}
                                                                variant="body2"
                                                            >
                                                                {option.username}
                                                            </Link>
                                                        </Box>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{
                                                                color: (theme: Theme) =>
                                                                    lighten(theme.palette.secondary.main, 0.5)
                                                            }}
                                                        >
                                                            Level {Math.floor(option.xp / 1000)}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ my: 1 }} component="li" />
                                                </DialogContent>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    autoFocus={true}
                                                    error={selectedUsers.length === 0 && showLoading.addUsers}
                                                    helperText={(selectedUsers.length === 0 && showLoading.addUsers) ? 'Please add users' : ' '}
                                                    placeholder="Search username..."
                                                    fullWidth
                                                    label="Search users"
                                                />
                                            )}
                                        />
                                        <Button
                                            size="medium"
                                            variant="contained"
                                            onClick={handleAddUsers}
                                            sx={{ height: "53px", width: "220px" }}
                                        >
                                            {showLoading.addUsers && <CircularProgress size={20} sx={{
                                                marginRight: "7px",
                                                color: (theme: Theme) =>
                                                    lighten(theme.palette.secondary.main, 0.5)
                                            }} />
                                            }
                                            Add users
                                        </Button>
                                    </Box>
                                    <Snackbar open={displaySnackbarError} autoHideDuration={3000} onClose={function () { setDisplaySnackbarError(false); }}>
                                        <Alert severity="error" sx={{ width: '100%' }}>
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>
                                    <Snackbar open={displaySnackbarSuccess} autoHideDuration={3000} onClose={function () { setDisplaySnackbarSuccess(false); }}>
                                        <Alert severity="success" sx={{ width: '100%' }}>
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>
                                </AccordionDetails>
                            </Accordion>
                        }
                        {props.channel.type != "direct" && props.channel.owner.id == user.id && !(props.channel.type == "protected" && !props.channel.messages) &&
                            <Accordion
                                expanded={expanded === 'section1'}
                                onChange={handleChange('section1')}
                            >
                                <AccordionSummaryWrapper expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h5">Channel Settings</Typography>
                                </AccordionSummaryWrapper>
                                <AccordionDetails
                                    sx={{
                                        p: 0
                                    }}
                                >
                                    <List>
                                        <ListItem>
                                            <Box display="flex" justifyContent="left">
                                                <TextField
                                                    placeholder="Channel name"
                                                    label="Channel name"
                                                    value={channelName}
                                                    onChange={handleChangeChannelName}
                                                    error={channelName === ""}
                                                    helperText={(channelName === "") ? 'Please name your channel' : ' '}
                                                />
                                                <Button
                                                    size="medium"
                                                    variant="contained"
                                                    sx={{ height: "53px", ml: 2 }}
                                                    onClick={handleSetChannelName}
                                                >
                                                    Change channel name
                                                </Button>
                                            </Box>
                                        </ListItem>
                                        <ListItem>
                                            <Box display="flex" justifyContent="left">
                                                <Select
                                                    sx={{ height: "53px" }}
                                                    value={channelType}
                                                    onChange={handleChangechannelType}
                                                >
                                                    <MenuItem value={'protected'}>Private password protected channel</MenuItem>
                                                    <MenuItem value={'private'}>Private channel</MenuItem>
                                                    <MenuItem value={'public'}>Public channel</MenuItem>
                                                </Select>

                                                {channelType == 'protected' &&
                                                    <TextField
                                                        sx={{ ml: 2 }}
                                                        placeholder="Conversation access password ..."
                                                        type="password"
                                                        label="Channel password"
                                                        value={channelPassword}
                                                        onChange={handleChangechannelPassword}
                                                        error={channelType === "protected" && channelPassword == ""}
                                                        helperText={(channelType === "protected" && channelPassword == "") ? 'Please add password' : ' '}

                                                    />
                                                }
                                                <Button
                                                    size="medium"
                                                    variant="contained"
                                                    sx={{ height: "53px", ml: 2 }}
                                                    onClick={handleSetChannelType}
                                                >
                                                    Change channel type
                                                </Button>
                                            </Box>
                                        </ListItem>
                                    </List>
                                    <Snackbar open={displaySnackbarError} autoHideDuration={3000} onClose={function () { setDisplaySnackbarError(false); }}>
                                        <Alert severity="error" sx={{ width: '100%' }}>
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>
                                    <Snackbar open={displaySnackbarSuccess} autoHideDuration={3000} onClose={function () { setDisplaySnackbarSuccess(false); }}>
                                        <Alert severity="success" sx={{ width: '100%' }}>
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>
                                </AccordionDetails>
                            </Accordion>
                        }
                        <Accordion
                            expanded={expanded === 'section2'}
                            onChange={handleChange('section2')}
                        >
                            <AccordionSummaryWrapper expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h5">Manage Users</Typography>
                            </AccordionSummaryWrapper>
                            <AccordionDetails
                                sx={{
                                    p: 0
                                }}
                            >
                                <List disablePadding component="div" ref={ref}>
                                    {props.channel.users.map((userElem, index) => (
                                        <ListItemWrapper selected key={index}>
                                            <ListItemAvatar onClick={() => { handleOpen(userElem); }}>
                                                {userElem.id == user.id || props.users.find(userSearch => userElem.id == userSearch.id)?.status != "offline" ?
                                                    <StyledBadgeAvailable
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        variant="dot"
                                                    >
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48
                                                        }}
                                                            src={userElem.avatar}
                                                            alt={userElem.username} />
                                                    </StyledBadgeAvailable>
                                                    : <StyledBadgeUnavailable
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        variant="dot"
                                                    >
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48
                                                        }}
                                                            src={userElem.avatar}
                                                            alt={userElem.username} />
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
                                                secondary={`${props.channel.type != "direct" ? userElem.id == props.channel.owner.id ? "Owner - " : props.channel.adminUsers.find(userSearch => userSearch.id == userElem.id) ? "Admin - " : "" : ""} ${userElem.id != user.id && props.users.find(userSearch => userElem.id == userSearch.id)?.status != "online" && props.users.find(userSearch => userElem.id == userSearch.id)?.status != "offline" ? props.users.find(userSearch => userElem.id == userSearch.id)?.status : "Level " + Math.floor(userElem.xp / 1000)}`}
                                            />
                                            {props.userSelected &&
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
                                                    <Snackbar open={displaySnackbarError} autoHideDuration={3000} onClose={function () { setDisplaySnackbarError(false); }}>
                                                        <Alert severity="error" sx={{ width: '100%' }}>
                                                            {snackbarMessage}
                                                        </Alert>
                                                    </Snackbar>
                                                    <Snackbar open={displaySnackbarSuccess} autoHideDuration={3000} onClose={function () { setDisplaySnackbarSuccess(false); }}>
                                                        <Alert severity="success" sx={{ width: '100%' }}>
                                                            {snackbarMessage}
                                                        </Alert>
                                                    </Snackbar>
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
                                                        {props.userSelected.id != user.id &&
                                                            <>
                                                                <ListItem button to={(props.users.find(userSearch => props.userSelected.id == userSearch.id).status != "online" && props.users.find(userSearch => props.userSelected.id == userSearch.id).status != "offline") ? "/pong/stream/" + props.userSelected.id : "/pong/invite/" + props.userSelected.id} component={NavLink}>
                                                                    <SportsEsportsIcon fontSize="small" />
                                                                    <ListItemText primary={(props.users.find(userSearch => props.userSelected.id == userSearch.id).status != "online" && props.users.find(userSearch => props.userSelected.id == userSearch.id).status != "offline") ? "Watch game" : "Invite to play"} />
                                                                </ListItem>
                                                                {isUserBlocked(userElem) ?
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
                                                                {(props.channel.type != "direct" && (props.channel.adminUsers.find(userSearch => user.id == userSearch.id) || props.channel.owner.id == user.id) && props.userSelected.id != props.channel.owner.id) && !(props.channel.type == "protected" && !props.channel.messages) &&
                                                                    <>
                                                                        <Divider />
                                                                        <ListItem button onClick={handleSetUnsetAdmin}>
                                                                            {showLoading.setUnsetAdmin && <CircularProgress size={15} />}
                                                                            <AdminPanelSettingsIcon fontSize="small" />
                                                                            <ListItemText primary={props.channel.adminUsers.find(userSearch => props.userSelected.id == userSearch.id) ? "Unset admin" : "Set admin"} />
                                                                        </ListItem>
                                                                        <ListItem button onClick={handleKickUser}>
                                                                            <ExitToAppIcon fontSize="small" />
                                                                            <ListItemText primary="Kick" />
                                                                        </ListItem>
                                                                        {isUserMuted() ?
                                                                            <ListItem button onClick={handleUnmuteUser}>
                                                                                {showLoading.unMute && <CircularProgress size={15} />}
                                                                                <NotificationsOffTwoToneIcon fontSize="small" />
                                                                                <ListItemText primary="UnMute" />
                                                                            </ListItem>
                                                                            :
                                                                            <ListItem>
                                                                                <ListItem button onClick={handleMuteUser} style={{ width: "110px" }}>
                                                                                    {showLoading.mute && <CircularProgress size={15} />}
                                                                                    <NotificationsOffTwoToneIcon fontSize="small" />
                                                                                    <ListItemText primary="Mute" />
                                                                                </ListItem>
                                                                                <TextField
                                                                                    sx={{ ml: 2, width: "100px" }}
                                                                                    label="Minutes of mute"
                                                                                    type="number"
                                                                                    variant="standard"
                                                                                    InputProps={{
                                                                                        inputProps: { min: 1 }
                                                                                    }}
                                                                                    onChange={(e) => setMuteDuration(+e.target.value)}
                                                                                    value={muteDuration}
                                                                                    InputLabelProps={{
                                                                                        shrink: true,
                                                                                    }}
                                                                                />
                                                                            </ListItem>
                                                                        }
                                                                        {isUserBanned() ?
                                                                            <ListItem button onClick={handleUnbanUser}>
                                                                                {showLoading.unban && <CircularProgress size={15} />}
                                                                                <BlockTwoToneIcon fontSize="small" />
                                                                                <ListItemText primary="Unban" />
                                                                            </ListItem>
                                                                            :
                                                                            <ListItem>
                                                                                <ListItem button onClick={handleBanUser} style={{ width: "110px" }}>
                                                                                    {showLoading.ban && <CircularProgress size={15} />}
                                                                                    <BlockTwoToneIcon fontSize="small" />
                                                                                    <ListItemText primary="Ban" />
                                                                                </ListItem>
                                                                                <TextField
                                                                                    sx={{ ml: 2, width: "100px" }}
                                                                                    label="Minutes of ban"
                                                                                    type="number"
                                                                                    variant="standard"
                                                                                    InputProps={{
                                                                                        inputProps: { min: 1 }
                                                                                    }}
                                                                                    onChange={(e) => setBanDuration(+e.target.value)}
                                                                                    value={banDuration}
                                                                                    InputLabelProps={{
                                                                                        shrink: true,
                                                                                    }}
                                                                                />
                                                                            </ListItem>
                                                                        }
                                                                    </>
                                                                }
                                                            </>
                                                        }
                                                    </List>
                                                    {(props.userSelected.id != user.id && !isUserBlocked(props.userSelected)) &&
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
                                </List>
                            </AccordionDetails>
                        </Accordion>
                        <Box display="flex" justifyContent="center">
                            {props.channel.type != "direct" &&
                                <>
                                    <Button startIcon={<ExitToAppIcon />} variant="outlined" sx={{ margin: 1 }} color="error" onClick={handleUserQuit}>
                                        {showLoading.quit && <CircularProgress size={20} sx={{ mr: 2 }} />}
                                        Quit Channel
                                    </Button>
                                </>
                            }
                        </Box>
                    </Box>
                </Drawer>
            }
        </>
    );
}

export default ChannelDrawer;