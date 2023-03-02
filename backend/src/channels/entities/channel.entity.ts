import { Column, ManyToMany, JoinTable, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { MutedUserEntity } from '../../mutedUsers/entities/mutedUser.entity';
import { BannedUserEntity } from '../../bannedUsers/entities/bannedUser.entity';

import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsInt
} from "class-validator";
import { MessageEntity } from '../../messages/entities/message.entity';

export enum ChannelType {
  PRIVATE = "private",
  PUBLIC = "public",
  DIRECT = "direct",
  PROTECTED = "protected"
}

@Entity({ name: 'channels' })
export class ChannelEntity {
  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @ManyToOne((type) => UserEntity, (user) => user.id)
  @Type(() => UserEntity)
  owner: UserEntity;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  name: string;

  @Column({
    type: "enum",
    enum: ChannelType,
  })
  type: string;


  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsString()
  password: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  createDateTime: Date;

  @OneToMany((type) => MessageEntity, (message) => message.channel)
  messages: MessageEntity[];

  @ManyToMany((type) => UserEntity, (user) => user.channels)
  @JoinTable({ name: 'channelsUsers' })
  users: UserEntity[];

  @ManyToMany((type) => UserEntity, (user) => user.channelsAdmin)
  @JoinTable({ name: 'channelsAdmins' })
  adminUsers: UserEntity[];

  @OneToMany((type) => MutedUserEntity, (user) => user.channel)
  mutedUsers: MutedUserEntity[];

  @OneToMany((type) => BannedUserEntity, (user) => user.channel)
  bannedUsers: BannedUserEntity[];

}

