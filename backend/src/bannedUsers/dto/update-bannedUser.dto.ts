import { PartialType } from '@nestjs/mapped-types';
import { CreateBannedUserDto } from './create-bannedUser.dto';

export class UpdateBannedUserDtoeDto extends PartialType(CreateBannedUserDto) { }