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

export class TwoFactorAuthenticationCodeDto {

	@ApiProperty()
	@IsString()
	twoFactorAuthenticationCode: string;

}
