import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import GameRoom from './objects/GameRoom';
import Player from './objects/Player';
import PlayingList from './objects/PlayingList';
import WaitingList from './objects/WaitingList';

export interface IPlayerRoom {
  player: Player,
  opponent: string,
  gameRoomId: string,
  map: string
}

interface IQueue {
  userId: number,
  client: Socket
}

@Injectable()
export class PongService {
  private gameRoomMap: Map<string, GameRoom> = new Map<string, GameRoom>()
  private gameRoomWaitingForOpponents: WaitingList[] = new Array()
  private gameRoomPlaying: PlayingList[] = new Array()
  private players: Map<number, IPlayerRoom> = new Map<number, IPlayerRoom>()
  private matchmakingQueue: IQueue[] = new Array()
  private createGame: Map<number, any> = new Map<number, any>()

  async createGameRoom(appGatewayObj: any, user: any, roomProps: any): Promise<string> {
    const crypto = require("crypto");
    const gameRoomId: string = crypto.randomBytes(16).toString("hex");
    const gameRoom = new GameRoom(appGatewayObj, user, gameRoomId, roomProps)

    this.createGame.set(user.id, user)
    this.gameRoomMap.set(gameRoomId, gameRoom)
    if (roomProps.numberOfPlayers === 2 && !roomProps.inviteFriendId) {
      this.matchmakingInvite(gameRoom, null, appGatewayObj, gameRoomId, roomProps, user)
      const interval = setInterval(() => {
        this.matchmakingInvite(gameRoom, interval, appGatewayObj, gameRoomId, roomProps, user)
      }, 10000)
    }
    return gameRoomId
  }

  matchmakingInvite(gameRoom: GameRoom, interval: NodeJS.Timer, appGatewayObj: any, gameRoomId: string, roomProps: any, user: any) {
    if (gameRoom.getRoomIsFull() === true 
      || this.gameRoomWaitingForOpponents.find(elem => elem.gameRoomId === gameRoomId)
      || gameRoom.getLeftEmpty() === true) {
      clearInterval(interval)
      return
    }
    if (this.matchmakingQueue.length > 0) {
      while (this.matchmakingQueue[0]?.userId === user.id)
        this.matchmakingQueue.splice(0, 1)
      if (this.matchmakingQueue.length > 0) {
        this.matchmakingQueue[0].client.emit('matchReady', gameRoomId)
        gameRoom.setInvite(this.matchmakingQueue[0].userId)
        this.matchmakingCountdown(this.matchmakingQueue[0].client, gameRoom)
        this.matchmakingQueue.shift()
      }
    }
    if (this.matchmakingQueue.length === 0) {
      const ret: WaitingList = this.gameRoomWaitingForOpponents.find(elem => elem.gameRoomId === gameRoomId)
      if (!ret)
        this.gameRoomWaitingForOpponents.push(new WaitingList(gameRoomId, user, roomProps.map))
      clearInterval(interval)
      return 
    }
  }

  async matchmakingCountdown(client: Socket, gameRoom: GameRoom) {
    let counter = 10

    client.emit('updateMatchmakingCounter', counter)
    const interval = setInterval(() => {
      counter--
      if (gameRoom.getRoomIsFull() === true) {
        clearInterval(interval)
        return
      }
     client.emit('updateMatchmakingCounter', counter)
      if (counter === 0) {
        clearInterval(interval)
        return
      }
    }, 1000);
  }

  queueMatchmaking(client: Socket, userId: number) {
    const user: IQueue = {userId: userId, client: client}

    for (let i = 0; i < this.matchmakingQueue.length; i++) {
      if (this.matchmakingQueue[i].userId === userId)
        return
    }
    this.matchmakingQueue.push(user)
  }

  gameIsRunning(gameRoomId: string): boolean {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId) 

