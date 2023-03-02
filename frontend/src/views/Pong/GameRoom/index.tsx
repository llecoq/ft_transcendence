import { useEffect, useRef, useState } from 'react';
import Retro from './Maps/Retro';
import Modern from './Maps/Modern';
import PropTypes from 'prop-types';
import GameStatusHandler from './GameStatusHandler';
import GameUpdateHandler, { IRefs } from './GameUpdateHandler';
import TopBarPlayers from './TopBarPlayers';
import { Card, Box } from '@mui/material';

GameRoom.propTypes = {
  mapName: PropTypes.string.isRequired,
  gameRoomId: PropTypes.string.isRequired,
  numberOfPlayers: PropTypes.number.isRequired,
  socket: PropTypes.any.isRequired,
  action: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
}

function GameRoom(props) {
  const { mapName, gameRoomId, socket, action, numberOfPlayers, onClose } = props
  const [players, setPlayers] = useState({})
  const refCardWidth = useRef(null)
  const refs: IRefs = {
    mainStageRef: useRef(null),
    rectRef: useRef(null),
    dashedLineRef: useRef(null),
    playerOneRef: useRef(null),
    playerTwoRef: useRef(null),
    ballRef: useRef(null),
    playerOneScoreRef: useRef(null),
    playerTwoScoreRef: useRef(null)
  }

  //--------------------------------------------------------------- INIT
  useEffect(() => {
    socket.on('playerOne', (player) => {
      setPlayers(prevState => ({
        ...prevState,
        one: player
      }))
    })
    socket.on('playerTwo', (player) => {
      setPlayers(prevState => ({
        ...prevState,
        two: player
      }))
    })
    socket.emit('getPlayerOne', gameRoomId)
    socket.emit('getPlayerTwo', gameRoomId)
    return () => {
      socket.off('playerOne')
      socket.off('playerTwo')
    }
  }, [])

  return (
    <>
      <GameStatusHandler
        socket={socket}
        action={action}
        numberOfPlayers={numberOfPlayers}
        gameRoomId={gameRoomId}
        onClose={onClose}
      />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {
          refCardWidth.current &&
          <TopBarPlayers
            refCardWidth={refCardWidth}
            players={players}
          />
        }
        <Box
          display="flex"
          justifyContent="center"
        >
          <Card ref={refCardWidth}>
            {mapName === 'retro' &&
              <Retro refs={refs} />
            }
            {mapName === 'modern' &&
              <Modern refs={refs} />
            }
          </Card>
        </Box>
      </Box>
      <GameUpdateHandler
        refs={refs}
        socket={socket}
        gameRoomId={gameRoomId}
      />
    </>
  )
}

export default GameRoom