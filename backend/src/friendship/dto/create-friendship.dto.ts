import { UserEntity } from '../../users/entities/user.entity';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateFriendshipDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'To create a friendship you need to specify the user',
  })
  user: UserEntity;

  @ApiProperty()
  @IsNotEmpty({
    message: 'To create a friendship you need to specify the friend',
  })
  friend: UserEntity;
}
