import { IUser } from "./Player"

export default class PlayingList {
  gameRoomId: string
  playerOneAvatar: string
  playerOneUsername: string
	playerOneLevel: number
  playerTwoAvatar: string
  playerTwoUsername: string
	playerTwoLevel: number 
  map: string  
  
  constructor(gameRoomId: string, user1: IUser, user2: IUser, map: string) {
    this.gameRoomId = gameRoomId
    this.playerOneAvatar = user1.avatar
    this.playerOneUsername = user1.username
	  this.playerOneLevel = user1.xp
    this.playerTwoAvatar = user2.avatar
    this.playerTwoUsername = user2.username
	  this.playerTwoLevel = user2.xp
    this.map = map
  }
}