import {
	Card,
	CardContent,
	Container,
	Avatar,
	Typography,
	Box,
	Button,
	Chip,
} from '@mui/material';

import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import { useEffect, useState } from 'react';
import useAuth from 'src/hooks/useAuth';
import { RelationshipStatus } from '..';
import { useParams } from 'react-router';
import { Status } from '../CommonComponents/Status';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';

export function FriendActions({ relationshipStatus, setRelationshipStatus }) {

	const userId = parseInt(useParams().userId);
	const [isBlocked, setIsBlocked] = useState(false);
	const [render, setRender] = useState(false);
	const { socket } = useAuth();

	useEffect(() => {
		socket.on("getBlockedStatus", response => {
			setIsBlocked(response);
			setRender(true);
		});

		socket.emit("getBlockedStatus", userId);
			
		return () => {
			socket.off("getBlockedStatus");
    }
	}, []);

	const handleAddFriend = async () => {
		await socket.emit('createFriendship', userId, (res) => {
			if (res.status == 200) {
				setRelationshipStatus(RelationshipStatus.PENDING);
				socket.emit("getFriendshipStatus", userId);
			}
		});
	}
	const handleAcceptFriend = async () => {
		await socket.emit('createFriendship', userId, (res) => {
			if (res.status == 200) {
				setRelationshipStatus(RelationshipStatus.FRIEND);
				socket.emit("getFriendshipStatus", userId);
			}
		});
	}

	const handleUnfriend = async () => {
		await socket.emit('removeFriendshipEntirely', userId, (res) => {
			if (res.status == 200) {
				setRelationshipStatus(RelationshipStatus.NOTFRIEND);
				socket.emit("getFriendshipStatus", userId);
			}
		});
	}

	const handleBlockOrUnBlock = async () => {
		await socket.emit('blockOrUnBlockUser', { userBlockedId: userId }, (res) => {
			if (res.status == 200) {
				if (res.blocked == true)
					setIsBlocked(true);
				else if (res.blocked == false)
					setIsBlocked(false);
			}
		});
	}


	const FriendShipStatus = ({ relationshipStatus }) => {
		if (relationshipStatus === RelationshipStatus.FRIEND)
			return <Button onClick={handleUnfriend} color='inherit' variant="contained" startIcon={<PersonRemoveRoundedIcon />}>Remove friend</Button>
		else if (relationshipStatus === RelationshipStatus.REQUESTED)
			return <Button onClick={handleAcceptFriend} color='success' variant="contained" startIcon={<CheckCircleOutlineRoundedIcon />}>Accept Friendship</Button>
		else if (relationshipStatus === RelationshipStatus.PENDING)
			return <Button onClick={handleUnfriend} color='inherit' variant="contained" startIcon={<MoreTimeRoundedIcon />}>Pending...</Button>
		else
			return <Button onClick={handleAddFriend} color='primary' variant="contained" startIcon={<PersonAddRoundedIcon />}>Add Friend</Button>
	}

	if (render) {
		if (isBlocked) {
			return (
				<><Button variant="outlined" disabled>User blocked</Button>
				<Button onClick={handleBlockOrUnBlock} color='primary' variant="contained" startIcon={<LockOpenRoundedIcon />}>Unblock</Button></>);
		}
		return (
			<>
			<FriendShipStatus relationshipStatus={relationshipStatus} />
			<Button onClick={handleBlockOrUnBlock} color='error' variant="contained" startIcon={<LockRoundedIcon />}>Block User</Button>
		</>
	);
	}
	return null;
}

export default function TopBarContent({ isMyProfile, requestedUser, relationshipStatus, setRelationshipStatus, handleScrollToMyFriends }) {

	return (
		<Container maxWidth="md">
			<Box mt={4} mb={4}>
				<Card>
					<CardContent>
						<Box display="flex" justifyContent="space-between" flexWrap="wrap">
							<Box display="flex">
								<Avatar
									alt={requestedUser.username}
									src={requestedUser.avatar}
									sx={{ width: 130, height: 130 }}
								/>
								<Box mt={2} ml={3} display="flex" flexDirection="column" justifyContent="flex-start">
									<Typography mb={1} variant="h3" textTransform="capitalize">{requestedUser.username}</Typography>
									{isMyProfile ? 
									<Chip variant="outlined" color="primary" label="My profile" icon={<BadgeTwoToneIcon />}/>
									:	<Status status={requestedUser.status} /> }
								</Box>
							</Box>
							<Box mt={1} mb={1} mr={2} display="flex" flexDirection="column" justifyContent="space-around">
								{isMyProfile
									? <Button onClick={handleScrollToMyFriends} variant="contained" startIcon={<GroupRoundedIcon />}>My Friends</Button>
									: <FriendActions relationshipStatus={relationshipStatus} setRelationshipStatus={setRelationshipStatus} />}
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Container>
	)
}