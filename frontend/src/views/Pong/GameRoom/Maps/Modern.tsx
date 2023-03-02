import PropTypes from 'prop-types';
import { Stage, Layer, Rect, Line, Circle, Text } from 'react-konva';

//--------------------------------------------- INITIAL MAP ATTRIBUTES
const SCENE_BASE_WIDTH: number = 800
const SCENE_BASE_HEIGHT: number = 550
const PLAYER_HALF_SIZE: number = SCENE_BASE_HEIGHT * 0.05

//---------------------------------------------------------- PROPTYPES
Modern.propTypes = {
  refs: PropTypes.any.isRequired
}

//---------------------------------------------------------- MODERN MAP
export default function Modern(props) {
  const { refs } = props

  return (
    <>
      <Stage
		ref={refs.mainStageRef}
        width={SCENE_BASE_WIDTH}
        height={SCENE_BASE_HEIGHT}
      >
		{/* map */}
        <Layer>
	  	  <Rect
			ref={refs.rectRef}
			width={SCENE_BASE_WIDTH}
			height={SCENE_BASE_HEIGHT}
			fill="white"
			shadowBlur={10}
            stroke="#5569ff"
            strokeWidth={SCENE_BASE_WIDTH * 0.01}
			/>
	  	  <Line
			ref={refs.dashedLineRef}
	  		x={SCENE_BASE_WIDTH * 0.5}
	  		y={0}
	  		points={[0, 0, 0, SCENE_BASE_HEIGHT]}
	  		tension={0.5}
	  		stroke="#5569ff"
	  		strokeWidth={SCENE_BASE_WIDTH * 0.002}
	  		lineJoin='round'
	  	  />
        </Layer>
		<Layer>
		  <Text // PLAYER ONE SCORE
		    text={'0'}
			fill='black'
			fontSize={SCENE_BASE_HEIGHT * 0.1}
		  	x={SCENE_BASE_WIDTH * 2/7}
			y={SCENE_BASE_HEIGHT * 0.02}
			ref={refs.playerOneScoreRef}
		  />
		  <Text // PLAYER TWO SCORE
		    text={'0'}
			fill='black'
			fontSize={SCENE_BASE_HEIGHT * 0.1}
			x={SCENE_BASE_WIDTH * 2/3}
			y={SCENE_BASE_HEIGHT * 0.02}
			ref={refs.playerTwoScoreRef}
		  />
		</Layer>
		{/* players */}
		<Layer>
		{/* playerOne's paddle*/}
		<Line 
        	ref={refs.playerOneRef}
            x={SCENE_BASE_WIDTH * 0.1}
            y={SCENE_BASE_HEIGHT * 0.5}
            points={[0, -PLAYER_HALF_SIZE, 0, PLAYER_HALF_SIZE]}
            tension={0.5}
            stroke="#5569ff"
            strokeWidth={SCENE_BASE_WIDTH * 0.01}
            lineJoin='round'
			/>
		{/* playerTwo's paddle */}
          <Line
        	ref={refs.playerTwoRef}
            x={SCENE_BASE_WIDTH * 0.9}
            y={SCENE_BASE_HEIGHT * 0.5}
            points={[0, -PLAYER_HALF_SIZE, 0, PLAYER_HALF_SIZE]}
            tension={0.5}
            stroke="#5569ff"
            strokeWidth={SCENE_BASE_WIDTH * 0.01}
            lineJoin='round'
          />
		  {/* ball */}
		  <Circle 
		  	ref={refs.ballRef}
			x={SCENE_BASE_WIDTH * 0.5}
			y={SCENE_BASE_HEIGHT * 0.5}
			radius={SCENE_BASE_HEIGHT / 120}
			fill="black"
		  />
		</Layer>
      </Stage>
	</>
  )    
}