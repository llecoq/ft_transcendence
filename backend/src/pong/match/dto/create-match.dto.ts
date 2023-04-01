import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../../users/entities/user.entity";
import {
	IsString,
	MaxLength,
	IsNotEmpty,
	IsInt,
    Min
} from "class-validator";

export class CreateMatchDto {

    @ApiProperty()
	@Type(() => UserEntity)
	@IsNotEmpty({ message: 'The match should have a home user' })
	userHome: UserEntity;

	@ApiProperty()
	@Type(() => UserEntity)
	@IsNotEmpty({ message: 'The match should have an foreign user' })
	userForeign: UserEntity;

	@ApiProperty()
	@IsInt()
	@IsNotEmpty({ message: 'The match should have a winner user' })
	winner: number;

	@ApiProperty()
	@IsString()
	@MaxLength(50)
	@IsNotEmpty({ message: 'The channel should have a map' })
	map: string;

	@ApiProperty()
	@IsInt()
    @Min(0)
    @IsNotEmpty({ message: 'the match should have a home user score'})
	userHomeScore: number;

	@ApiProperty()
	@IsInt()
    @Min(0)
    @IsNotEmpty({ message: 'the match should have a foreign user score'})
	userForeignScore: number;

}
