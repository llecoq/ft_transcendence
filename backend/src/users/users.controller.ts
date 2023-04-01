import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req, UploadedFile, UseInterceptors, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserWith42Dto } from './dto/create-user-42.dto';
import { CreateUserWithFormDto } from './dto/create-user-form.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { readFileSync, unlink } from 'fs';
import { multerOptions } from '../config/multerOptions';
import { Express, Request } from 'express';
import { configService } from '../config/config.service';
// This is a hack to make Multer available in the Express namespace
import { Multer } from 'multer';

@ApiTags('User controllers')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService) { }

  @Post('/with42')
  createWith42(@Body() createUserDto: CreateUserWith42Dto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/withForm')
  createWithForm(@Body() createUserDto: CreateUserWithFormDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // +id will converts the id to a number
  @Get(':id')
  findOneById(@Param('id') id: number) {
    return this.usersService.findOneById(+id);
  }

  @Get('/email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Get('/username/:username')
  findOneByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  // A PUT request should update the entire resource meanwhile a PATCH 
  //request can partially update a given resource
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }

  @Post('/changeAvatar/:userToken')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  public async uploadFile(@UploadedFile() image: Express.Multer.File, @Param('userToken') userToken: string ) {
    const SocketUser = await this.usersService.getUserFromToken(userToken.replace("Bearer ", ''));
    if (!SocketUser)
    	return { status: 404, message: "Socket User not recognized" };

    if (!image.filename) return { status: 400, message: 'Avatar change failed, file too big' };
    let buffer = readFileSync(process.cwd() + '/publics/uploads/profileImages/'+ image.filename)
    const res = await this.usersService.checkMagicNumber(image.mimetype, buffer);
    if (!res) {
      unlink(process.cwd() + '/publics/uploads/profileImages/'+ image.filename, (err) => {
        if(err)
        return err;
      });
      return { status: 400, message: 'Avatar change failed, file is not a jpg or png' };
    }

    const ret = this.usersService.updateAvatarUrl(SocketUser.id, `${configService.getBackURL()}/${image.path}`);
    return ret;
  }
}
