import {
	Grid, Card, Container, Button, Dialog, DialogTitle, Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import GameRoom from './GameRoom';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';
import WatchGame from './WatchGame';
import useAuth from 'src/hooks/useAuth';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import SnackBarComponent from '../../components/CustomSnackBar';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LiveTvRoundedIcon from '@mui/icons-material/LiveTvRounded';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ListIcon from '@mui/icons-material/List';

StartPlayingDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

function StartPlayingDialog(props) {
  const { onClose } = props
  const [action, setAction] = useState('select an action')

  const startNewGame = () => {
    onClose('create a game');
  };

  const joinGame = (action: string) => {
    onClose(action);
  };

  return (
    <Box display='flex' flexDirection='column'>
      {action === 'select an action' && 
        <>
          <Button
            onClick={startNewGame}
            startIcon={<AddIcon />}
            size='large'
          >
            Start a Game
          </Button>
          <Button
            onClick={() => setAction('join a game')}
            startIcon={<ArrowForwardIosIcon />}
          >
            Join a Game
          </Button>
        </>
      }
      { action === 'join a game' &&
        <>
          <Button startIcon={<ShuffleIcon />} size='large' onClick={() => joinGame('auto matchmaking')}>
            Auto Matchmaking
          </Button>
          <Button startIcon={<ListIcon />} size='large' onClick={() => joinGame('matches list')}>
            View Matches list
          </Button>
        </>
      }
    </Box>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired
};

function SimpleDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose('select an action');
  }

  return (
    <Dialog 
      onClose={handleClose} 
      open={open}
    >
      { selectedValue === 'start playing' && 
        <StartPlayingDialog
          onClose={onClose}
        />
      }
    </Dialog>
  );
}

