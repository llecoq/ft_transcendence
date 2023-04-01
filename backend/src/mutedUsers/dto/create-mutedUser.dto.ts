import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../users/entities/user.entity";
import {
	IsString,
	IsNotEmpty,
	IsInt,
	isDate,
	MaxLength,
	IsDate
} from "class-validator";
import { ChannelEntity } from 'src/channels/entities/channel.entity';

export class CreateMutedUserDto {

	@ApiProperty()
	@Type(() => UserEntity)
	@IsNotEmpty({ message: 'The banned channel should have a user' })
	user: UserEntity;

	@ApiProperty()
	@Type(() => ChannelEntity)
	@IsNotEmpty({ message: 'The banned user should have a channel' })
	channel: ChannelEntity;

	@ApiProperty()
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty({ message: 'There must be an end ban date' })
	until: Date;

}