import { Avatar, Box, lighten, styled, Typography } from "@mui/material";
import PropTypes from 'prop-types';

const UserBoxAvatarReverse = styled(Box)(
    ({ theme }) => `
      margin-left: auto; 
      margin-right: 0;
      padding-right: ${theme.spacing(1)};
  `
);

const UserBoxAvatar = styled(Box)(
    ({ theme }) => `
      padding-left: ${theme.spacing(1)};
  `
);

const UserBoxTextReverse = styled(Box)(
  ({ theme }) => `
        text-align: right;
        padding-right: ${theme.spacing(1)};
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

DisplayGameRoomInfos.propTypes = {
  gameRoomInfos: PropTypes.any.isRequired,
  display: PropTypes.string
}

export default function DisplayGameRoomInfos(props) {
  const { gameRoomInfos, display } = props
  const srcMapGif: string = gameRoomInfos.map === 'modern' ? "/static/images/gif/PongModernGif.gif" : "/static/images/gif/PongRetroGif.gif"
  const playerOne = { 
    avatar: gameRoomInfos.playerOneAvatar ? gameRoomInfos.playerOneAvatar : gameRoomInfos.avatar, 
    xp: gameRoomInfos.playerOneLevel ? gameRoomInfos.playerOneLevel : gameRoomInfos.xp,
    username: gameRoomInfos.playerOneUsername ? gameRoomInfos.playerOneUsername : gameRoomInfos.username 
  }
  const playerTwo = { 
    avatar: gameRoomInfos.playerTwoAvatar, 
    xp: gameRoomInfos.playerTwoLevel,
    username: gameRoomInfos.playerTwoUsername
  }

  return (
    <Box width='100%' display='flex' flexDirection='row' mt={1}>
      {/* playerOneBox */}
      <Box width={2/5} display='flex' flexDirection='column' justifyContent='center'>
        <UserBoxAvatarReverse>
          <Avatar variant="rounded" alt={playerOne.username} src={playerOne.avatar} />
        </UserBoxAvatarReverse>
        <UserBoxTextReverse>
          <UserBoxLabel variant="body1">{playerOne.username}</UserBoxLabel>
          <UserBoxDescription variant="body2">
            Level {Math.floor(playerOne.xp / 1000)}
          </UserBoxDescription>
        </UserBoxTextReverse>
      </Box>
      {/* mapBox */}
      <Box width={1/5} component='img' src={srcMapGif}>

      </Box>
      {/* playerTwoBox */}
      {  display !== 'joinGame' &&
      <Box width={2/5} display='flex' flexDirection='column' justifyContent='center'>
        <UserBoxAvatar>
            <Avatar variant="rounded" alt={playerTwo.username} src={playerTwo.avatar} />
        </UserBoxAvatar>
        <UserBoxText>
          <UserBoxLabel variant="body1">{playerTwo.username}</UserBoxLabel>
          <UserBoxDescription variant="body2">
            Level {Math.floor(playerTwo.xp / 1000)}
          </UserBoxDescription>
        </UserBoxText>
      </Box>
      }
    </Box>
  )
}