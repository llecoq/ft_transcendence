import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import {
  IsString,
  IsInt,
  IsDate
} from "class-validator";
import { ChannelEntity } from '../../channels/entities/channel.entity';

@Entity({ name: 'messages' })
export class MessageEntity {
  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  @IsString()
  content: string;

  @ManyToOne(() => UserEntity)
  author: UserEntity;

  @ManyToOne(() => ChannelEntity)
  channel: ChannelEntity;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  createDateTime: Date;
}