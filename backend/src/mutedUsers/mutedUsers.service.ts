import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MutedUserEntity } from './entities/mutedUser.entity';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ChannelEntity } from 'src/channels/entities/channel.entity';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class MutedUsersService {
  constructor(
    private readonly channelsService: ChannelsService,
    @InjectRepository(MutedUserEntity)
    private mutedUsersRepository: Repository<MutedUserEntity>,
  ) {
  }

  async unmuteUserFromChannel(user: UserEntity, channel: ChannelEntity) {
    let mymutes = await this.mutedUsersRepository.find({ where : {user : user}, relations : ["channel"]})
    mymutes = mymutes.filter(mute => mute.channel.id = channel.id)
    if (mymutes)
      await this.mutedUsersRepository.remove(mymutes);
  }

  async muteUserFromChannel(user: UserEntity, channel: ChannelEntity, duration: number) {
    let until = new Date(Date.now() + 60 * 1000 * duration); //duration = nb of minutes ban
    const newMutedUser = await this.mutedUsersRepository.create({
      until,
      channel,
      user
    });
    await this.mutedUsersRepository.save(newMutedUser);
    return newMutedUser;
  }

  async isUserMute(user: UserEntity, channel: ChannelEntity) {
    const res = channel.mutedUsers.slice().reverse().find((mutedUser => mutedUser.user.id == user.id))//take last mute
    if (res && new Date(res.until) >= new Date(Date.now()))
      return { bool: true, until: res.until }
    else
      return { bool: false };
  }

  async getAllMutedUsers() {
    return this.mutedUsersRepository.find({
      relations: ['author']
    });
  }

}