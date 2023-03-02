import {
    Alert, Autocomplete, Avatar, Badge, Box, Button, Chip, CircularProgress, Dialog,
    DialogContent, DialogTitle, Divider, Hidden, lighten, Link, ListItemAvatar, ListItemButton, MenuItem, Select, SelectChangeEvent, Slide, Snackbar, styled, TextField, Theme, Typography, AlertColor
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';


const Transition = forwardRef(function Transition(
    props: TransitionProps & { children: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const DialogWrapper = styled(Dialog)(
    () => `
    .MuiDialog-container {
        height: auto;
    }
    
    .MuiDialog-paperScrollPaper {
        max-height: calc(100vh - 64px)
    }
`
);

interface user {
    username: string;
    xp: string;
    avatar: string;
}

const DialogTitleWrapper = styled(DialogTitle)(
    ({ theme }) => `
    background: ${theme.colors.alpha.black[5]};
    padding: ${theme.spacing(3)}
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

function NewConversationPopup(props) {
    const [channelType, setchannelType] = useState('private');
    const [channelPassword, setchannelPassword] = useState('');
    const [channelName, setChannelName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { user, socket } = useAuth();
    const [displaySnackbar, setDisplaySnackbar] = useState(false);
    const [createChannelStarted, setCreateChannelStarted] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [snackBarMsg, setSnackBarMsg] = useState("");
    const [snackbartype, setSnackBarType] = useState<AlertColor>("success");

    const handleChangechannelType = (event: SelectChangeEvent) => {
        setchannelType(event.target.value);
    };

    const handleChangechannelPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setchannelPassword(event.target.value);
    };

    const handleChangeChannelName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChannelName(event.target.value);
    };

    useEffect(() => {
        props.handleClose();
        setShowLoading(false);
    }, [props.channels]);

    useEffect(() => {
        setCreateChannelStarted(false);
    }, [selectedUsers, channelType, channelPassword, channelName]);

    const CreateChannel = async () => {
        setCreateChannelStarted(true);
        try {
            if ((channelName == "" && selectedUsers.length > 1) || selectedUsers.length == 0 || (channelType == "protected" && channelPassword == ""))
                return;
                if (selectedUsers.length > 1 &&(
                    channelName.length <= 4 ||
                    channelName.length > 20 ||
                    !(/^[A-Za-z0-9 ]+$/.test(channelName))
                  )) {
                    setSnackBarMsg(
                      "Channel name must be 5 to 20 characters : letters, spaces or digits only"
                    );
                    setSnackBarType("error");
                    setDisplaySnackbar(true);
                    return;
                  }
                  if (
                    channelType == "protected" &&(
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
            setShowLoading(true);
            socket.emit('createChannel', { name: channelName, type: selectedUsers.length == 1 ? "direct" : channelType, usersList: selectedUsers, password: channelPassword }, (response) => {
                if (response.status === 200) {
                    setSnackBarType("success");
                    setSnackBarMsg("Channel created")
                    setDisplaySnackbar(true);
                    setSelectedUsers([]);
                    setChannelName("");
                    setchannelPassword("");
                    setchannelType("private");
                    props.setCurrentChannelId(response.channel.id)
                }
            });
        } catch (err) {
            console.error("Error response:");
            console.error(err);    // ***
        }
    };

    return (

        <DialogWrapper
            open={props.open}
            TransitionComponent={Transition}
            keepMounted
            maxWidth="md"
            fullWidth
            scroll="paper"
            onClose={props.handleClose}
        >
            <Snackbar open={displaySnackbar} autoHideDuration={3000} onClose={function () { setDisplaySnackbar(false); }}>
                <Alert severity={snackbartype}  sx={{ width: '100%' }}>
                    {snackBarMsg}
                </Alert>
            </Snackbar>
            <DialogTitleWrapper>
                <Typography
                    sx={{
                        mb: 2
                    }}
                    variant="h3"
                >
                    Create conversation
                </Typography>
                {selectedUsers.length > 1 &&
                    <Box display="flex" justifyContent="left"
                        sx={{
                            mb: 2
                        }}>
                        <TextField
                            placeholder="Channel name"
                            label="Channel name"
                            value={channelName}
                            onChange={handleChangeChannelName}
                            error={channelName === "" && createChannelStarted}
                            helperText={(channelName === "" && createChannelStarted) ? 'Please name your channel' : ' '}
                        />
                        <Select
                            sx={{ ml: 2, height: "53px" }}
                            value={channelType}
                            onChange={handleChangechannelType}
                        >
                            <MenuItem value={'private'}>Private channel</MenuItem>
                            <MenuItem value={'public'}>Public channel</MenuItem>
                            <MenuItem value={'protected'}>Private password protected channel</MenuItem>
                        </Select>

                        {channelType == 'protected' &&
                            <TextField
                                sx={{ ml: 2 }}
                                placeholder="Conversation access password ..."
                                type="password"
                                label="Channel password"
                                value={channelPassword}
                                onChange={handleChangechannelPassword}
                                error={channelType === "protected" && channelPassword == "" && createChannelStarted}
                                helperText={(channelType === "protected" && channelPassword == "" && createChannelStarted) ? 'Please add password' : ' '}

                            />
                        }
                    </Box>
                }
                <Box display="flex" justifyContent="space-between">
                    <Autocomplete
                        multiple
                        value={selectedUsers}
                        onChange={(event, value) => setSelectedUsers(value)}
                        sx={{ width: "80%", pr: 2 }}
                        id="tags-filled"
                        options={props.users ? props.users : []}
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
                                error={selectedUsers.length === 0 && createChannelStarted}
                                helperText={(selectedUsers.length === 0 && createChannelStarted) ? 'Please add users' : ' '}
                                placeholder="Search username..."
                                fullWidth
                                label="Search users"
                            />
                        )}
                    />
                    <Button
                        size="medium"
                        variant="contained"
                        onClick={CreateChannel}
                        sx={{ height: "53px", width: "220px" }}
                    >
                        {showLoading && <CircularProgress size={20} sx={{
                            marginRight: "7px",
                            color: (theme: Theme) =>
                                lighten(theme.palette.secondary.main, 0.5)
                        }} />
                        }
                        Create conversation
                    </Button>
                </Box>
            </DialogTitleWrapper>
        </DialogWrapper>

    );
}

export default NewConversationPopup;