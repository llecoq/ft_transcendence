import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import {
  IsString,
  IsInt,
  IsDate,
  IsNotEmpty
} from "class-validator";
import { ChannelEntity } from '../../channels/entities/channel.entity';

@Entity({ name: 'mutedUsers' })
export class MutedUserEntity {

  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @ManyToOne(() => ChannelEntity, (channel) => channel.id)
  channel: ChannelEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  @IsDate()
  until: Date;
}