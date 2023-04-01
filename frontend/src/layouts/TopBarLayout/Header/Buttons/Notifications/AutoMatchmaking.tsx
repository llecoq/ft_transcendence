import { Dialog, Box, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckTwoToneIcon from "@mui/icons-material/CheckTwoTone";
import { useNavigate } from "react-router";
import useAuth from "src/hooks/useAuth";

export default function AutoMatchmaking() {
  const [matchReady, setMatchReady] = useState<boolean>(false)
  const [gameRoomId, setGameRoomId] = useState(null)
  const navigate = useNavigate()
  const {socket} = useAuth()
  const [counter, setCounter] = useState(10)
  
  useEffect(() => {
    socketOnMatchReady()
    socketOnUpdateMatchmakingCounter()
    return () => {
      socket.off('updateMatchmakingCounter')
      socket.off('matchReady')
    }
  }, [])

  const joinMatch = async () => {
    setMatchReady(false)
    navigate('/pong/accept/' + gameRoomId)
  }

  const socketOnMatchReady = () => {
    socket.on('matchReady', (gameRoomId: string) => {
      setMatchReady(true)
      setGameRoomId(gameRoomId)
    })
  }

  //-------------------------------------------------------------- COUNTDOWN
  // updateCounter
  const socketOnUpdateMatchmakingCounter = () => {
    socket.on('updateMatchmakingCounter', (counter: number) => {setCounter(counter)})
  }

  // close dialog when counter === 0
  useEffect(() => {
    if (counter === 0)
      setMatchReady(false)
  }, [counter])

  return (
    <>
      <Dialog open={matchReady} onClose={() => setMatchReady(false)}>
        <Box>
          <Typography sx={{p: 3, fontWeight: 'bold', textAlign: 'center'}} color='secondary' variant='h3'>
            New match ready !
          </Typography>
          <Typography sx={{p: 1, fontWeight: 'bold', textAlign: 'center'}} variant='h1'>
            {counter}
          </Typography>
          <Box display='flex' flexDirection='row' justifyContent='center' p={2}>
            <Button size='large' startIcon={<CheckTwoToneIcon />} onClick={joinMatch}>
              Join Game
            </Button>
            <Button size='large' startIcon={<CancelIcon />} onClick={() => setMatchReady(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  )
}
