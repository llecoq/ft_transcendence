import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedUserEntity } from './entities/bannedUser.entity';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ChannelEntity } from 'src/channels/entities/channel.entity';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class BannedUsersService {
  constructor(
    private readonly channelsService: ChannelsService,
    @InjectRepository(BannedUserEntity)
    private bannedUsersRepository: Repository<BannedUserEntity>,
  ) {
  }

  async banUserFromChannel(user: UserEntity, channel: ChannelEntity, duration: number) {
    let until = new Date(Date.now() + 60 * 1000 * duration); //duration = nb of minutes ban
    const newBannedUser = await this.bannedUsersRepository.create({
      until,
      channel,
      user
    });
    await this.bannedUsersRepository.save(newBannedUser);
    return newBannedUser;
  }

  async unbanUserFromChannel(user: UserEntity, channel: ChannelEntity,) {
    let mybans = await this.bannedUsersRepository.find({ where : {user : user}, relations : ["channel"]})
    mybans = mybans.filter(ban => ban.channel.id = channel.id)
    if (mybans)
      await this.bannedUsersRepository.remove(mybans);
  }



  isUserBanned(user: UserEntity, channel: ChannelEntity) {
    const res = channel.bannedUsers?.slice().reverse().find((bannedUser => bannedUser.user.id == user.id))//take last ban
    if (res && new Date(res.until) >= new Date(Date.now()))
      return true
    else
      return false;
  }

  async getAllBannedUsers() {
    return this.bannedUsersRepository.find({
      relations: ['author']
    });
  }

}