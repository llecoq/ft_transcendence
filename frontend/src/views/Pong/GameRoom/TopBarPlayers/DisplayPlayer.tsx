import { Box, Card, Avatar, Typography, styled, lighten } from '@mui/material';
import PropTypes from 'prop-types';

const ReverseUserBoxText = styled(Box)(
    ({ theme }) => `
          text-align: left;
          padding-left: ${theme.spacing(1)};
  `
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: right;
        padding-right: ${theme.spacing(1)};
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


DisplayPlayer.propTypes = {
  player: PropTypes.any.isRequired,
  flexDirection: PropTypes.string.isRequired
}

export default function DisplayPlayer (props) {
  const { player, flexDirection } = props
  const justifyAvatar: string = flexDirection === 'row-reverse' ? 'right' : 'left'
  const justifyTypography: string = flexDirection === 'row-reverse' ? 'left' : 'right'

  return (
    <Box 
      display='flex'
      justifyContent='space-evenly'
      flexDirection={flexDirection}
      sx={{width: 1/2}}
    >
      <Box sx={{ width: 1/2 }} display='flex' justifyContent={justifyTypography} >
        { flexDirection === 'row' && 
          <UserBoxText>
            <UserBoxLabel variant="body1">
              {player.username}
            </UserBoxLabel>
            <UserBoxDescription variant="body2">
              Level {Math.floor(player.xp / 1000)}
            </UserBoxDescription>
          </UserBoxText>
        }
        { flexDirection === 'row-reverse' && 
          <ReverseUserBoxText>
            <UserBoxLabel variant="body1">
              {player.username}
            </UserBoxLabel>
            <UserBoxDescription variant="body2">
              Level {Math.floor(player.xp / 1000)}
            </UserBoxDescription>
          </ReverseUserBoxText>
        }
      </Box>
      <Box sx={{ width: 1/2 }} display='flex' justifyContent={justifyAvatar} >
          <Avatar
            src={player.avatar}
            alt={player.username}
            variant='rounded'
          />
      </Box>
    </Box>
  )

}