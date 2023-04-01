import { Module } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { UsersModule } from '../users/users.module';
import { ChannelEntity } from './entities/channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([ChannelEntity])
    ],
    exports: [ChannelsService],
    providers: [ChannelsService]
})
export class ChannelsModule { }

