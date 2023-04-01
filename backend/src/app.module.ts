import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { configService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { UserEntity } from './users/entities/user.entity';
import { MutedUserModule } from './mutedUsers/mutedUsers.module';
import { BannedUserModule } from './bannedUsers/bannedUsers.module';
import { FriendshipModule } from './friendship/friendship.module';
import { PongModule } from './pong/pong.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/two-factor-authentication.module';
import { MatchModule } from './pong/match/match.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    AuthModule,
    ChannelsModule,
    MessagesModule,
    MutedUserModule,
    BannedUserModule,
    UsersModule,
    FriendshipModule,
    PongModule,
    TwoFactorAuthenticationModule,
    MatchModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AppGateway],
})
export class AppModule { }
