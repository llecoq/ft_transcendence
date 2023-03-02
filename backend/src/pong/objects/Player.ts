import GameMap from "./GameMap"
import { e_interval } from "./GameRoom"

enum e_keyCode {
  ARROW_UP = 38,
  ARROW_DOWN = 40,
  KEY_Q = 81,
  KEY_W = 87
}

export interface IUser {
  id: number
  username: string
  avatar: string
  xp: number
}

export default class Player {
  //---------------------------------------------------------------- PROPERTIES
  private user: IUser
  private active: boolean
  private positionX: number
  private positionY: number
  private paddleHalfSize: number
  private score: number
  private arrowDown: boolean
  private arrowUp: boolean
  private stoppedMoving: boolean
  private startedMoving: boolean
  private paddleVelocity: number
  private map: GameMap
  private collisionWithWall: boolean

  //--------------------------------------------------------------- CONSTRUCTOR
  constructor(user: any, playerNumber: number, map: GameMap) {
	  this.user = {
	  	id: user.id,
	  	username: user.username,
	  	avatar: user.avatar,
	  	xp: user.xp
	  }
	  this.active = true
    this.score = 0
	  this.arrowDown = false
	  this.arrowUp = false
	  this.stoppedMoving = false
	  this.startedMoving = false
	  this.paddleVelocity = map.getPaddleVelocity()
	  this.map = map
	  this.positionY = map.getPlayersPositionY()
	  this.positionX = map.getPlayerPositionX(playerNumber)
	  this.paddleHalfSize = map.getPaddleHalfSize()
	  this.positionY = map.getPlayersPositionY()
    this.collisionWithWall = false
  }

  //----------------------------------------------------------------- ACCESSORS
  incrementScore() {this.score++}
  setArrowDown(value: boolean) {this.arrowDown = value}
  setArrowUp(value: boolean) {this.arrowUp = value}
  setIsActive(value: boolean) {this.active = value}
  setScore(value: number) {this.score = value}
  getId(): number {return this.user.id}
  getUser(): IUser {return this.user}
  getScore(): number {return this.score}
  getUsername(): string {return this.user.username}
  getPosition(): number[] {return [this.positionX, this.positionY]}
  getPaddleHalfSize(): number {return this.paddleHalfSize}
  getPaddlePositionY(): number {return this.positionY}
  getPaddlePositionX(): number {return this.positionX}
  getPaddleHalfWidth(): number {return this.map.getPaddleHalfWidth()}
  getPaddleVelocity(): number {return this.paddleVelocity}
  getCollisionWithWall(): boolean {return this.collisionWithWall}
  isActive(): boolean {return this.active}
  positionHasChanged(): boolean {return this.stoppedMoving}
  getKeys(): {up: boolean, down: boolean} {return {up: this.arrowUp, down: this.arrowDown}}
  
  getStoppedMoving(): boolean {
    const ret: boolean = this.stoppedMoving
    if (this.stoppedMoving === true)
      this.stoppedMoving = false
    return ret
  }
 
  getStartedMoving(): boolean {
    const ret: boolean = this.startedMoving
    if (this.startedMoving === true)
      this.startedMoving = false
    return ret
  }

  //------------------------------------------------------------------- METHODS

  handleKeydown(keyCode: number) {
    switch (keyCode) {
      case e_keyCode.ARROW_UP:
        if (this.arrowUp === false) {
          this.setArrowUp(true)
          this.startedMoving = true
        }
        break;
      case e_keyCode.ARROW_DOWN:
        if (this.arrowDown === false) {
          this.setArrowDown(true)
          this.startedMoving = true
        }
        break;
    }
  }
  
  handleKeyup(keyCode: number) {
    switch (keyCode) {
      case e_keyCode.ARROW_UP:
        if (this.arrowUp === true) {
          this.setArrowUp(false)
          this.stoppedMoving = true
        }
        break;
      case e_keyCode.ARROW_DOWN:
        if (this.arrowDown === true) {
          this.setArrowDown(false)
          this.stoppedMoving = true
        }
        break;
    }
  }

  updatePosition(deltaTime: number) {
	  if (this.arrowUp === false && this.arrowDown === false) {
	  	return
	  }
	  
	  const offset: number = this.paddleVelocity * deltaTime / e_interval.REFRESH_RATE
	  
	  if (this.arrowUp === true) {
	  	if (this.positionY - this.paddleHalfSize - offset <= 0) {
        this.collisionWithWall = true
        this.positionY = this.paddleHalfSize
      }
	  	else {
        this.collisionWithWall = false
        this.positionY -= offset
      }
	  }
	  if (this.arrowDown === true) {
	  	if (this.positionY + this.paddleHalfSize + offset >= this.map.getBottomWallPosition()) {
        this.collisionWithWall = true
	  		this.positionY = this.map.getBottomWallPosition() - this.paddleHalfSize
      }
	  	else {
        this.collisionWithWall = false 
        this.positionY += offset
      }
	  }
  }
}
