import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { Response} from 'express';


@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthService
  ) {}
 
  @Post('generate') //New QR Code
  async register(@Res() response: Response, @Query('userToken') userToken: string) {
    const SocketUser = await this.usersService.getUserFromToken(userToken.replace("Bearer ", ''));
    if (!SocketUser)
    	return { status: 404, message: "Socket User not recognized" };

    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(SocketUser);
    return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
  }

}