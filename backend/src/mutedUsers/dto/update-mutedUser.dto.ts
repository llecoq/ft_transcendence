import { PartialType } from '@nestjs/mapped-types';
import { CreateMutedUserDto } from './create-mutedUser.dto';

export class UpdateMutedUserDtoeDto extends PartialType(CreateMutedUserDto) { }
