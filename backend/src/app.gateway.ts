import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  Logger,
} from '@nestjs/common';
import { UsersService } from './users/users.service';
import { MessagesService } from './messages/messages.service';
import { AuthService } from './auth/auth.service';
import { ChannelsService } from './channels/channels.service';
import { FriendshipService } from './friendship/friendship.service';
import { IPlayerRoom, PongService } from './pong/pong.service';
import { MutedUsersService } from './mutedUsers/mutedUsers.service';
import { BannedUsersService } from './bannedUsers/bannedUsers.service';
import { TwoFactorAuthenticationService } from './two-factor-authentication/two-factor-authentication.service';
import { MatchService } from './pong/match/match.service';
import { UserEntity } from './users/entities/user.entity';

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  INGAME = 'ingame',
}

interface user {
  avatar?: string | null;
  email: 'abonnel@student.42lyon.fr';
  fortytwoId?: number | null;
  id: number;
  is2FAactive: boolean;
  nbOfGames: number;
  password?: string | null;
  secretOf2FA?: string | null;
  status: string;
  username: string;
  xp: number;
}

@WebSocketGateway({ namespace: '/' })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private usersConnected: UserEntity[];
  @WebSocketServer() wss: Server;
  constructor(
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly channelsService: ChannelsService,
    private readonly authService: AuthService,
    private readonly friendshipService: FriendshipService,
    private readonly pongService: PongService,
    private readonly mutedUsersService: MutedUsersService,
    private readonly bannedUsersService: BannedUsersService,
    private readonly twoFactorAuthService: TwoFactorAuthenticationService,
    private readonly matchService: MatchService,
  ) {
    this.usersConnected = new Array<UserEntity>();
  }

  async handleDisconnect(socket: Socket) {
    let res = await this.authService.getUserFromSocket(
      socket,
      this.usersService,
    );
    if (res.user) {
      console.log('User disconnected');
      this.usersConnected = this.usersConnected?.filter(
        user => user.id != res.user.id,
      );
      this.pongService.leaveGameRoom('User disconnected', res.user.id)
    }
    this.wss.emit('getUsersNotify');
  }

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  async handleConnection(socket: Socket) {
    let res = await this.authService.getUserFromSocket(
      socket,
      this.usersService,
    );
    console.log('UserConnected');
    if (!res.expired && res.user &&!this.usersConnected.find(user => user.id == res.user.id))
      this.usersConnected.push(res.user);
  }

  /*CHANNEL*/

  @SubscribeMessage('disconnection')
  async handledisconnect(client: Socket) {
    console.log('disconnection');
  }

  @SubscribeMessage('createChannel')
  async handleCreateChannel(
    client: Socket,
    message: {
      name: string;
      type: string;
      usersList: user[];
      password: string;
    },
  ) {
    console.log('createChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    const userIdList: number[] = message.usersList.map(function (value) {
      return value.id;
    });
    let ret = await this.channelsService.createChannel(
      message.name,
      SocketUser.user,
      message.type,
      userIdList,
      message.password,
    );
    this.wss.emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('joinPublicChannel')
  async handleJoinPublicChannel(
    client: Socket,
    message: { channelId: number },
  ) {
    console.log('joinPublicChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to join',
      };
    let ret = await this.channelsService.joinPublicChannel(
      SocketUser.user,
      channel,
    );
    client.join('channel' + message.channelId)
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('setChannelName')
  async handleSetChannelName(
    client: Socket,
    message: { channelName: string; channelId: number },
  ) {
    console.log('setChannelName');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    if (channel.owner.id != SocketUser.user.id)
      return {
        status: 404,
        message: "You don't have the right to change channel's name",
      };
    let ret = await this.channelsService.changeChannelName(
      message.channelName,
      channel,
    );
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('setUnsetChannelAdmin')
  async handleSetUnsetChannelAdmin(
    client: Socket,
    message: { userId: number; channelId: number },
  ) {
    console.log('setUnsetChannelAdmin');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    if (channel.owner.id == message.userId)
      return { status: 404, message: "Can't modify owner status" };
    if (channel.owner.id != SocketUser.user.id &&
      !channel.adminUsers.find(
         (userSearch) => SocketUser.user.id == userSearch.id,
      )
    )
      return {
        status: 404,
        message: "You don't have the right to change channel's admins",
      };
    let ret = await this.channelsService.setUnsetChannelAdmin(
      message.userId,
      channel,
    );
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage("addUsersToChannel")
  async handleAddUsersToChannel(
    client: Socket,
    message: { users: UserEntity[]; channelId: number },
  ) {
    console.log('addUsersToChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    if (channel.owner.id != SocketUser.user.id &&
      !channel.adminUsers.find(
         (userSearch) => SocketUser.user.id == userSearch.id,
      )
    )
      return {
        status: 404,
        message: "You don't have the right to add users to chat",
      };
    let newusers = await this.channelsService.addUsersToChannel(
      message.users,
      channel,
    );
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    newusers.forEach(async user => {
      const res = await this.authService.getSocketFromUserId(
        this.wss,
        user.id,
      );
      if (res) {
        this.handleGetChannels(res);
      }
    })
    return { status: 200};
  }

  @SubscribeMessage('kickUserFromChannel')
  async handleKickUserFromChannel(
    client: Socket,
    message: { userId: number; channelId: number },
  ) {
    console.log('kickUserFromChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    if (channel.owner.id == message.userId)
      return { status: 404, message: "Can't modify owner status" };
    if (channel.owner.id != SocketUser.user.id &&
      !channel.adminUsers.find(
        async (userSearch) => SocketUser.user.id == userSearch.id,
      )
    )
      return {
        status: 404,
        message: "You don't have the right to kick someone",
      };
    let ret = await this.channelsService.removeUserFromChannel(
      message.userId,
      channel,
    );
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('muteUserFromChannel')
  async handleMuteUserFromChannel(
    client: Socket,
    message: { userId: number; channelId: number; duration: number },
  ) {
    console.log('muteUserFromChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    let user = await this.usersService.findOneById(message.userId);
    if (!user)
      return { status: 404, message: 'Could not find user you want to mute' };
    if (channel.owner.id == message.userId)
      return { status: 404, message: "Can't modify owner status" };
    if (channel.owner.id != SocketUser.user.id &&
      !channel.adminUsers.find(
        async (userSearch) => SocketUser.user.id == userSearch.id,
      )
    )
      return {
        status: 404,
        message: "You don't have the right to mute someone",
      };
      if(channel.mutedUsers.find(channel => channel.user.id == message.userId))
      await this.mutedUsersService.unmuteUserFromChannel(
        user,
        channel,
      );
    else 
      await this.mutedUsersService.muteUserFromChannel(
        user,
        channel,
        message.duration,
      );
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200};
  }

  @SubscribeMessage('banUserFromChannel')
  async handleBanUserFromChannel(
    client: Socket,
    message: { userId: number; channelId: number; duration: number },
  ) {
    console.log('banUserFromChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    let user = await this.usersService.findOneById(message.userId);
    if (!user)
      return { status: 404, message: 'Could not find user you want to mute' };
    if (channel.owner.id == message.userId)
      return { status: 404, message: "Can't modify owner status" };
    if (channel.owner.id != SocketUser.user.id &&
      !channel.adminUsers.find(
         (userSearch) => SocketUser.user.id == userSearch.id,
      )
    )
      return {
        status: 404,
        message: "You don't have the right to ban someone",
      };
    if(channel.bannedUsers.find(channel => channel.user.id == message.userId))
      await this.bannedUsersService.unbanUserFromChannel(
        user,
        channel,
      );
    else 
      await this.bannedUsersService.banUserFromChannel(
        user,
        channel,
        message.duration,
      );
    const res = await this.authService.getSocketFromUserId(
      this.wss,
      message.userId,
    );
    if (res) {
      await this.handleGetChannels(res);
      await this.handleGetPublicChannels(res);
    }
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200};
  }

  @SubscribeMessage('quitChannel')
  async handleQuitChannel(client: Socket, message: { channelId: number }) {
    console.log('quitChannel');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    let ret = await this.channelsService.removeUserFromChannel(
      SocketUser.user.id,
      channel,
    );
    this.handleGetChannels(client);
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('setChannelType')
  async handleSetChannelType(
    client: Socket,
    message: {
      channelType: string;
      channelPassword: string;
      channelId: number;
    },
  ) {
    console.log('setChannelType');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    if (channel.owner.id != SocketUser.user.id)
      return {
        status: 404,
        message: "You don't have the right to change channel's name",
      };
    if (message.channelType == 'protected' && message.channelPassword == '')
      return {
        status: 404,
        message: "Password can't be empty for a protected channel.",
      };
    let ret = await this.channelsService.changeChannelType(
      message.channelType,
      message.channelPassword,
      channel,
    );
    this.wss.to('channel' + message.channelId).emit('getChannelsNotify');
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('getUserChannels')
  async handleGetChannels(client: Socket) {
    console.log('getUserChannels');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = await this.channelsService.findAllChannelsInWhichUserIs(
      SocketUser.user,
    );
    ret = ret.filter((channel) =>!this.bannedUsersService.isUserBanned(SocketUser.user, channel));
    ret.forEach((channel) => {
      if (
        channel.type == 'protected' &&
        !client.rooms.has('channel' + channel.id)
      )
        delete channel.messages;
      else client.join('channel' + channel.id);
    });
    this.handleRoomLeave(client);
    ret.forEach((channel) => {
      if (channel.messages) client.join('channel' + channel.id);
    });
    client.emit('getUserChannels', ret);
  }

  @SubscribeMessage('getPublicChannels')
  async handleGetPublicChannels(client: Socket) {
    console.log('getPublicChannels');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = await this.channelsService.findAllPublicChannels();
    ret = ret.filter((channel) => !this.bannedUsersService.isUserBanned(SocketUser.user, channel));
    client.emit('getPublicChannels', ret);
    ret.forEach((channel) => {
      client.join('channel' + channel.id);
    });
  }

  @SubscribeMessage('getMessages')
  async handleRoomJoin(
    client: Socket,
    params: { channelId: number; password: string | null },
  ) {
    console.log('getMessages');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = await this.channelsService.getMessagesFromChannel(
      SocketUser.user,
      params.channelId,
      params.password,
    );
    if (!ret) return { status: 404, message: 'Wrong Channel Password' };
    else client.join('channel' + params.channelId);
    return { status: 200, channel: ret };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessages(
    client: Socket,
    message: { channelId: number; content: string },
  ) {
    console.log('sendMessage');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let channel = await this.channelsService.findOneById(message.channelId);
    if (!channel)
      return {
        status: 404,
        message: 'Could not find channel you want to modify',
      };
    const muted = await this.mutedUsersService.isUserMute(
      SocketUser.user,
      channel,
    );
    if (muted.bool)
      return {
        status: 404,
        message:
          "Can't send message ! You are muted from this channel until " +
          muted.until,
      };
    let ret = await this.messagesService.createMessage(
      message.content,
      SocketUser.user,
      channel,
    );
    this.wss.to('channel' + message.channelId).emit('newMessage', ret);
    return { status: 200 };
  }

  @SubscribeMessage('leaveAllChatRooms')
  handleRoomLeave(client: Socket) {
    console.log('leaveAllChatRooms');
    let i = 0;
    client.rooms.forEach((room) => {
      if (i != 0) client.leave(room);
      i++;
    });
  }

  /*BLOCK USER */

  @SubscribeMessage('usersNotify')
  async handleUsersNotify() {
    console.log('usersNotify');
    this.wss.emit('getUsersNotify');
  }

  @SubscribeMessage('blockOrUnBlockUser')
  async handleBlockUser(client: Socket, message: { userBlockedId: number }) {
    console.log('blockOrUnBlockUser');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    if (SocketUser.user.id == message.userBlockedId)
      return { status: 404, message: 'Cannot block yourself' };
    const blocked = await this.usersService.blockOrUnBlockUser(
      message.userBlockedId,
      SocketUser.user.id,
    );
    //We do not remove friendship so that blocked user does not know he has been blocked
    await this.handleGetUsers(client);
    await this.handleGetChannels(client);
    await this.handleGetAllFriends(client);
    if (blocked == true) return { status: 200, blocked: true };
    else return { status: 200, blocked: false };
  }

  async addStatus(userId) {
    let playStatus = this.pongService.getPlayerStatus(userId);
    return this.usersConnected.find((user) => user.id == userId)
      ? playStatus.isPlaying
        ? 'Playing against ' + playStatus.opponent
        : 'online'
      : 'offline';
  }
  @SubscribeMessage('getUsers')
  async handleGetUsers(client: Socket) {
    console.log('getUsers');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = await this.usersService.findAllExceptOne(SocketUser.user.id);
    ret.forEach(async (user) => {
      Object.assign(user, { status: await this.addStatus(user.id) });
    });
    await Promise.all(ret).then();
    client.emit('getUsers', ret);
    return { status: 200 };
  }

  /* USERPAGE */
  @SubscribeMessage('getUserById')
  async handleGetUser(client: Socket, id: number) {
    console.log('getUserById');
    if (!id) return { status: 404, message: 'No user by this id' };
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = await this.usersService.findOneById(id);
    if (!ret)
      return { status: 404, message: 'No user by this id' };
    ret = Object.assign(ret, { status: await this.addStatus(id) });
    client.emit('getUserById', ret);
    return { status: 200 };
  }

  @SubscribeMessage('getTwoFaStatus')
  async handlegGetTwoFaStatus(client: Socket) {
    console.log('getTwoFaStatus');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = SocketUser.user.is2FAactive;
    client.emit('twoFaStatus', ret);
    return { status: 200 };
  }

  //FRIENDSHIP ==========================================================
  @SubscribeMessage('createFriendship')
  async handleCreateFriendship(client: Socket, userId: number) {
    console.log('createFriendship');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    const otherUser = await this.usersService.findOneById(userId);
    if (!otherUser)
      return { status: 404, message: 'Friended user not recognized' };
    let ret = await this.friendshipService.createFriendship(
      SocketUser.user,
      otherUser,
    );
    client.emit('getFriendshipNotify');
    const res = await this.authService.getSocketFromUserId(this.wss, userId);
    if (res) {
      this.handleGetAllFriends(res);
			this.handlegetAllMyFriendsRequests(res);
      res.emit('getFriendshipNotify');
    }
    return { status: 200 };
  }

  @SubscribeMessage('removeFriendshipEntirely')
  async handleRemoveFriendshipEntirely(client: Socket, userId: number) {
    console.log('removeFriendshipEntirely');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    const otherUser = await this.usersService.findOneById(userId);
    if (!otherUser)
      return { status: 404, message: 'Other user not recognized' };
    await this.friendshipService.removeFriendshipEntirely(
      SocketUser.user,
      otherUser,
    );
    client.emit('getFriendshipNotify');
    this.handleGetAllFriends(client);
    const res = await this.authService.getSocketFromUserId(this.wss, userId);
    if (res) {
      this.handleGetAllFriends(res);
      this.handlegetAllMyFriendsRequests(res);
      res.emit('getFriendshipNotify');
    }
    return { status: 200 };
  }

  @SubscribeMessage('getFriendshipStatus')
  async handleFindFriendshipStatus(client: Socket, userId: number) {
    console.log('getFriendshipStatus');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    const otherUser = await this.usersService.findOneById(userId);
    if (!otherUser)
      return { status: 404, message: 'Other user not recognized' };
    let ret = await this.friendshipService.findRelationshipStatus(
      SocketUser.user,
      otherUser,
    );
    client.emit('getFriendshipStatus', ret);
    return { status: 200 };
  }

  @SubscribeMessage('getAllFriends')
  async handleGetAllFriends(client: Socket) {
    console.log('getAllFriends');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    let ret = await this.friendshipService.findAllFriends(SocketUser.user);
    if (ret) {
      ret.forEach(async (user) => {
        Object.assign(user, { status: await this.addStatus(user.id) });
      });
      await Promise.all(ret).then();
    }
    client.emit('getAllFriends', ret);
    return { status: 200 };
  }

  @SubscribeMessage('getAllMyFriendsRequests')
  async handlegetAllMyFriendsRequests(client: Socket) {
    console.log('getAllFriendsRequests');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    let ret = await this.friendshipService.findAllMyFriendsRequests(
      SocketUser.user,
    );
    client.emit('getAllMyFriendsRequests', ret);
    return { status: 200 };
  }

  //BLOCK FUNCTIONALITIES ============================
  @SubscribeMessage('getBlockedStatus')
  async handleGetBlockedStatus(client: Socket, userId: number) {
    console.log('getBlockedStatus');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };
    const otherUser = await this.usersService.findOneById(userId);
    if (!otherUser)
      return { status: 404, message: 'Other user not recognized' };

    let ret = await this.usersService.findBlockedStatus(
      SocketUser.user,
      otherUser,
    );
    client.emit('getBlockedStatus', ret);
    return { status: 200 };
  }

  //2FA authentication ==========================================
  @SubscribeMessage('turnOffTwoFa')
  async handleTurnOffTwoFa(client: Socket) {
    console.log('turnOffTwoFa');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    let ret = await this.usersService.removeTwoFa(SocketUser.user.id);
    client.emit('turnOffTwoFa', ret);
    return { status: 200 };
  }

  @SubscribeMessage('turnOnVerifyCode')
  async handleTurnOnVerifyCode(client: Socket, twoFactorCode: string) {
    console.log('turnOnVerifyCode');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    if (!/^[0-9]{6}$/.test(twoFactorCode))
      return { status: 422, message: 'Wrong code, should be only 6 digits' };

    const isCodeValid =
      this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        twoFactorCode,
        SocketUser.user,
      );
    if (!isCodeValid)
      return { status: 401, message: 'Wrong authentication code' };
    await this.usersService.turnOnTwoFactorAuthentication(SocketUser.user.id);
    let ret = await this.authService.getCookieWithJwtAccessToken(
      SocketUser.user.id,
      true,
    );
    client.emit('turnOnVerifyCode', ret);
    return { status: 200 };
  }

  @SubscribeMessage('logginTwoFa')
  async handleLogginTwoFa(client: Socket, twoFactorCode: string) {
    console.log('logginTwoFa');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    if (!/^[0-9]{6}$/.test(twoFactorCode))
      return { status: 422, message: 'Wrong code, should be only 6 digits' };

    const isCodeValid =
      this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        twoFactorCode,
        SocketUser.user,
      );
    if (!isCodeValid)
      return { status: 401, message: 'Wrong authentication code' };

    let ret = await this.authService.getCookieWithJwtAccessToken(
      SocketUser.user.id,
      true,
    );
    client.emit('logginTwoFa', ret);
    return { status: 200 };
  }

  //SETTINGS ===================================================================
  @SubscribeMessage('changeUsername')
  async handleChangeUsername(client: Socket, newUsername: string) {
    console.log('changeUsername');

    if (newUsername.length <= 4 || newUsername.length > 20)
      return {
        status: 422,
        message: 'This username is too short/too long (5 to 20 char)',
      };
    if (!/^[A-Za-z0-9]+$/.test(newUsername))
      return {
        status: 422,
        message: 'This username contains special char or spaces',
      };

    const usernameIsTaken = await this.usersService.findOneByUsername(
      newUsername,
    );
    if (usernameIsTaken)
      return { status: 403, message: 'This username is already taken' };

    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    let ret = await this.usersService.update(SocketUser.user.id, {
      username: newUsername,
    });
    client.emit('changeUsername', ret);
    this.wss.emit('getUsersNotify');
    return { status: 200 };
  }

  //MATCHES && STATS ===================================================================
  @SubscribeMessage('getUserMatches') //limit of 40 games
  async handleGetMatches(client: Socket, requestedUser: UserEntity) {
    console.log('getUserMatches');

    let ret = await this.matchService.getFortyUserMatches(requestedUser);
    client.emit('userMatches', ret);
    return { status: 200 };
  }

  @SubscribeMessage('getUserStats')
  async handleGetUserRank(client: Socket, requestedUser: UserEntity) {
    console.log('getUserStats');

    let ret = await this.usersService.getUserStats(requestedUser);
    client.emit('userStats', ret);
    return { status: 200 };
  }

  @SubscribeMessage('getUserAchievements')
  async handleGetUserAchievements(client: Socket, requestedUser: UserEntity) {
    console.log('getUserAchievements');

    let ret = await this.matchService.getThisYearAchievements(requestedUser);
    client.emit('userAchievements', ret);
    return { status: 200 };
  }

  //PONG ==========================================================
  @SubscribeMessage('createGameRoom')
  async createGameRoom(client: Socket, message: { map: string; numberOfPlayers: number; inviteFriendId: number }) {
    console.log('createGameRoom');
    const SocketUser = await this.authService.getUserFromSocket(client, this.usersService);
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    if (this.pongService.getPlayerStatus(SocketUser.user.id).isPlaying === true)
      return { status: 404, message: 'You cannot create a new game room when already playing' }
    if (this.pongService.playerIsInARoom(SocketUser.user.id) === true)
      return { status: 404, message: 'You cannot create a new game room when already in a Game room' }


    const appGatewayObj: any = { wss: this.wss, matchService: this.matchService, usersService: this.usersService, client: client };
    const gameRoomId: string = await this.pongService.createGameRoom(
      appGatewayObj,
      SocketUser.user,
      message,
    );

    console.log('join GameRoom');
    client.join('GameRoom-' + gameRoomId);
    client.emit('gameRoomId', gameRoomId);
    //if inviting user who blocked us, pretend invite went through and not send it to user
    const invitedUser = await this.usersService.findOneById(
      message.inviteFriendId,
    );
    if (
      invitedUser.blockedUsers.find(
        (blockedUser) => blockedUser.id === SocketUser.user.id,
      )
    )
      return { status: 200 };
    if (message.inviteFriendId) {
      const invitedSocketUser: Socket =
        await this.authService.getSocketFromUserId(
          this.wss,
          message.inviteFriendId,
        );
      if (!invitedSocketUser)
        return { status: 404, message: 'Invited Socket User not recognized' };
      invitedSocketUser.emit('GameRoomInvitation', {
        gameRoomId: gameRoomId,
        map: message.map,
        userId: SocketUser.user.id,
        username: SocketUser.user.username,
        avatar: SocketUser.user.avatar,
      });
    }
    return { status: 200 };
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, gameRoomId: string) {
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    const join = this.pongService.joinRoom(SocketUser.user, gameRoomId);
    if (join === true) client.join('GameRoom-' + gameRoomId);
    else return { status: 404, message: 'Cannot find game room' };
  }

  @SubscribeMessage('exitGameRoom')
  async exitGameRoom(client: Socket, gameRoomId: string) {
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    const invitedFriendId: number =
      this.pongService.getInviteFriendId(gameRoomId);
    // emit message to invited friend to cancel the invite
    if (invitedFriendId) {
      const invitedSocketUser: Socket =
        await this.authService.getSocketFromUserId(this.wss, invitedFriendId);

      invitedSocketUser.emit('cancelInvite', gameRoomId);
    }

    this.pongService.exitGameRoom(gameRoomId, SocketUser.user.id);
  }

  @SubscribeMessage('getGameRoomStatus')
  async getGameRoomStatus(client: Socket, gameRoomId: string) {
    const ret: boolean = this.pongService.getGameRoomStatus(gameRoomId)
    return {isRunning: ret}
  }


  @SubscribeMessage('leaveGameRoom')
  async leaveGameRoom(
    client: Socket,
    message: { gameRoomId: string; userId: number },
  ) {
    console.log('leaveGameRoom');
    this.pongService.leaveGameRoom(message.gameRoomId, message.userId);
  }

  @SubscribeMessage('rejoinGameRoom')
  async rejoinGameRoom(client: Socket, gameRoomId: string) {
    console.log('Gateway RejoinGameRoom');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    const rejoin = this.pongService.rejoinGameRoom(
      SocketUser.user.id,
      gameRoomId,
    );

    if (rejoin === true) {
      client.join('GameRoom-' + gameRoomId);
      this.wss.to('GameRoom-' + gameRoomId).emit('rejoin');
    }
  }

  @SubscribeMessage('refuseInvite')
  async refuseInvite(
    client: Socket,
    message: { gameRoomId: string; invitingFriendId: number },
  ) {
    const socketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    const invitingSocketUser: Socket =
      await this.authService.getSocketFromUserId(
        this.wss,
        message.invitingFriendId,
      );

    if (!invitingSocketUser || socketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    invitingSocketUser.emit('invitationRefused', socketUser.user.username);
    this.pongService.deleteGame(message.gameRoomId);
  }

  @SubscribeMessage('queueMatchmaking')
  async queueMatchmaking(client: Socket) {
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' }

    this.pongService.queueMatchmaking(client, SocketUser.user.id)
  }

  @SubscribeMessage('startCountdown')
  async startCountdown(client: Socket, gameRoomId: string) {
    let counter = 5;

    this.wss.to('GameRoom-' + gameRoomId).emit('updateCounter', counter);
    const interval = setInterval(() => {
      counter--;
      if (this.pongService.gameIsOver(gameRoomId) === true) {
        clearInterval(interval);
        return;
      }
      this.wss.to('GameRoom-' + gameRoomId).emit('updateCounter', counter);
      if (counter === 0) {
        clearInterval(interval);
        this.startGame(client, gameRoomId);
      }
    }, 1000);
  }

  @SubscribeMessage('getStreamingGameRoomProps')
  async getStreamingGameRoomProps(client: Socket, streamUserId: number) {
    const props: IPlayerRoom =
      this.pongService.getStreamingGameRoomProps(streamUserId);
    if (!props) return { status: 404, message: 'Streaming room not found' };
    client.emit('streamingGameRoomProps', props);
    return { status: 200 };
  }

  @SubscribeMessage('getGameRoomMap')
  async getGameRoomProps(client: Socket, gameRoomId: string) {
    const map: string = this.pongService.getGameRoomMap(gameRoomId);
    if (!map) return { status: 404, message: 'Game room not found' };
    client.emit('gameRoomMap', { map: map, gameRoomId: gameRoomId });
  }

  @SubscribeMessage('startGame')
  async startGame(client: Socket, gameRoomId: string) {
    this.pongService.startGame(gameRoomId);
  }

  @SubscribeMessage('keydown')
  async keydown(
    client: Socket,
    message: { userId: number; gameRoomId: string; keyCode: number },
  ) {
    this.pongService.handleKeydown(
      message.userId,
      message.gameRoomId,
      message.keyCode,
    );
  }

  @SubscribeMessage('keyup')
  async keyup(
    client: Socket,
    message: { userId: number; gameRoomId: string; keyCode: number },
  ) {
    this.pongService.handleKeyup(
      message.userId,
      message.gameRoomId,
      message.keyCode,
    );
  }

  @SubscribeMessage('getWaitingList')
  async getWaitinglist(client: Socket) {
    client.emit('updateWaitingList', this.pongService.getWaitingList());
  }

  @SubscribeMessage('getPlayingList')
  async getPlayinglist(client: Socket) {
    client.emit('updatePlayingList', this.pongService.getPlayingList());
  }

  @SubscribeMessage('playerLostFocus')
  async playerLostFocus(client: Socket, gameRoomId: string) {
    console.log('playerLostFocus');
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    this.pongService.setAllKeysup(SocketUser.user.id, gameRoomId);
  }

  @SubscribeMessage('getPlayerOne')
  async getPlayerOne(client: Socket, gameRoomId: string) {
    const playerOneId: number =
      this.pongService.getPlayersId(gameRoomId)?.playerOne;
    if (!playerOneId) return { status: 404, message: 'Cannot find player one' };

    const playerOne = await this.usersService.findOneById(playerOneId);
    if (!playerOne) return { status: 404, message: 'Could not find user one' };
    client.emit('playerOne', playerOne);
  }

  @SubscribeMessage('getPlayerTwo')
  async getPlayerTwo(client: Socket, gameRoomId: string) {
    const playerTwoId: number =
      this.pongService.getPlayersId(gameRoomId)?.playerTwo;
    if (!playerTwoId) return { status: 404, message: 'Cannot find player two' };

    const playerTwo = await this.usersService.findOneById(playerTwoId);
    if (!playerTwo) return { status: 404, message: 'Could not find user two' };
    client.emit('playerTwo', playerTwo);
  }

  @SubscribeMessage('getPlayerStatus')
  async getPlayerStatus(client: Socket, userId: number) {
    const ret = this.pongService.getPlayerStatus(userId);

    if (ret.status === 'User is not playing') {
      console.log('user is not playing');
    } else if (ret.status === 'User is playing and active') {
      console.log('user is playing and active');
      // player should not be able to start a new game
      client.emit('userIsPlaying', {
        gameRoomId: ret.gameRoomId,
        map: ret.map,
      });
    } else if (ret.status === 'User is playing and inactive') {
      console.log('user is playing and inactive');
      // player should be able to join his game again if the game is still playing
      client.emit('userIsPlaying', {
        gameRoomId: ret.gameRoomId,
        map: ret.map,
      }); // should send back gameRoomId and map name
    }
  }

  @SubscribeMessage('addSpectator')
  async addSpectator(client: Socket, gameRoomId: string) {
    const SocketUser = await this.authService.getUserFromSocket(
      client,
      this.usersService,
    );
    if (SocketUser.expired)
      return { status: 404, message: 'Socket User not recognized' };

    this.pongService.addSpectator(SocketUser.user, gameRoomId);
    client.join('GameRoom-' + gameRoomId);
  }

  @SubscribeMessage('gameOver')
  async gameOver(client: Socket, gameRoomId: string) {
    this.pongService.deleteGame(gameRoomId);
    this.wss.emit('getUsersNotify');
  }

  @SubscribeMessage('gameStatus')
  async gameStatus(client: Socket, gameRoomId: string) {
    if (this.pongService.gameIsRunning(gameRoomId)) 
      client.emit('gameStarts')
  }

  @SubscribeMessage('getBallDirection')
  async getBallDirection(client: Socket, gameRoomId: string) {
    this.pongService.getBallDirection(client, gameRoomId)
  }
}