    if (!gameRoom)
      return false
    if (gameRoom.getGameIsRunning() === true) {
      gameRoom.emitFullGameRoomState()
      return true
    }
    return false
  }

  joinRoom(user: any, gameRoomId: string): boolean {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId) 

    if (!gameRoom)
      return false
    if (gameRoom.getRoomIsFull() === true)
      return false // cannot join room because its already full
   
    gameRoom.addNewPlayer(user)
    if (gameRoom.getRoomIsFull() === true) { // delete gameRoom from waiting list if full
      for (let i = 0; i < this.gameRoomWaitingForOpponents.length; i++)
        if (this.gameRoomWaitingForOpponents[i].gameRoomId === gameRoomId)
          this.gameRoomWaitingForOpponents.splice(i, 1)
        // add gameRoom to playingList
        const map = gameRoom.getMapName()
        const playerOne: Player = gameRoom.getPlayerOne()
        const playerTwo: Player = gameRoom.getPlayerTwo()
        this.gameRoomPlaying.push(new PlayingList(gameRoomId, playerOne.getUser(), user, map))
        
        this.createGame.delete(playerOne.getId())
        // adding users to Map of players
        this.players.set(playerOne.getId(), {player: playerOne, gameRoomId: gameRoomId, map: map, opponent: playerTwo.getId() == playerOne.getId() ? "himself" : playerTwo.getUsername()})
        if (playerOne.getId() !== user.id)
          this.players.set(user.id, {player: playerTwo, gameRoomId: gameRoomId, map: map, opponent: playerOne.getUsername()})
    }
    return true
  }

  rejoinGameRoom(userId: number, gameRoomId: string): boolean {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return false

    const playerOne = gameRoom.getPlayerOne()
	  const playerTwo = gameRoom.getPlayerTwo()

    if (playerOne.getId() === userId){
	  	playerOne.setIsActive(true)
	  }
	  if (playerTwo.getId() === userId) {
	  	playerTwo.setIsActive(true)
	  }
    if (playerOne.isActive() && playerTwo.isActive()) {
      gameRoom.emitFullGameRoomState()
      return true
    }
    return false
  }

  leaveGameRoom(gameRoomId: string, userId: number) {
    let gameRoom: GameRoom = null
    
    if (gameRoomId === 'User disconnected')
      gameRoom = this.gameRoomMap.get(this.players.get(userId)?.gameRoomId)
    else
	    gameRoom = this.gameRoomMap.get(gameRoomId)

	  if (!gameRoom)
	    return

	  const playerOne = gameRoom.getPlayerOne()
	  const playerTwo = gameRoom.getPlayerTwo()

	  if (playerOne && playerOne.getId() === userId){
	  	playerOne.setIsActive(false)
	  	gameRoom.pauseGame()
      gameRoom.waitingForOpponent(playerOne.getUser().username)
    }
	  if (playerTwo && playerTwo.getId() === userId) {
	  	playerTwo.setIsActive(false)
	  	gameRoom.pauseGame()
      gameRoom.waitingForOpponent(playerTwo.getUser().username)
	  }
  }

  exitGameRoom(gameRoomId: string, userId: number) {
    const gameRoom = this.gameRoomMap.get(gameRoomId)
    if (!gameRoom) {
     return
    }

    // setting a new winner will automatically end the game if it's running  
    if (gameRoom.getRoomIsFull() === true) {
      const playerOne: Player = gameRoom.getPlayerOne()
      const playerTwo: Player = gameRoom.getPlayerTwo()
      if (userId !== playerOne.getId() && userId !== playerTwo.getId()) 
        return
      const winner: Player = playerOne.getId() === userId ? playerTwo : playerOne
      gameRoom.setWinner(winner.getId())
    }
    else { // Room is not full, therefore, there is no winner / loser
      gameRoom.exitEmptyGameRoom()
      for (let i = 0; i < this.gameRoomWaitingForOpponents.length; i++)
        if (this.gameRoomWaitingForOpponents[i].gameRoomId === gameRoomId)
          this.gameRoomWaitingForOpponents.splice(i, 1)
    }
    this.deleteGame(gameRoomId)
  }

  getStreamingGameRoomProps(streamUserId: number): IPlayerRoom {
    const playerRoom: IPlayerRoom = this.players.get(streamUserId)
    
    if (this.gameRoomMap.get(playerRoom?.gameRoomId)?.getGameIsOver() === false)
      return playerRoom
  }

  getInviteFriendId(gameRoomId: string): number {
    const gameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return

    return gameRoom.getInviteFriendId()
  }

  playerIsInARoom(userId: number): boolean {
    if (this.createGame.get(userId))
      return true
    return false
  }

  getGameRoomStatus(gameRoomId: string): boolean {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom || gameRoom.getGameIsOver() === true || !gameRoom.getPlayerTwo())
      return false
    gameRoom.emitFullGameRoomState()
    return gameRoom.getGameIsRunning()
  }

  getGameRoomMap(gameRoomId: string): string{
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return null
    return gameRoom.getMapName()
  }

  deleteGame(gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
    const playerOne: Player = gameRoom.getPlayerOne()
    const playerTwo: Player = gameRoom.getPlayerTwo()
   
    if (playerOne) {
      this.createGame.delete(playerOne.getId())
      this.players.delete(playerOne.getId())
    }
    if (playerTwo)
      this.players.delete(playerTwo.getId())
    
    for (let i = 0; i < this.gameRoomPlaying.length; i++)
      if (this.gameRoomPlaying[i].gameRoomId === gameRoomId)
        this.gameRoomPlaying.splice(i, 1)

    this.gameRoomMap.delete(gameRoomId)
  }

  getPlayerStatus(userId: number): any {
	  const playerRoom: IPlayerRoom = this.players.get(userId)
	  if (!playerRoom)
	    return {status: 'User is not playing', isPlaying: false}
    else if (playerRoom.player.isActive() === true)
	    return {status: 'User is playing and active', isPlaying: true, opponent: playerRoom.opponent}
	  else {
	    return {status: 'User is playing and inactive', gameRoomId: playerRoom.gameRoomId, map: playerRoom.map, isPlaying: true, opponent: playerRoom.opponent}
	  }
  }

  addSpectator(user: any, gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)
    
    if (!gameRoom)
      return
    gameRoom.addNewSpectator(user)
  }

  startGame(gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
    if (gameRoom.getPlayerOne().isActive() === true
      && gameRoom.getPlayerTwo().isActive() === true)
	  gameRoom.startGame()
  }

  pauseGame(gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
	  gameRoom.pauseGame()
  }

  handleKeydown(clientId: number, gameRoomId: string, keyCode: number) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
	  gameRoom.handleKeydown(clientId, keyCode)
  }
 
  handleKeyup(clientId: number, gameRoomId: string, keyCode: number) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
	  gameRoom.handleKeyup(clientId, keyCode)
  }

  setAllKeysup(clientId: number, gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
    gameRoom.setAllKeysup(clientId)
  }

  getRoomIsFull(gameRoomId: string): boolean {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return false
    return gameRoom.getRoomIsFull()
  }

  getWaitingList(): WaitingList[] {
    return this.gameRoomWaitingForOpponents
  }

  getPlayersId(gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return
    return { playerOne: gameRoom.getPlayerOne()?.getId(), playerTwo: gameRoom.getPlayerTwo()?.getId() }
  }

  getPlayingList(): PlayingList[] {
    for (let i = 0; i < this.gameRoomPlaying.length; i++) {
      const gameRoom: GameRoom = this.gameRoomMap.get(this.gameRoomPlaying[i].gameRoomId)
      
      if (!gameRoom)
        this.gameRoomPlaying.splice(i, 1)
      else if (gameRoom.getGameIsOver() === true) {
        this.deleteGame(gameRoom.getGameRoomId())
        this.gameRoomPlaying.splice(i, 1)
      }
    }
    return this.gameRoomPlaying
  }

  gameIsOver(gameRoomId: string): boolean {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return true
    
    return gameRoom.getGameIsOver()
  }

  getBallDirection(client: Socket, gameRoomId: string) {
    const gameRoom: GameRoom = this.gameRoomMap.get(gameRoomId)

    if (!gameRoom)
      return

    gameRoom.emitBallDirection(client)
  }

}
