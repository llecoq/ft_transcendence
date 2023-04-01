import Ball from "./Ball"
import GameMap from "./GameMap"
import Player, { IUser } from "./Player"
import Spectator from "./Spectator"
import { UserEntity } from "../../users/entities/user.entity"
import { UsersService } from "../../users/users.service"
import { MatchService } from "../match/match.service"
import { Socket } from "socket.io"

export enum e_interval {
  REFRESH_RATE = 8 // loop interval refresh rate in ms
}

export default class GameRoom {
  private usersService: UsersService
  private matchService: MatchService
  private id: string
  private wss: any
  private socketIoRoomName: string
  private map: GameMap
  private players: Player[]
  private spectators: Map<number, Spectator>
  private ball: Ball
  private timeStamp: number
  private interval: NodeJS.Timer
  private numberOfPlayers: number
  private roomIsFull: boolean
  private inviteFriendId: number
  private gameIsRunning: boolean
  private gameIsOver: boolean
  private leftEmptyGameRoom: boolean

  constructor(appGatewayObj: any, user: any, id: string, roomProps: any) {
    this.usersService = appGatewayObj.usersService
    this.matchService = appGatewayObj.matchService
    this.id = id
  	this.wss = appGatewayObj.wss
    this.map = new GameMap(roomProps.map)
    this.players = new Array()
    this.spectators = new Map<number, Spectator>()
  	this.socketIoRoomName = "GameRoom-" + id
    this.addNewPlayer(user)
    this.ball = new Ball(this.map, this.players, this.wss, this.socketIoRoomName)
  	this.numberOfPlayers = roomProps.numberOfPlayers
  	this.roomIsFull = false
    this.inviteFriendId = roomProps.inviteFriendId
    this.gameIsRunning = false
    this.gameIsOver = false
    this.leftEmptyGameRoom = false
  }

  addNewPlayer(user: any) {
    const numberOfPlayers = this.players.length

    if (numberOfPlayers === 2)
        return
    this.players.push(new Player(user, numberOfPlayers, this.map))
	  if (this.players.length === 2) {
		  this.roomIsFull = true
      this.wss.to(this.socketIoRoomName).emit('roomIsFull')
    }
  }

  addNewSpectator(user: any) {
    this.spectators.set(user.id, new Spectator(user))
  }

  //----------------------------------------------------------------- ACCESSORS
  getGameRoomId(): string {return this.id}
  getBallPosition(): number[] {return [this.ball.getPositionX(), this.ball.getPositionY()]}
  getRoomIsFull(): boolean {return this.roomIsFull}
  getInviteFriendId(): number {return this.inviteFriendId}
  getScores(): number[] {return ([this.players[0].getScore(), this.players[1].getScore()])}
  getPlayerOne(): Player {return this.players[0]}
  getPlayerTwo(): Player {return this.players[1]}
  getMapName(): string {return this.map.getName()}
  getMapSize(): number[] {return [this.map.getWidth(), this.map.getBottomWallPosition()]}
  getGameIsOver(): boolean {return this.gameIsOver}
  getLeftEmpty(): boolean {return this.leftEmptyGameRoom}
  getGameIsRunning(): boolean {return this.gameIsRunning}

  getPlayerPosition(index: number) {
	  if (this.players[index].positionHasChanged() === true)
	  	return [true, this.players[index].getPosition()]
	  else
	  	return [false, 0, 0]
  }

  handleKeydown(playerId: number, keyCode: number) {
    this.players.forEach(player => {
	  	if (player.getId() === playerId)
        player.handleKeydown(keyCode)
    })
  }

  handleKeyup(playerId: number, keyCode: number) {
	  this.players.forEach(player => {
	  	if (player.getId() === playerId)
        player.handleKeyup(keyCode)
	  })
  }

  setAllKeysup(playerId: number) {
    this.players.forEach(player => {
	  	if (player.getId() === playerId) {
        player.setArrowDown(false)
        player.setArrowUp(false)
      }
	  })
  }

  setWinner(winnerId: number) {
    this.players.forEach(player => {
	  	if (player.getId() === winnerId) {
        player.setScore(this.map.getMaxScore())
      }
	  })
    this.finishGame()
  }

  setInvite(userId: number) {this.inviteFriendId = userId}

  //--------------------------------------------------------- ANIMATIONS / LOOP
  startGame() {
    if (this.gameIsRunning === false) {
      this.timeStamp = Date.now()
      this.interval = setInterval(this.loop.bind(this), e_interval.REFRESH_RATE)
      this.gameIsRunning = true
      this.players[0].setIsActive(true)
      this.players[1].setIsActive(true)
      this.wss.to(this.socketIoRoomName).emit('gameStarts')
      this.wss.emit('getUsersNotify')
      this.emitFullGameRoomState()
    } 
  }

  pauseGame() {
    if (this.gameIsRunning === true) {
      clearInterval(this.interval)
      this.gameIsRunning = false
      this.wss.to(this.socketIoRoomName).emit('gameStops')
    }
  }

  exitEmptyGameRoom() {
    this.wss.to(this.socketIoRoomName).emit('endOfGame')
    this.gameIsOver = true
    this.leftEmptyGameRoom = true
  }

