import { e_interval } from "./GameRoom"

export enum e_maps {
  // RETRO MAP
  RETRO_BASE_HEIGHT = 700,
  RETRO_BASE_WIDTH = 800,
	RETRO_PADDLE_STROKE_WIDTH = RETRO_BASE_WIDTH * 0.01,
	RETRO_PADDLE_VELOCITY = 2.2 * e_interval.REFRESH_RATE * 0.2,
  RETRO_PADDLE_HALF_SIZE = RETRO_BASE_HEIGHT * 0.03,
	RETRO_BALL_RADIUS = RETRO_BASE_HEIGHT / 120,
  RETRO_MAX_SCORE = 3,

  // MODERN MAP
  MODERN_BASE_HEIGHT = 550,
  MODERN_BASE_WIDTH = 800,
	MODERN_PADDLE_STROKE_WIDTH = MODERN_BASE_WIDTH * 0.01,
	MODERN_PADDLE_VELOCITY = 1.2 * e_interval.REFRESH_RATE * 0.2,
  MODERN_PADDLE_HALF_SIZE = MODERN_BASE_HEIGHT * 0.05,
	MODERN_BALL_RADIUS = MODERN_BASE_HEIGHT / 120,
  MODERN_MAX_SCORE = 3,
}

export default class GameMap {
  private name: string
  private height: number
  private width: number
  private playerOnePositionX: number
  private playerTwoPositionX: number
  private playersPositionY: number
  private paddleOneContactZoneX: number
  private paddleTwoContactZoneX: number
  private paddleStrokeHalfWidth: number
  private paddleHalfSize: number
  private paddleVelocity: number
  private ballRadius: number
  private maxScore: number

  constructor(name: string) {
    this.name = name

    if (name === 'retro') {
      this.height = e_maps.RETRO_BASE_HEIGHT
      this.width = e_maps.RETRO_BASE_WIDTH
	    this.playerOnePositionX = e_maps.RETRO_BASE_WIDTH * 0.1
	    this.playerTwoPositionX = e_maps.RETRO_BASE_WIDTH * 0.9
	    this.paddleStrokeHalfWidth = e_maps.RETRO_PADDLE_STROKE_WIDTH * 0.5
	    this.paddleOneContactZoneX = this.playerOnePositionX 
	    this.paddleTwoContactZoneX = this.playerTwoPositionX - this.paddleStrokeHalfWidth
	    this.playersPositionY = e_maps.RETRO_BASE_HEIGHT * 0.5
	    this.paddleHalfSize = e_maps.RETRO_PADDLE_HALF_SIZE
	    this.paddleVelocity = e_maps.RETRO_PADDLE_VELOCITY
	    this.ballRadius = e_maps.RETRO_BALL_RADIUS
      this.maxScore = e_maps.RETRO_MAX_SCORE
    }
    else if (name === 'modern') {
      this.height = e_maps.MODERN_BASE_HEIGHT
      this.width = e_maps.MODERN_BASE_WIDTH
	    this.playerOnePositionX = e_maps.MODERN_BASE_WIDTH * 0.1
	    this.playerTwoPositionX = e_maps.MODERN_BASE_WIDTH * 0.9
	    this.paddleStrokeHalfWidth = e_maps.MODERN_PADDLE_STROKE_WIDTH * 0.5
	    this.paddleOneContactZoneX = this.playerOnePositionX 
	    this.paddleTwoContactZoneX = this.playerTwoPositionX - this.paddleStrokeHalfWidth
	    this.playersPositionY = e_maps.MODERN_BASE_HEIGHT * 0.5
	    this.paddleHalfSize = e_maps.MODERN_PADDLE_HALF_SIZE
	    this.paddleVelocity = e_maps.MODERN_PADDLE_VELOCITY
	    this.ballRadius = e_maps.MODERN_BALL_RADIUS
      this.maxScore = e_maps.MODERN_MAX_SCORE
    }
  }

  //--------------------------------------------------------- ACCESSORS
  getName(): string {return this.name}
  getPlayerOnePositionX(): number {return this.playerOnePositionX}
  getPlayerTwoPositionX(): number {return this.playerTwoPositionX}
  getPaddleOneContactZoneX(): number {return this.paddleOneContactZoneX}
  getPaddleTwoContactZoneX(): number {return this.paddleTwoContactZoneX}
  getPlayerPositionX(playerNumber: number) {return playerNumber === 0 ? this.playerOnePositionX : this.playerTwoPositionX}
  getPlayersPositionY(): number {return this.playersPositionY}
  getPaddleHalfSize(): number {return this.paddleHalfSize}
  getBottomWallPosition(): number {return this.height}
  getPaddleVelocity(): number {return this.paddleVelocity}
  getWidth(): number {return this.width}
  getBallRadius(): number {return this.ballRadius}
  getPaddleHalfWidth(): number {return this.paddleStrokeHalfWidth}
  getMaxScore(): number {return this.maxScore}
}