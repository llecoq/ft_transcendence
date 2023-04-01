import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelEntity, ChannelType } from './entities/channel.entity';
import { UserEntity } from '../users/entities/user.entity';
import { In, Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
const bcrypt = require('bcrypt');

@Injectable()
export class ChannelsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ChannelEntity)
    private channelsRepository: Repository<ChannelEntity>,
  ) {
  }

  async createChannel(name: string, owner: UserEntity, type: string, usersList: number[], password: string) {
    if (type == "direct") {
      let existingChannel = await this.findAllChannelsInWhichUserIs(owner);
      existingChannel = existingChannel.filter(channel => channel.type == "direct")
      existingChannel = existingChannel.filter(channel => channel.users.find(userSearch => userSearch.id == usersList[0]));
      if (existingChannel[0])
        return existingChannel[0];
    }
    const saltRounds = 10;
    if (password != "")
      password = bcrypt.hashSync(password, saltRounds);
    const users = await this.usersService.findAllWithIdInAarrayofIds(usersList);// getting all the users entities of the users that will be in the conversation
    users.push(owner);
    const newChannel = await this.channelsRepository.create({
      name: name,
      type: type,
      owner: owner,
      password: password,
      users: users
    });
    await this.channelsRepository.save(newChannel);
    return newChannel;
  }

  async changeChannelName(channelName: string, channel: ChannelEntity) {
    return this.channelsRepository.save({
      id: channel.id,
      name: channelName
    });;
  }

  async changeChannelType(channelType: string, channelPassword: string, channel: ChannelEntity) {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(channelPassword, saltRounds);
    return this.channelsRepository.save({
      id: channel.id,
      type: channelType,
      password: hashedPassword
    });
  }

  async removeUserFromChannel(userId: number, channel: ChannelEntity) {
    if (channel.users.find(userSearch => userId == userSearch.id))
      channel.users = channel.users.filter(userSearch => userId != userSearch.id);
    return this.channelsRepository.save({
      id: channel.id,
      users: channel.users
    });
  }


  async setUnsetChannelAdmin(userId: number, channel: ChannelEntity) {
    if (channel.adminUsers.find(userSearch => userId == userSearch.id))
      channel.adminUsers = channel.adminUsers.filter(userSearch => userId != userSearch.id);
    else {
      let user = await this.usersService.findOneById(userId);
      channel.adminUsers.push(user);
    }
    return this.channelsRepository.save({
      id: channel.id,
      adminUsers: channel.adminUsers
    });;
  }



  async findOneById(id: number): Promise<ChannelEntity> {
    try {
      const user = await this.channelsRepository.findOneOrFail({
        where: { id: id },
        relations: ['users', 'owner', 'adminUsers', 'users.usersWhoBlockedMe', 'mutedUsers', 'mutedUsers.user', 'bannedUsers', 'bannedUsers.user'],
        select: {
          password: false
        }
      });
      return user;
    } catch (error) {
      return null;
    }
    return;
  }

  async getMessagesFromChannel(user: UserEntity, channelId: number, password: string | null): Promise<ChannelEntity> {
    try {
      var res = await this.channelsRepository.findOneOrFail({
        where: { id: channelId },
        relations: ['users', 'owner', 'messages', 'messages.author', 'users.blockedUsers', 'users.usersWhoBlockedMe', 'adminUsers', 'mutedUsers', 'mutedUsers.user', 'bannedUsers', 'bannedUsers.user'],
        select: {
          password: false
        }
      });
    } catch (error) {
      return null;
    }
    if (res.type == "protected" && (!password || !bcrypt.compareSync(password, res.password)))
      return null;
    if (res.users.find(userSearch => userSearch.id == user.id))
      return res;
    return null;
  }

  async findAllChannelsInWhichUserIs(user: UserEntity) {
    let res = await this.findAll(user.id);
    res = res.filter(channel => channel.users.find(userSearch => userSearch.id == user.id));
    res = res.filter(channel => channel.type != "direct" || !user.blockedUsers.find(userBlocked => channel.users.find(userSearch => userSearch.id == userBlocked.id)))
    return res;
  }

  async findAllPublicChannels() {
		let myPublicChannels = await this.channelsRepository
    .createQueryBuilder('channel')
    .select(['channel.id', 'channel.name', 'channel.type', 'channel.createDateTime'])
    .where('channel.type = :channelType', {channelType: "public"})
    
    .leftJoin('channel.users', 'users')
    .addSelect(['users.id', 'users.username', 'users.avatar', 'users.xp'])

    .leftJoin('channel.owner', 'owner')
    .addSelect(['owner.id'])

    .leftJoin('channel.messages', 'messages')
    .leftJoin('messages.author', 'author')
    .addSelect(['messages.id', 'messages.content', 'messages.createDateTime', 'author.username', 'author.avatar', 'author.id'])
    .orderBy('messages.createDateTime', 'ASC')

    .leftJoin('channel.adminUsers', 'adminUsers')
    .addSelect(['adminUsers.id'])

    .leftJoin('channel.mutedUsers', 'mutedUsers')
    .leftJoin('mutedUsers.user', 'mutUser')
    .addSelect(['mutedUsers.until', 'mutUser.id'])

    .leftJoin('channel.bannedUsers', 'bannedUsers')
    .leftJoin('bannedUsers.user', 'banUser')
    .addSelect(['bannedUsers.until', 'banUser.id'])
    .getMany();

    return myPublicChannels
  }

	// si tu peux checker en arrivant que tu mets bien pour 
	// chaque user de chaque channel les user qu’il a bloqué dans userblocked 
	// c’est top merci (besoin juste de l’id)
  async findAll(userId: number) {

    let myChannels = await this.channelsRepository
    .createQueryBuilder('channel')
    .select(['channel.id', 'channel.name', 'channel.type', 'channel.createDateTime'])
    
    .leftJoin('channel.users', 'users')
    .addSelect(['users.id', 'users.username', 'users.avatar', 'users.xp'])

		.leftJoin('users.blockedUsers', 'blockedUsers')
		.addSelect('blockedUsers.id')

    .leftJoin('channel.owner', 'owner')
    .addSelect(['owner.id'])

    .leftJoin('channel.messages', 'messages')
    .leftJoin('messages.author', 'author')
    .addSelect(['messages.id', 'messages.content', 'messages.createDateTime', 'author.username', 'author.avatar', 'author.id'])
    .orderBy('messages.createDateTime', 'ASC')

    .leftJoin('channel.adminUsers', 'adminUsers')
    .addSelect(['adminUsers.id'])

    .leftJoin('channel.mutedUsers', 'mutedUsers')
    .leftJoin('mutedUsers.user', 'mutUser')
    .addSelect(['mutedUsers.until', 'mutUser.id'])

    .leftJoin('channel.bannedUsers', 'bannedUsers')
    .leftJoin('bannedUsers.user', 'banUser')
    .addSelect(['bannedUsers.until', 'banUser.id'])
    .getMany();
		
    return myChannels;
  }

  async joinPublicChannel(user: UserEntity, channel: ChannelEntity) {
    if (!channel.users.find(userSearch => user.id == userSearch.id))
      channel.users.push(user);
    return this.channelsRepository.save({
      id: channel.id,
      users: channel.users
    });
  }

  async addUsersToChannel(users: UserEntity [], channel: ChannelEntity) {
    users= users.filter(user => !channel.users.find(userSearch => user.id == userSearch.id))
    channel.users = channel.users.concat(users);
    this.channelsRepository.save({
      id: channel.id,
      users: channel.users
    });
    return users;
  }
}