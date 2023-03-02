export default class WaitingList {
  gameRoomId: string
  avatar: string
  username: string
  map: string
  xp: number

  constructor(gameRoomId: string, user: any, map: string) {
    this.gameRoomId = gameRoomId
    this.avatar = user.avatar
    this.map = map
    this.username = user.username
    this.xp = user.xp
  }
}