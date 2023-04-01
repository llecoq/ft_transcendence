import { useEffect, useState } from 'react';
import { Typography, Button, Box, Card } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import DisplayGameRoomInfos from '../WatchGame/DisplayGameRoomInfos';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

JoinGame.propTypes = {
  socket: PropTypes.any.isRequired,
  onClose: PropTypes.func.isRequired,
  action: PropTypes.string.isRequired
};

export default function JoinGame(props) {
  const {socket, onClose, action} = props
  const [waitingList, setWaitingList] = useState(new Array())
  const [listIsEmpty, setListIsEmpty] = useState(true)

  useEffect(() => {
    socket.on('updateWaitingList', (waitingListRet: any) => {
      setWaitingList(waitingListRet)
      if (waitingListRet.length > 0)  
        setListIsEmpty(false)
    })
    socket.emit('getWaitingList')
    return () => socket.off('updateWaitingList')
  }, [])

  useEffect(() => {
    if (waitingList.length > 0 && action === 'auto matchmaking') {
      joinRoom(waitingList[0].map, waitingList[0].gameRoomId)
    }
    else if (action === 'auto matchmaking'){
      socket.emit('queueMatchmaking')
    }
  }, [waitingList])

  const joinRoom = (mapName: string, gameRoomId: string) => {
    onClose(mapName, gameRoomId, 2, 'join')
  }

  const startNewGame = () => {
    onClose(null, null, 0, 'create a game')
  }

  const backToPong = () => {
    onClose(null, null, 0, 'select an action')
  }

  return (
    <div>
      { listIsEmpty === true &&
        <Box justifyContent='center' display='flex' flexDirection='column' alignItems='center'>
          <Box
            justifyContent='center'
            display='flex'
          >
            <Box
              maxWidth='sm'
              component="img"
              src="/static/images/gif/PongModernGif.gif"
            />
          </Box>
          <Card sx={{mt: 2, width: 400}}>
            <Box   
              alignItems="center"
              display='flex'
              flexDirection='column'
              maxWidth='100%'
              justifyContent='space-evenly'
            >
              <Typography sx={{p: 2, textAlign: 'center'}} variant='h4'>
                No game playing right now...
              </Typography>
              { action === 'auto matchmaking' &&
                <>
                  <Typography sx={{textAlign: 'center', p: 2 }} color='secondary' variant='h5'>
                    You've been added to the queue and will receive an invitation when a match is ready !
                  </Typography>
                  <Button onClick={backToPong} size='large' startIcon={<SportsTennisIcon />}>
                    Back to Pong
                  </Button>
                </>
              }
              { action !== 'auto matchmaking' &&
                <Box display='flex' flexDirection='row'>
                  <Button 
                    onClick={startNewGame} 
                    size='large'  
                    startIcon={<AddIcon />}
                  >
                    Start a new Game
                  </Button>
                  <Button onClick={backToPong} size='large' startIcon={<SportsTennisIcon />}>
                    Back to Pong
                  </Button>
                </Box>
              }
            </Box>
          </Card>
        </Box>
      }
      { listIsEmpty === false && action === 'matches list' &&
        <Box sx={{ width: 500}}>
        { waitingList.map(gameRoom =>
            <Card key={gameRoom.gameRoomId} sx={{marginTop: 2}}>
              <DisplayGameRoomInfos
                gameRoomInfos={gameRoom}
                display='joinGame'
              />
              <Box sx={{width: '100%'}} display='flex' justifyContent='center' mt={1}>
                <Button 
                  sx={{width: '100%'}}
                  variant='outlined'
                  onClick={() => joinRoom(gameRoom.map, gameRoom.gameRoomId)}
                >
                  JOIN GAME
                </Button>
              </Box>
            </Card>
          )
        }
        </Box>
      }
    </div>
  )
}
