import { PartialType } from '@nestjs/mapped-types';
import { CreateUserWith42Dto } from './create-user-42.dto';

export class Update42UserDto extends PartialType(CreateUserWith42Dto) { }
