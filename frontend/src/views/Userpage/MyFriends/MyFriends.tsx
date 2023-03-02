import { Avatar, Box, Button, Card, CardContent, Chip, Container, Grid, IconButton, List, ListItemAvatar, Paper, Stack, styled, Typography } from '@mui/material'
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import LiveTvRoundedIcon from '@mui/icons-material/LiveTvRounded';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import useAuth from 'src/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Status } from '../CommonComponents/Status';

function InviteOrWatchGame({ status, friend }) {
	const navigate = useNavigate();
	
  const handleStream = () => {
		navigate('/pong/stream/' + friend.id)
  } 

	const handleGameInvite = () => {
		navigate('/pong/invite/' + friend.id);
	}
	if (status === "online")
		return <Button onClick={handleGameInvite} size='small' color='primary' variant="contained" startIcon={<SportsEsportsIcon />}>Invite to Game</Button>
	else if (status.startsWith("Playing"))
		return <Button onClick={handleStream} size='small' color='primary' variant="contained" startIcon={<LiveTvRoundedIcon />}>Watch Game</Button>
	return null;
}

function FriendItem({ friend, setRequestedUser }) {
	const { socket } = useAuth();
	const [removedUser, setRemovedUser]: any = useState(false);

	const navigate = useNavigate();
	const navigateToUserpage = () => {
		navigate('/userpage/' + friend.id);
    window.scrollTo(0, 0);
		setRequestedUser(friend);
	};

	const handleUnfriend = async () => {
		await socket.emit('removeFriendshipEntirely', friend.id, (res) => {
			if (res.status == 200) {
				setRemovedUser(true);
				socket.emit("getFriendshipStatus", friend.id);
			}
		});
	}

	if (removedUser === false) {
		return (
			<Paper sx={{ padding: 2, paddingLeft: 2 }}>
				<Box display="flex" justifyContent="space-between" flexWrap="wrap">
					<Box display="flex">
						<div style={{ cursor: 'pointer' }} onClick={navigateToUserpage}>
							<Avatar
								alt={friend?.username}
								src={friend?.avatar}
								sx={{ width: 70, height: 70 }}
							/>
						</div>
						<Box ml={2}>
							<Typography variant="h3" textTransform="capitalize" >{friend?.username}</Typography>
							<Status status={friend?.status} />
						</Box>
					</Box>
					<Box mt={1} mb={1} mr={1} display="flex">
						<InviteOrWatchGame friend={friend} status={friend?.status} />
						<Button onClick={handleUnfriend} size='small' sx={{ marginLeft: 2 }} color='inherit' variant="contained" startIcon={<PersonRemoveRoundedIcon />}>Remove friend</Button>
					</Box>
				</Box>
			</Paper>)
	}
	return null;
}

export default function MyFriends({setRequestedUser}) {
	const { socket } = useAuth();
	const [friendsList, setFriendsList]: any = useState([]);

	useEffect(() => {
		socket.on("getUsersNotify", () => {
			socket.emit("getAllFriends");
		})
		try {
			socket.emit("getAllFriends");
		} catch (err) {
			console.error("Error response:");
			console.error(err);
		}
    return () => {
			socket.off("getUsersNotify");
			socket.off("getAllFriends");
			socket.off("getFriendshipNotify");
    }
	}, []);


	useEffect(() => {
		socket.on("getAllFriends", (response) => {
			setFriendsList(response);
		});
		socket.on("getFriendshipNotify", (response) => {
			socket.emit("getAllFriends");
		});
	}, [socket]);

	return (
		<Container maxWidth="md">
			<Box mt={4} paddingBottom={8}>
				<Card>
					<CardContent>
						<Typography marginBottom={2} variant="h3">
							My Friends
						</Typography>
						{friendsList.length ? 
							<Stack spacing={1} >
								{friendsList.map((friend) => <FriendItem key={friend?.id} friend={friend} setRequestedUser={setRequestedUser} />)}
							</Stack>
							: <Typography marginBottom={2} variant="caption">
							Go to the chat to meet players :)
							</Typography>
						}
					</CardContent>
				</Card>
			</Box>
		</Container>
	)
}
