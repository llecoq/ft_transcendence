import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Friendship } from './entities/friendship.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Friendship])
  ],
  providers: [FriendshipService],
  exports: [FriendshipService]
})
export class FriendshipModule { }
