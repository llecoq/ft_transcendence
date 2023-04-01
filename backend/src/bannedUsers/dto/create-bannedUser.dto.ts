import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../users/entities/user.entity";
import {
	IsNotEmpty,
	IsDate
} from "class-validator";
import { ChannelEntity } from 'src/channels/entities/channel.entity';
//represent the fieldd we want the client to feed in when they request creating a user
//if someone adds extra fields, they will not be passed on to our CreateUserDto instance
//if someone adds WRONG data, ex : number instead of string, an HTTP Error will be returned to us
//class-validator && class-transformer : https://github.com/typestack/class-validator#validation-decorators
export class CreateBannedUserDto {
	//no need for ID since we receive it from request parameters 
	//tried to use the CLI plugin to not have to specify ApiProperty each time
	//but was causing issue when doing nest start and does not work with
	//npm run start:dev

	@ApiProperty()
	@Type(() => UserEntity)
	@IsNotEmpty({ message: 'The muted channel should have a user' })
	user: UserEntity;

	@ApiProperty()
	@Type(() => ChannelEntity)
	@IsNotEmpty({ message: 'The muted user should have a channel' })
	channel: ChannelEntity;

	@ApiProperty()
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty({ message: 'There must be an end ban date' })
	until: Date;
}