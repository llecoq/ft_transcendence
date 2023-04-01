import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { MatchModule } from './match/match.module';

@Module({
  providers: [PongService],
  exports: [PongService],
  imports: [MatchModule]
})
export class PongModule {}
