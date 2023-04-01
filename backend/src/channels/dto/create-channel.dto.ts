import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../users/entities/user.entity";
import {
	IsString,
	IsOptional,
	MaxLength,
	IsNotEmpty,
} from "class-validator";
import { ChannelType } from "../entities/channel.entity"

export class CreateChannelDto {

	@ApiProperty()
	@IsString()
	@MaxLength(50)
	@IsNotEmpty({ message: 'The channel should have a type' })
	type: ChannelType;

	@ApiProperty()
	@IsString()
	@MaxLength(50)
	@IsNotEmpty({ message: 'The channel should have a name' })
	name: string;

	@ApiProperty()
	@Type(() => UserEntity)
	@IsNotEmpty({ message: 'The channel should have an owner' })
	owner: UserEntity;

	@ApiProperty()
	@IsOptional()
	@MaxLength(100)
	@IsString()
	password?: string | null;
}
