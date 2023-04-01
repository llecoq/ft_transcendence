import { PartialType } from '@nestjs/mapped-types';
import { CreateUserWithFormDto } from './create-user-form.dto';

export class UpdateUserDto extends PartialType(CreateUserWithFormDto) { }