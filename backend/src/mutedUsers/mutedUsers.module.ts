import { Module } from '@nestjs/common';
import { MutedUsersService } from './mutedUsers.service';
import { UserEntity } from '../users/entities/user.entity'
import { UsersController } from '../users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from '../channels/entities/channel.entity';
import { ChannelsModule } from '../channels/channels.module';
import { MutedUserEntity } from './entities/mutedUser.entity';
import { UsersModule } from '../users/users.module';



@Module({
  imports: [
    ChannelsModule,
    UsersModule,
    TypeOrmModule.forFeature([MutedUserEntity, UserEntity, ChannelEntity])
  ],
  controllers: [UsersController],
  providers: [MutedUsersService],
  exports: [MutedUsersService]
})
export class MutedUserModule { }
