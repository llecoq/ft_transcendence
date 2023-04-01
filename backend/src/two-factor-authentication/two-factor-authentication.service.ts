import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { toFileStream } from 'qrcode';
import { Response} from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  public async generateTwoFactorAuthenticationSecret(user: UserEntity) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
    return {
      secret,
      otpauthUrl,
    };
  }

  public async getQrURL(user: UserEntity) {
    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      user.secretOf2FA,
    );

    return otpauthUrl;
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: UserEntity,
  ) {
      return authenticator.verify({
        token: twoFactorAuthenticationCode,
        secret: user.secretOf2FA,
      });
    }
}
