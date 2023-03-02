import { Module } from '@nestjs/common';
import { BannedUsersService } from './bannedUsers.service';
import { UserEntity } from '../users/entities/user.entity'
import { UsersController } from '../users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from '../channels/entities/channel.entity';
import { ChannelsModule } from '../channels/channels.module';
import { BannedUserEntity } from './entities/bannedUser.entity';
import { UsersModule } from '../users/users.module';



@Module({
  imports: [
    ChannelsModule,
    UsersModule,
    TypeOrmModule.forFeature([BannedUserEntity, UserEntity, ChannelEntity])
  ],
  controllers: [UsersController],
  providers: [BannedUsersService],
  exports: [BannedUsersService]
})
export class BannedUserModule { }
