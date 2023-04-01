import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ChannelEntity } from 'src/channels/entities/channel.entity';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly channelsService: ChannelsService,
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>,
  ) {
  }

  async createMessage(content: string, author: UserEntity, channel: ChannelEntity) {
    const newMessage = await this.messagesRepository.create({
      content,
      channel,
      author
    });
    await this.messagesRepository.save(newMessage);
    return newMessage;
  }

  async getAllMessages() {
    return this.messagesRepository.find({
      relations: ['author']
    });
  }

}