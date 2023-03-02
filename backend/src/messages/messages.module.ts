import { Module } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { MessageEntity } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from "../users/entities/user.entity";
import { ChannelsModule } from "../channels/channels.module";

@Module({
    imports: [
        ChannelsModule,
        TypeOrmModule.forFeature([MessageEntity, UserEntity])
    ],
    exports: [MessagesService],
    providers: [MessagesService]
})
export class MessagesModule { }

