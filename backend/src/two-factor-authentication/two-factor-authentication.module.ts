import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
  ],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}