  private finishGame() {
    const playerOne: Player = this.getPlayerOne()
    const playerTwo: Player = this.getPlayerTwo()
    const winner: Player = playerOne.getScore() > playerTwo.getScore() ? playerOne : playerTwo

    this.pauseGame()
    this.wss.to(this.socketIoRoomName).emit('endOfGame', winner.getUser())
    this.gameIsOver = true
    if (this.numberOfPlayers === 2) {
      this.addMatchToDB(winner.getUser())
      this.usersService.incrementXp(winner.getId())
    }
  }
  
  private async addMatchToDB(winner: IUser) {
    const userHome: UserEntity = await this.usersService.findOneById(this.getPlayerOne().getId())
    const userForeign: UserEntity = await this.usersService.findOneById(this.getPlayerTwo().getId())
    const map: string = this.map.getName()
    const userHomeScore: number = this.getPlayerOne().getScore()
    const userForeignScore: number = this.getPlayerTwo().getScore()

    this.matchService.create({
      userHome: userHome,
      userForeign: userForeign,
      winner: winner.id,
      map: map,
      userHomeScore: userHomeScore,
      userForeignScore: userForeignScore
    })
		this.wss.to(this.socketIoRoomName).emit("Created match")
  }

  private async loop() {
    const currentTimeStamp = Date.now()
    const deltaTime = currentTimeStamp - this.timeStamp
    const playerOne: Player = this.players[0]
    const playerTwo: Player = this.players[1]

    // update players position
    playerOne.updatePosition(deltaTime)
    playerTwo.updatePosition(deltaTime)

    // started moving
    if (playerOne.getStartedMoving() === true)
      this.wss.to(this.socketIoRoomName).emit('paddleOne', playerOne.getKeys())
    if (playerTwo.getStartedMoving() === true)
      this.wss.to(this.socketIoRoomName).emit('paddleTwo', playerTwo.getKeys())
    // stopped moving
    if (playerOne.getStoppedMoving() === true) {
      this.wss.to(this.socketIoRoomName).emit('paddleOne', playerOne.getKeys())
      this.wss.to(this.socketIoRoomName).emit('playerOnePosition', {position: playerOne.getPosition(), velocity: playerOne.getPaddleVelocity()})
    }
    if (playerTwo.getStoppedMoving() === true) {
      this.wss.to(this.socketIoRoomName).emit('paddleTwo', playerTwo.getKeys())
      this.wss.to(this.socketIoRoomName).emit('playerTwoPosition', {position: playerTwo.getPosition(), velocity: playerTwo.getPaddleVelocity()})
    }
    // collision with wall
    if (playerOne.getCollisionWithWall() === true)
      this.wss.to(this.socketIoRoomName).emit('playerOnePosition', {position: playerOne.getPosition(), velocity: playerOne.getPaddleVelocity()})
    if (playerTwo.getCollisionWithWall() === true)
      this.wss.to(this.socketIoRoomName).emit('playerTwoPosition', {position: playerTwo.getPosition(), velocity: playerTwo.getPaddleVelocity()})

    // update ball position
    this.ball.updatePosition(deltaTime)

    // update scores
    if (this.ball.getNewGoal() === true) {
      const scores: number[] = this.getScores()
      
      this.wss.to(this.socketIoRoomName).emit('updateScores', scores)
      if (scores[0] === this.map.getMaxScore() || scores[1] === this.map.getMaxScore()) { // END OF GAME
        this.finishGame()
      }
    }
  	this.timeStamp = currentTimeStamp
  }

  emitFullGameRoomState() {
    this.wss.to(this.socketIoRoomName).emit('playerOnePosition', {position: this.players[0].getPosition(), velocity: this.players[0].getPaddleVelocity()})
    this.wss.to(this.socketIoRoomName).emit('playerTwoPosition', {position: this.players[1].getPosition(), velocity: this.players[1].getPaddleVelocity()})
    this.wss.to(this.socketIoRoomName).emit('ballPosition', this.ball.getPosition())
    this.wss.to(this.socketIoRoomName).emit('updateScores', this.getScores())
    this.wss.to(this.socketIoRoomName).emit('ballDirection', this.ball.getBallDirection())
    // this.wss.to(this.socketIoRoomName).emit('gameStarts')
  }
  
  emitBallDirection(client: Socket) {
    client.emit('ballDirection', this.ball.getBallDirection())
  }

  waitingForOpponent(username: string) {
    let counter = 15

    this.wss.to(this.socketIoRoomName).emit('waitingForOpponent', {username: username, counter: counter})
    const interval = setInterval(() => {
      if (this.players[0].isActive() && this.players[1].isActive()) {
        clearInterval(interval)
        return
      }
      counter--
      this.wss.to(this.socketIoRoomName).emit('waitingForOpponent', {username: username, counter: counter})
      if (counter <= 0) {
        clearInterval(interval)

        const winner: Player = this.players[0].getUsername() === username ? this.players[1] : this.players[0]
        if (winner) {
          winner.setScore(this.map.getMaxScore())
          this.finishGame()
        }
      }
    }, 1000);
  }

}