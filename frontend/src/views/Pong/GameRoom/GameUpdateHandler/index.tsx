import Konva from 'konva';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import useAuth from 'src/hooks/useAuth';

const REFRESH_RATE: number = 8

export interface IRefs {
  mainStageRef: React.MutableRefObject<any>
  rectRef: React.MutableRefObject<any>
  dashedLineRef: React.MutableRefObject<any>
  playerOneRef: React.MutableRefObject<any>
  playerTwoRef: React.MutableRefObject<any>
  ballRef: React.MutableRefObject<any>
  playerOneScoreRef: React.MutableRefObject<any>
  playerTwoScoreRef: React.MutableRefObject<any>
}

GameUpdateHandler.propTypes = {
  refs: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  gameRoomId: PropTypes.string.isRequired
}

export default function GameUpdateHandler(props) {
  const { refs, socket, gameRoomId } = props
  const { user } = useAuth()
  const [ballVelocityX, setBallVelocityX] = useState(-1)
  const [ballVelocityY, setBallVelocityY] = useState(0)
  const [animation, setAnimation] = useState(false)
  const [playerOnePaddle, setPlayerOnePaddle] = useState({
    up: false,
    down: false,
    velocity: 2
  })
  const [playerTwoPaddle, setPlayerTwoPaddle] = useState({
    up: false,
    down: false,
    velocity: 2
  })
  const [mapSize, setMapSize] = useState({
    width: 0,
    height: 0
  })

  //------------------------------------------------------------------ INIT
  // subscribe / unsubscribe to room updates
  useEffect(() => {
    setMapSize({
      width: refs.mainStageRef.current.width(),
      height: refs.mainStageRef.current.height()
    })
    updateScores()
    updateBallDirection()
  	updateBallPosition()
    socketOnPaddleOne()
    socketOnPaddleTwo()
    socketOnPlayersPosition()
    socket.on('gameStarts', () => setAnimation(true))
    socket.on('gameStops', () => setAnimation(false))
    socket.emit('gameStatus', gameRoomId)
    socket.emit('getBallDirection', gameRoomId)
    window.addEventListener('focus', handleFocus)

	return () => {
	  socket.off('updateScores')
	  socket.off('playerOnePosition')
	  socket.off('playerTwoPosition')
	  socket.off('ballPosition')
    socket.off('ballDirection')
    socket.off('gameStarts')
    socket.off('gameStops')
    socket.off('paddleOne')
    socket.off('paddleTwo')
    window.removeEventListener('focus', handleFocus)
	}
  }, [])

  //-------------------------------------------------------------- RESPONSIVE
  // run resizeStage with the good mapSize states at opening of the page
  useEffect(() => {resizeStage()}, [mapSize])

  // add event listener for resize that is accessing the real states of mapSize
  useEffect(() => {
    window.addEventListener('resize', resizeStage);

    return () => {window.removeEventListener('resize', resizeStage)}
  }, ['resize', mapSize])
  
  // set scaling factor and resize stage
  const resizeStage = () => {
    if (mapSize.width > 0) {
      const mainStage: Konva.Node = refs.mainStageRef.current
      
      var tempScale = Math.min(window.innerWidth / mapSize.width, window.innerHeight / mapSize.height) * 0.7
      tempScale = tempScale > 1 ? 1 : tempScale
      tempScale = tempScale < 0.3 ? 0.3 : tempScale
      
      mainStage.width(mapSize.width * tempScale);
      mainStage.height(mapSize.height * tempScale);
      mainStage.scale({ x: tempScale, y: tempScale });
    }
  }
  
  const handleFocus = () => {
    socket.emit('getGameRoomStatus', gameRoomId, (response) => {
      if (response.isRunning === true)
        setAnimation(true)
    })
  }

  //------------------------------------------------------ PLAYER MOVEMENTS
  // handle keyup and keydown event of player
  const handleKeydown = (event) => {
  	event.preventDefault()
  	socket.emit('keydown', {userId: user.id, gameRoomId: gameRoomId, keyCode: event.keyCode})
  }

  const handleKeyup = (event) => {
	event.preventDefault()
  	socket.emit('keyup', {userId: user.id, gameRoomId: gameRoomId, keyCode: event.keyCode})
  }

  useEffect(() => {
  	window.addEventListener("keyup", handleKeyup);
  	return () => window.removeEventListener("keyup", handleKeyup);
  }, ['keyup']);
	
  useEffect(() => {
  	window.addEventListener("keydown", handleKeydown);
  	return () => window.removeEventListener("keydown", handleKeydown);
  }, ['keydown']);

  const socketOnPaddleOne = () => {
    socket.on('paddleOne', (response: {up: boolean, down: boolean}) => {
      setPlayerOnePaddle(prevState => ({
        ...prevState,
        up: response.up,
        down: response.down,
      }))
    })
  }

  const socketOnPaddleTwo = () => {
    socket.on('paddleTwo', (response: {up: boolean, down: boolean}) => {
      setPlayerTwoPaddle(prevState => ({
        ...prevState,
        up: response.up,
        down: response.down,
      }))
    })
  }

  //-------------------------------------------------------------- UPDATE SCORES
  const updateScores = () => {
  	const playerOneScore: Konva.Node = refs.playerOneScoreRef.current
  	const playerTwoScore: Konva.Node = refs.playerTwoScoreRef.current

  	socket.on('updateScores', (scores: number[]) => {
  	  playerOneScore.setAttr('text', scores[0].toString())
  	  playerTwoScore.setAttr('text', scores[1].toString())
  	})
  }

  //-------------------------------------------------------------- MOVING PLAYER
  const socketOnPlayersPosition = () => {
    const playerOne: Konva.Node = refs.playerOneRef.current
  	const playerTwo: Konva.Node = refs.playerTwoRef.current

    socket.on('playerOnePosition', (response: {position: number[], velocity: number}) => {
  	  playerOne.x(response.position[0])
  	  playerOne.y(response.position[1])
      setPlayerOnePaddle(prevState => ({
        ...prevState,
        velocity: response.velocity
      }))
    })
  	socket.on('playerTwoPosition', (response: {position: number[], velocity: number}) => {
      playerTwo.x(response.position[0])
      playerTwo.y(response.position[1])
      setPlayerTwoPaddle(prevState => ({
        ...prevState,
        velocity: response.velocity
      }))
  	})
  }

  const updatePlayersPosition = (deltaTime: number) => {
  	const playerOne: Konva.Node = refs.playerOneRef.current
  	const playerTwo: Konva.Node = refs.playerTwoRef.current
    const velocity: number = playerOnePaddle.velocity * deltaTime / REFRESH_RATE

    if (playerOnePaddle.up === true)
      playerOne.y((playerOne.y() - velocity))
    if (playerOnePaddle.down === true)
      playerOne.y((playerOne.y() + velocity))
    if (playerTwoPaddle.up === true)
      playerTwo.y((playerTwo.y() - velocity))
    if (playerTwoPaddle.down === true)
      playerTwo.y((playerTwo.y() + velocity))            
  }

  //------------------------------------------------------- UPDATE BALL POSITION
  const updateBallPosition = () => {
    const ball: Konva.Node = refs.ballRef.current

	  socket.on('ballPosition', (ballPosition: number[]) => {
	    ball.x(ballPosition[0])
	    ball.y(ballPosition[1])
	  })
  }

  const updateBallDirection = () => {
    socket.on('ballDirection', (ballDirection) => {
      setBallVelocityX(ballDirection.velocityX)
      setBallVelocityY(ballDirection.velocityY)
    })
  }

  //---------------------------------------- REQUEST ANIMATION FRAME LOOP
  // Use useRef for mutable variables that we want to persist
	// without triggering a re-render on their change
	const requestRef: any = useRef()
	const previousTimeRef: any = useRef()
	
  const ball: Konva.Node = refs.ballRef.current
	const animate = (time: number) => {
		if (previousTimeRef.current != undefined) {
      const deltaTime: number = time - previousTimeRef.current
      const newBallVelocityX: number = ballVelocityX * deltaTime
      const newBallVelocityY: number = ballVelocityY * deltaTime
      const newPositionX: number = (ball.x() + newBallVelocityX)
      const newPositionY: number = (ball.y() + newBallVelocityY)

      ball.x(newPositionX)
      ball.y(newPositionY)
      updatePlayersPosition(deltaTime)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
	}
	
	useEffect(() => {
		if (animation === true)
			requestRef.current = requestAnimationFrame(animate)

      return () => cancelAnimationFrame(requestRef.current)
  }, [animation, ballVelocityX, ballVelocityY, playerOnePaddle, playerTwoPaddle]) // follow changes of states

  return (
    <>
    </>
  )
}