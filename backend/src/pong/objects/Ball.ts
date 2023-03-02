import GameMap from "./GameMap"
import { e_interval } from "./GameRoom"
import Player from "./Player"

enum e_ball {
  MAX_BOUNCE_ANGLE = Math.PI / 4
}

export default class Ball {
  private positionX: number
  private positionY: number
  private velocityX: number
  private velocityY: number
  private radius: number
  private speed: number
  private map: GameMap
  private players: Player[]
  private resetBall: boolean
  private collision: boolean
  private newGoal: boolean
  private wss: any
  private socketIoRoomName: string

  constructor(map: GameMap, players: Player[], wss: any, socketIoRoomName: string) {
    this.map = map
  	this.positionX = map.getWidth() * 0.5
    this.positionY = map.getBottomWallPosition() * 0.5  
  	this.radius = map.getBallRadius()
  	this.players = players
    this.resetBall = false
    this.newGoal = false
    this.speed = e_interval.REFRESH_RATE * 0.10
    this.wss = wss
    this.socketIoRoomName = socketIoRoomName
    this.velocityX = -1
	  this.velocityY = 0
  }

  //------------------------------------------------------ ACCESSORS
  getPositionX(): number {return this.positionX}
  getPositionY(): number {return this.positionY}
  getPosition(): number[] {return [this.positionX, this.positionY]}
  getNewGoal(): boolean {return this.newGoal}
  getBallDirection(): {} {return {velocityX: this.velocityX * 0.2, velocityY: this.velocityY * 0.2}}
  getCollision(): boolean {return this.collision}

  //------------------------------------------------ UPDATE POSITION

  private newPositionX(): number {return this.positionX + this.velocityX * this.speed}
  private newPositionY(): number {return this.positionY + this.velocityY * this.speed}
  
  private collisionWithWall(newPositionY: number): boolean {

    if (newPositionY + this.radius > this.map.getBottomWallPosition())
      return true
    if (newPositionY - this.radius < 0)
      return true
    return false
  }


  private goalScored(newPositionX: number): boolean {
    if (newPositionX < 0) { // playerTwo scored a goal
      // add one point to player two
      return true && this.resetBall === false
    }
    else if (newPositionX > this.map.getWidth()) {
      // add one point to player one
      return true && this.resetBall === false
    }
    return false
  }

  private collisionWithPaddle(player: Player): boolean {
    if (this.collision === true)
      return false
    const ballTop = this.positionY - this.radius
    const ballBottom = this.positionY + this.radius
    const ballLeft = this.positionX - this.radius
    const ballRight = this.positionX + this.radius

    const paddleCenterY = player.getPaddlePositionY()
    const paddleCenterX = player.getPaddlePositionX()
    const paddleHalfSize = player.getPaddleHalfSize()
    const paddleTop = paddleCenterY - paddleHalfSize
    const paddleBottom = paddleCenterY + paddleHalfSize
    const paddleLeft = paddleCenterX - player.getPaddleHalfWidth()
    const paddleRight = paddleCenterX + player.getPaddleHalfWidth()

    return ballLeft < paddleRight 
        && ballTop < paddleBottom 
        && ballRight > paddleLeft
        && ballBottom > paddleTop
  }

  updatePosition(deltaTime: number) {
    this.speed = deltaTime * 0.2
    const player: Player = this.velocityX < 0 ? this.players[0] : this.players[1]
    const newPositionX = this.newPositionX()
    const newPositionY = this.newPositionY()

    if (this.goalScored(newPositionX) === true) { // goal scored, reset ball
        this.resetBall = true
        this.newGoal = true
        const player: Player = newPositionX < 0 ? this.players[1] : this.players[0]
        
        player.incrementScore()
        setTimeout(() => {
            this.positionX = this.map.getWidth() * 0.5
            this.positionY = this.randomPositionY()
            this.resetBall = false
            this.newGoal = false
            this.wss.to(this.socketIoRoomName).emit('ballPosition', [this.positionX, this.positionY])
        }, 1000) // send ball again after 1 sec
    }
    if (this.collisionWithWall(newPositionY) === true) {
        this.velocityY = -this.velocityY
        this.wss.to(this.socketIoRoomName).emit('ballPosition', [this.newPositionX(), this.newPositionY()])
        this.wss.to(this.socketIoRoomName).emit('ballDirection', this.getBallDirection())
    }
    if (this.collisionWithPaddle(player) === true) {
        const collisionPointY = (newPositionY - player.getPaddlePositionY())
        const normalizedCollisionPoint = collisionPointY / player.getPaddleHalfSize()
        const bounceAngle = e_ball.MAX_BOUNCE_ANGLE * normalizedCollisionPoint
        const direction = this.velocityX < 0 ? 1 : -1
        const speed = Math.abs(normalizedCollisionPoint) + 1

        this.collision = true
        this.velocityX = direction * Math.cos(bounceAngle) * speed
        this.velocityY = Math.sin(bounceAngle) * speed
        this.wss.to(this.socketIoRoomName).emit('ballPosition', [this.newPositionX(), this.newPositionY()])
        this.wss.to(this.socketIoRoomName).emit('ballDirection', {velocityX: this.velocityX * 0.2, velocityY: this.velocityY * 0.2})
        setTimeout(() => {this.collision = false}, 200) // pour eviter double collision sur paddle
    }
    this.positionX = this.newPositionX()
    this.positionY = this.newPositionY()
  }

  randomPositionY(): number { // min and max included 
    return Math.floor(Math.random() * (this.map.getBottomWallPosition() - 20) + 10)
  }
}