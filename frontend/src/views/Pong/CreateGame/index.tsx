import {
  Dialog, DialogTitle, Button
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import CarouselMaps from './CarouselMaps';

CreateGame.propTypes = {
    onClose: PropTypes.func.isRequired,
    resetProps: PropTypes.func.isRequired,
    handleError: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    socket: PropTypes.any.isRequired,
    inviteFriendId: PropTypes.number
};

export default function CreateGame(props) {
  const {onClose, open, socket, inviteFriendId, resetProps, handleError} = props
  const [map, setMap] = useState('modern')
  const [numberOfPlayers, setNumberOfPlayers] = useState(2)

  useEffect(() => {
    return () => socket.off('gameRoomId')
  }, [])

  const createGameRoom = () => {
    socket.emit('createGameRoom', {map: map, numberOfPlayers: numberOfPlayers, inviteFriendId: inviteFriendId}, (response) => {
      if (response.status !== 200)
        handleError(response.message)
    })
    socket.on('gameRoomId', (id: string) => {
      if (numberOfPlayers === 1)
        socket.emit('joinRoom', id)
      onClose(map, id, numberOfPlayers, 'create')
    })
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={resetProps}
      >
        <CarouselMaps
          createGameRoom={createGameRoom}
          setMap={setMap}
          setNumberOfPlayers={setNumberOfPlayers}
          inviteFriendId={inviteFriendId}
        />
      </Dialog>
    </div>
  )
}

