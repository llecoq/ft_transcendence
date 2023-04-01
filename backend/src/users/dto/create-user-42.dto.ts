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

export class CreateUserWith42Dto {

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@IsNotEmpty({ message: 'The user should have a 42ID' })
	fortytwoId: number;

	@ApiProperty()
	@IsString()
	@MaxLength(50)
	@IsNotEmpty({ message: 'The user should have a username' })
	username: string;

	@ApiProperty()
	@IsString()
	@IsEmail()
	@MaxLength(50)
	@Contains("@student.42")
	email: string;

	@ApiProperty()
	@IsString()
	@MaxLength(150)
	@IsNotEmpty()
	avatar: string;

	@ApiProperty()
	@IsBoolean()
	is2FAactive: boolean;
}

