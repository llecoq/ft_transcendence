import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';
import { UserEntity } from '../../../users/entities/user.entity';

import {
  IsString,
  IsDate,
  IsInt,
  Min
} from "class-validator";

@Entity({ name: 'matches' })
export class MatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => UserEntity, (user) => user.matchesHome)
  userHome: UserEntity;

  @ManyToOne((type) => UserEntity, (user) => user.matchesForeign)
  userForeign: UserEntity;

  @ManyToOne((type) => UserEntity, (user) => user.id)
  winner: number;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  map: string;

  @Column({ default: 0 }) 
  @Min(0)
  @IsInt()
  userHomeScore: number;

  @Column({ default: 0 }) 
  @Min(0)
  @IsInt()
  userForeignScore: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  createDateTime: Date;

}