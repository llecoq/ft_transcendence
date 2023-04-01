import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../users/entities/user.entity";
import {
	IsString,
	IsNotEmpty,
	MaxLength
} from "class-validator";
import { ChannelEntity } from 'src/channels/entities/channel.entity';

export class CreateMessageDto {

	@ApiProperty()
	@IsString()
	@MaxLength(150)
	@IsNotEmpty({ message: 'The message should have a content' })
	content: string;

	@ApiProperty()
	@Type(() => UserEntity)
	@IsNotEmpty({ message: 'The message should have an author' })
	author: UserEntity;

	@ApiProperty()
	@Type(() => ChannelEntity)
	@IsNotEmpty({ message: 'The message should have a channel' })
	channel: ChannelEntity;
}