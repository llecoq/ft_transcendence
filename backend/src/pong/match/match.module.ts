import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from '../../users/users.module';
import { MatchEntity } from './entities/match.entity';
import { MatchService } from './match.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([MatchEntity]),
  ],
  providers: [MatchService],
  exports: [MatchService]
})
export class MatchModule {}
