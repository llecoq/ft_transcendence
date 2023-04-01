import { List, Typography, Button, Box, Card, styled } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DisplayGameRoomInfos from './DisplayGameRoomInfos';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

WatchGame.propTypes = {
  socket: PropTypes.any.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function WatchGame(props) {
  const {socket, onClose} = props
  const [playingList, setPlayingList] = useState(new Array())
  const [listIsEmpty, setListIsEmpty] = useState(true)

  useEffect(() => {
    socket.on('updatePlayingList', (playingListRet: any) => {
      if (playingListRet.length > 0)  
        setListIsEmpty(false)
      setPlayingList(playingListRet)
    })
    socket.emit('getPlayingList')
    
    return () => socket.off('updatePlayingList')
  }, [])

  const joinRoomAsSpectator = (mapName: string, gameRoomId: string) => {
    onClose(mapName, gameRoomId, 2, 'spectate')
  }

  const startNewGame = () => {
    onClose('', '', 0, 'create a game')
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
              <Box display='flex' flexDirection='row'>
                <Button 
                  onClick={startNewGame} 
                  size='large'  
                  startIcon={<SportsEsportsIcon />}
                >
                  Start playing
                </Button>
                <Button onClick={() => onClose(null, null, 0, 'select an action')} size='large' startIcon={<SportsTennisIcon/>}>
                  Back to Pong
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      }
      { listIsEmpty === false &&
        <Box sx={{ width: 500}}>
          { playingList.map(gameRoom =>
              <Card key={gameRoom.gameRoomId} sx={{marginTop: 2}}>
                <DisplayGameRoomInfos
                  gameRoomInfos={gameRoom}
                />
                <Box sx={{width: '100%'}} display='flex' justifyContent='center' mt={1}>
                  <Button 
                    sx={{width: '100%'}}
                    variant='outlined'
                    onClick={() => joinRoomAsSpectator(gameRoom.map, gameRoom.gameRoomId)}
                    >
                    WATCH GAME
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
