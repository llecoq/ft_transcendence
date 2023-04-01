import {
	Dialog, DialogTitle, Button, Typography, Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useAuth from 'src/hooks/useAuth';
import { useNavigate } from 'react-router';
import SnackBarComponent from '../../../../components/CustomSnackBar';
import StatsTable from 'src/views/Userpage/MiddleSection/StatsTable';

GameStatusHandler.propTypes = {
  gameRoomId: PropTypes.string.isRequired,
  numberOfPlayers: PropTypes.number.isRequired,
  socket: PropTypes.any.isRequired,
  action: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
}

export default function GameStatusHandler(props) {
  const { gameRoomId, socket, action, numberOfPlayers, onClose } = props
  const [gameStatus, setGameStatus] = useState('Waiting for opponent...')
  const [open, setOpen] = useState(false)
  const [counter, setCounter] = useState(5)
  const [gameOver, setGameOver] = useState(false)
  const { user } = useAuth()
  const [opponentIsOffline, setOpponentIsOffline] = useState(false)
  const [quitGame, setQuitGame] = useState(false)
  const navigate = useNavigate()
  const [invitationRefused, setInvitationRefused] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState(null)
  const [stats, setStats] = useState(null)
  const [matches, setMatches] = useState(null)
  const [role, setRole] = useState(null)

  //---------------------------------------------------------------- INIT
  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    handleConnections()
	  socketOnRoomIsFull()
    socketOnUpdateCounter()
    socketOnWaitingForOpponent()
    socketOnRejoin()
    socketOnGameStarts()
    socketOnInvitationRefused()
    if (action !== 'spectate') {
      socketOnUserStats()
      socketOnUserMatches()
      socket.on("Created match", () => {
        socket.emit('getUserStats', user)
        socket.emit("getUserMatches", user)
      })
    }

	  return () => {
      socket.emit('leaveGameRoom', {gameRoomId: gameRoomId, userId: user.id})
	    socket.off('roomIsFull')
      socket.off('waitingForOpponent')
      socket.off('rejoin')
      socket.off('updateCounter')
      socket.off('gameStarts')
      socket.off('invitationRefused')
      socket.off("userStats")
      socket.off("userMatches")
			socket.off("Created match")
      window.removeEventListener("beforeunload", alertUser)
    }
  }, [])

  useEffect(() => {
    socketOnEndOfGame()
    return () => socket.off('endOfGame')
  }, [role])

  //--------------------------------------------------- HANDLE REFRESH PAGE
  const alertUser = (e) => {
    e.preventDefault();
    // e.returnValue = "";
  }

  //---------------------------------------------------- HANDLE CONNECTIONS
  // handle connections
  const handleConnections = () => {
    if (action === 'join') {
      setOpen(true)
      socket.emit('joinRoom', gameRoomId)
      setTimeout(() => socket.emit('getPlayerTwo', gameRoomId), 300)
      setGameStatus('Game starting in... ')
      setRole('player')
    }
    else if (action === 'spectate') {
      socket.emit('addSpectator', gameRoomId)
      socket.emit('getPlayerTwo', gameRoomId)
      setRole('spectator')
    }
    else if (action === 'rejoin') {
      setRole('player')
      // socket.emit('getPlayerTwo', gameRoomId)
    }
    else if (action === 'create a game' || action === 'create') {
      setOpen(true)
      setRole('player')
    }
  }

  const socketOnInvitationRefused = () => {
    socket.on('invitationRefused', (usernameRefusing: string) => {
      setInvitationRefused(true)
      setGameOver(true)
      setSnackbarMessage(usernameRefusing + ' has refused your invitation to play a game')
      setGameStatus("No opponent found...")
    })
  }

  //----------------------------------------------------------- ROOM IS FULL
  // wait for room to be full
  const socketOnRoomIsFull = () => {
    if (action === 'rejoin') { 
      setOpen(false)
    }
	  socket.on('roomIsFull', () => {
      socket.emit('getPlayerTwo', gameRoomId)
      setQuitGame(false);
	    setGameStatus('Game starting in... ')
      socket.emit('startCountdown', gameRoomId)
	  })
  }

  const socketOnGameStarts = () => {
    socket.on('gameStarts', () => {
      setQuitGame(false)
    })
  }

  //------------------------------------------------------ OPPONENT HAS LEFT
  // handle opponent left
  const socketOnWaitingForOpponent = () => {
    socket.on('waitingForOpponent', (ret: any) => {
      setOpen(true)
      setOpponentIsOffline(true)
      setGameStatus('Waiting for ' + ret.username + ' to reconnect to the game... ')
      setCounter(ret.counter)
    })
  }

  const socketOnRejoin = () => {
    socket.on('rejoin', () => {
      setOpen(true)
      setOpponentIsOffline(false)
	    setGameStatus('Game starting in... ')
      socket.emit('startCountdown', gameRoomId)
    })
  }

  //-------------------------------------------------------------- COUNTDOWN
  // updateCounter
  const socketOnUpdateCounter = () => {
    socket.on('updateCounter', (counter: number) => {setCounter(counter)})
  }

  // close dialog when counter === 0
  useEffect(() => {
    if (counter === 0)
      setOpen(false)
  }, [counter])

  //------------------------------------------------ DISPLAYS WHO WON + STATS
  const socketOnEndOfGame = () => {
    socket.on('endOfGame', (winner: any) => {
      socket.off('waitingForOpponent')
      setGameOver(true)
      if (role === 'player') {
        socket.emit('gameOver', gameRoomId)
      }
      if (!winner) {
        setGameStatus("Game exited")
      }
      else {
        if (role === 'spectator') {
          if (numberOfPlayers === 1)
            setGameStatus(winner.username + " won against himself.")
          else 
            setGameStatus(winner.username + " won the game !")
        }
        else {
          if (numberOfPlayers === 1)
            setGameStatus('Congratulations, you played yourself.')
          else {
            if (user.username === winner.username)
              setGameStatus('Congratulations! You won!')
            else
              setGameStatus('Oh no! You lost!')
          }
        }
      }
      setOpen(true)
    })
  }

  const socketOnUserStats = () => {
    socket.on("userStats", (response) => {
      setStats(prevState => ({
        ...prevState,
        rank:   response.rank,
        xp:     response.xp,
        level:  Math.floor(response.xp / 1000),
        nbOfPlayers: response.nbOfPlayers
      }))
    })
  }

  const socketOnUserMatches = () => {
    socket.on("userMatches", (response) => {
      setMatches(response);
    })
  }

  useEffect(() => {
    if (matches) {
      const nbVictories = matches.filter(match => match.winner.id == user.id ).length;
      setStats(prevState => ({
        ...prevState,
        victories:  nbVictories ? nbVictories : 0,                
        defeat :    matches.length ? matches.length - nbVictories : 0
      }))
    }
  }, [matches]);

  //--------------------------------------------------------------- PLAY AGAIN
  const handleClickBackToPong = () => {
    onClose() // reset all props to initial state
    navigate('/pong/')
  }

  //-------------------------------------------------------------- QUIT GAME ?
  const handleClickQuitGame = (value: boolean) => {
    setQuitGame(value)
  }

  const exitGame = () => {
    if (role === 'player')
      socket.emit('exitGameRoom', gameRoomId)
    else if (role === 'spectator') {
      onClose() // reset all props to initial state
      navigate('/pong/')
      // setGameStatus('Game exited')
      // setGameOver(true)
    }
    setQuitGame(false) // to update scores
  }

  return (
	<>
	  <Dialog open={open} >
        <DialogTitle>
          { quitGame === false &&
            <div>
              <Typography sx={{p: 1, marginBottom: 2, fontWeight: 'bold', textAlign: 'center'}} color='secondary' variant='h4'>
                {gameStatus}
              </Typography>
              { gameStatus === 'Game starting in... ' &&
              <Typography sx={{p: 1, fontWeight: 'bold', textAlign: 'center'}} variant='h1'>
                {counter}
              </Typography>
              }
              { opponentIsOffline === true && gameOver === false &&
              <Typography sx={{p: 1, fontWeight: 'bold', textAlign: 'center'}} variant='h1'>
                {counter}
              </Typography>
              }
              { stats && action !== 'spectate' &&
                <StatsTable stats={stats} displayTitle={false}/>
              }
            </div>
          }
          { quitGame === true &&
            <div>
              <Typography sx={{p: 1, marginBottom: 2, fontWeight: 'bold', textAlign: 'center'}} color='secondary' variant='h4'>
                Exit game ?
              </Typography>
              <Box display='flex' justifyContent='center'>
                <Button onClick={exitGame} size='large'>
                  Yes
                </Button>
                <Button onClick={() => handleClickQuitGame(false)} size='large'>
                  No
                </Button>
              </Box>
            </div>
          }
        </DialogTitle>
      { gameOver === true &&
        <Button onClick={handleClickBackToPong}>
          BACK TO PONG
        </Button>
      }
      { quitGame === false && gameOver === false &&
        <Button onClick={() => handleClickQuitGame(true)}>
          QUIT GAME
        </Button>
      }
      </Dialog>
      { invitationRefused && (
        <SnackBarComponent
          severity="error"
          closeSnack={() => setInvitationRefused(false)}
          snackbarMessage={snackbarMessage}
        />
      )}
	</>
  )
}