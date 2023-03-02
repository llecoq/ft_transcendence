import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import {
	IsString,
	IsOptional,
	IsBoolean,
	Contains,
	IsEmail,
	MaxLength,
	IsNotEmpty,
	IsInt
} from "class-validator";

export class CreateUserWithFormDto {

	@ApiProperty()
	@IsString()
	@MaxLength(50)
	@IsNotEmpty({ message: 'The user should have a username' })
	username: string;

	@ApiProperty()
	@IsString()
	@MaxLength(100)
	@IsNotEmpty({ message: 'The user should have a password' })
	password: string;

	@ApiProperty()
	@IsString()
	@IsEmail()
	@MaxLength(50)
	email: string;

	@ApiProperty()
	@IsBoolean()
	is2FAactive: boolean;

}
