import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { CreateUserWithFormDto } from '../users/dto/create-user-form.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  //endpoint for getting authentified using 42 API : /auth/42auth
  //Param : code is the temporary token you received from filling the 42 login form
  //Result : data contains the data given by 42 and status is the result status 403 meaning unauthorized access and 200 success
  @Get('/42auth')
  async getAccessTokenThenUserData(@Query('code') code: string): Promise<{ data: string; status: number; }> {
    return this.authService.getUserData(code);
  }

  @Post('/formRegister')
  createWithForm(@Body() createUserDto: CreateUserWithFormDto) {
    return this.authService.registerFormUser(createUserDto.password, createUserDto.email, createUserDto.username);
  }

  @Post('/formLogin')
  loginUser(@Body() loggedInUser: { password: string, email: string }) {
    return this.authService.loginFormUser(loggedInUser.password, loggedInUser.email);
  }
}