function Pong() {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('selectedValue')
  const [action, setAction] = useState('select an action')
  const [mapName, setMapName] = useState(null)
  const [gameRoomId, setGameRoomId] = useState(null)
  const [numberOfPlayers, setNumberOfPlayers] = useState(0)
  const [snackbarMessage, setSnackbarMessage] = useState(null)
  const {socket, user} = useAuth()
  const params: any = useParams()
  const navigate: NavigateFunction = useNavigate()
  
  //------------------------------------------------------------ INIT
  // check if user is already in a room as a player
  useEffect(() => {
    socketOnUserIsPlaying()
    socketOnGameRoomMap()
    socketOnStreamMode()
    socketOnGetUserById()
    socket.emit('getPlayerStatus', user.id)
	  return () => {
	    socket.off('userIsPlaying')
      socket.off('streamingGameRoomProps')
      socket.off('gameRoomMap')
      socket.off('getUserById')
	  }
  }, [])

  //------------------------------------------------------- SOCKET ON
  const socketOnUserIsPlaying = () => {
    socket.on('userIsPlaying', (message: any) => {
      setMapsProps(message.map, message.gameRoomId, 2, 'rejoin')
      socket.emit('rejoinGameRoom', message.gameRoomId)
	  })
  }

  const socketOnGameRoomMap = () => {
    socket.on('gameRoomMap', (message: any) => {
      if (message.map)
        setMapsProps(message.map, message.gameRoomId, 2, 'join')
    })
  }

  const socketOnStreamMode = () => {
    socket.on('streamingGameRoomProps', (props: any) => {
      setMapsProps(props.map, props.gameRoomId, 2, 'spectate')
    })
  }

  const socketOnGetUserById = () => {
      socket.on('getUserById', (response) => {
        if (response.status === 'offline')
          handleError('Cannot send invitation to offline user')
        else if (params.inviteFriendId == user.id)
          handleError('Cannot send an invite to yourself')
        else {
          setAction('create a game')
          setOpen(true)
      }
    })
  }

  //-------------------------------------------- HANDLE CLICK / CLOSE
  const handleClickOpen = (value: string) => {
    setOpen(true)
    setSelectedValue(value)
  }

  const handleClose = (value: string) => {
    if (value !== 'create a game')
      setOpen(false)
    setAction(value)
  }

  //-------------------------------------------------- SET MAPS PROPS
  const setMapsProps = (mapName: string, gameRoomId: string, numberOfPlayers: number, action: string) => {
    setOpen(false)
    if (mapName && gameRoomId && numberOfPlayers) {
      if (action === 'spectate') {
        socket.emit('getGameRoomMap', gameRoomId, (response) => {
          if (response.status === 404) {
            handleError(response.message)
            resetProps()
            return
          }
        })
      }
      setMapName(mapName)
      setGameRoomId(gameRoomId)
      setNumberOfPlayers(numberOfPlayers)
      setAction(action)
    }
    else if (action === 'create' || action === 'create a game') {
      setAction(action)
      setOpen(true)
    }
    else if (action === 'select an action') {
      resetProps()
    }
  }

  //------------------------------------------ HANDLE CHANGE OF PARAMS
  useEffect(() => {
    if (params.streamFriendId) {
      socket.emit('getStreamingGameRoomProps', parseInt(params.streamFriendId), (response) => {
        if (response.status === 404)
          handleError(response.message)
      })
    }
    else if (params.inviteFriendId) {
			socket.emit('getUserById', parseInt(params.inviteFriendId), (response) => {
				if (response.status === 404) {
          handleError('User does not exist')
        }
			})
    }
    else if (params.acceptInviteGameRoomId) {
      setGameRoomId(params.acceptInviteGameRoomId)
      setAction('select an action')
      socket.emit('getGameRoomMap', params.acceptInviteGameRoomId, (response) => {
        if (response.status === 404)
          handleError(response.message)
      })
    }
  }, [params])

  //---------------------------------------------------- RESET PROPS
  const resetProps = () => {
    setMapName(null)
    setGameRoomId(null)
    setNumberOfPlayers(0)
    setAction('select an action')
    setOpen(false)
    setSelectedValue('selectedValue')
  }

  //--------------------------------------------------- HANDLE ERROR
  const handleError = (errorMessage: string) => {
    resetProps()
    navigate('/pong/')
    setSnackbarMessage(errorMessage)
  }


  return (
    <div>
      <Helmet>
        <title>Pong</title>
      </Helmet>
	    <Container maxWidth="lg">
        { (action === 'select an action' || action === 'create a game') &&
          <Box
          justifyContent='center'
          display='flex'
          mt={2}
          >
            <Box
              maxWidth='sm'
              component="img"
              src="/static/images/gif/PongModernGif.gif"
            />
          </Box>
        }
        <Grid
          container
          justifyContent="center"
          alignItems="stretch"
          spacing={0}
          mt={2}
        >
          <Card>
            { action === 'select an action' &&
              <div>
                <Button 
                  onClick={() => handleClickOpen('start playing')} 
                  size='large'  
                  startIcon={<SportsEsportsIcon />}
                >
                  Start playing
                </Button>
                <Button 
                  onClick={() => setAction('watch a game')} 
                  size='large'  
                  startIcon={<LiveTvRoundedIcon />}
                >
                  Watch a Game
                </Button>
                <SimpleDialog
                  open={open}
                  onClose={handleClose}
                  selectedValue={selectedValue}
                />
              </div>
            }
            { action === 'create a game' &&
              <CreateGame
                open={open}
                onClose={setMapsProps}
                resetProps={resetProps}
                socket={socket}
                inviteFriendId={parseInt(params.inviteFriendId)}
                handleError={handleError}
              />
            }
          </Card>
          { (action === 'auto matchmaking' || action === 'matches list' ) &&
            <JoinGame
              socket={socket}
              onClose={setMapsProps}
              action={action}
            />
          }
          { action === 'watch a game' &&
            <WatchGame
			       	socket={socket}
              onClose={setMapsProps}
            />
          }
	      </Grid>
	    </Container>
      {
        mapName && gameRoomId && numberOfPlayers && action !== 'select an action' &&
        <GameRoom
          mapName={mapName}
          gameRoomId={gameRoomId}
          numberOfPlayers={numberOfPlayers}
          socket={socket}
          action={action}
          onClose={resetProps}
        />
      }
      {snackbarMessage && (
        <SnackBarComponent
          severity="error"
          closeSnack={() => setSnackbarMessage(null)}
          snackbarMessage={snackbarMessage}
        />
      )}
    </div>
  );
}

export default Pong;