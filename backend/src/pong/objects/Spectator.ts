export default class Spectator {
    private id: number
    private username: string
    private avatar: string

    constructor(user: any) {
        this.id = user.id
        this.username = user.username
        this.avatar = user.avatar
    }
}