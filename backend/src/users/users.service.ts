import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ASYNC_METHOD_SUFFIX } from '@nestjs/common/module-utils/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserWith42Dto } from './dto/create-user-42.dto';
import { CreateUserWithFormDto } from './dto/create-user-form.dto';
import { Update42UserDto } from './dto/update-user-42.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import path = require('path');
import { Socket } from 'socket.io';
import { configService } from '../config/config.service';
import { decodedToken } from '../auth/auth.service';
import { unlink } from 'fs';

var jwt = require('jsonwebtoken');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>
  ) { }

  create(createUserDto: CreateUserWith42Dto | CreateUserWithFormDto): Promise<UserEntity> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersRepository.find({
      relations: ["blockedUsers", "usersWhoBlockedMe"],
      select: {
        password : false,
        secretOf2FA : false
      }
    });
    return users;
  }

  async findAllExceptOne(id: number): Promise<UserEntity[]> {
    const users = await this.usersRepository.find({
      relations: ["blockedUsers", "usersWhoBlockedMe"],
      select: {
        password : false,
        secretOf2FA : false
      }
    });
    return users.filter(user => user.id != id);
  }

  async findAllWithIdInAarrayofIds(usersIdList: number[]): Promise<UserEntity[]> {
    const users = await this.usersRepository.find({
      relations: ["blockedUsers", "usersWhoBlockedMe"],
      select: {
        password : false,
        secretOf2FA : false
      },
      where: { id: In(usersIdList) },
    });
    return users;
  }

  async findOneById(id: number): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneOrFail({
        where: { id: id },
        relations: ["blockedUsers", "usersWhoBlockedMe"],
        select: {
          password : false,
          secretOf2FA : false
        }
      });
      return user;
    } catch (error) {
      return null;
    }
    return;
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneOrFail({
        where: { email: email },
        select: {
          password : false,
          secretOf2FA : false
        }
      });
      return user;
    } catch (error) {
      return null;
    }
    return;
  }

  async findOneByUsername(username: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneOrFail({
        where: { username: username },
        select: {
          password : false,
          secretOf2FA : false
        }
      });
      return user;
    } catch (error) {
      return null;
    }
    return;
  }

  async blockOrUnBlockUser(userBlockedId: number, userBlockerId: number): Promise<boolean> {
    const blockerUser = await this.findOneById(userBlockerId);
    const blockedUser = await this.findOneById(userBlockedId);
    if (blockerUser.blockedUsers.find(blockedUser => blockedUser.id == userBlockedId)) {
      blockerUser.blockedUsers = blockerUser.blockedUsers.filter(blockedUser => blockedUser.id != userBlockedId)
      this.usersRepository.save({
				id: userBlockerId,
        blockedUsers: blockerUser.blockedUsers
      });
			return false; //unblocked a user
    }
    else {
			blockerUser.blockedUsers.push(blockedUser)
      this.usersRepository.save({
        id: userBlockerId,
        blockedUsers: blockerUser.blockedUsers
      });
			return true; //blocked a user
    }
  }

  async findBlockedStatus(me: UserEntity, user: UserEntity): Promise<Boolean> {
    const resp = await me.blockedUsers.find(blockedUser => blockedUser.id === user.id);
    if (!resp)
      return false;
    return true;
  }

  async findAllBlockedUsers(me: UserEntity): Promise<UserEntity[]> {
    return me.blockedUsers;
  }

  async update(id: number, updateProfileDto: UpdateUserDto | Update42UserDto): Promise<UserEntity> {
    const newUser = await this.usersRepository.create({ id, ...updateProfileDto });
    return this.usersRepository.save(newUser);
  }

  async remove(id: number): Promise<UserEntity> {
    const user = await this.findOneById(id);
    return this.usersRepository.remove(user);
  }


  //2FA =====================================
  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.usersRepository.update(userId, {
      secretOf2FA: secret
    });
  }

  async removeTwoFa(userId: number) {
    return this.usersRepository.update(userId, {
      secretOf2FA: null,
      is2FAactive: false
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.usersRepository.update(userId, {
      is2FAactive: true
    });
  }

  //XP =========================================
  async incrementXp(userId: number) {
    const user: UserEntity = await this.findOneById(userId)
    const xp: number = user.xp + 200

    return this.usersRepository.update(userId, {
      xp: xp
    })
  }

  async getUserStats(requestedUser: UserEntity) {
    const usersOrderedByXp = await this.usersRepository.find({
      select: {
        id: true,
        xp: true,
      },
      order: {
        xp: "DESC"
    }})
    const requestedUserRank = usersOrderedByXp.findIndex((user) => requestedUser.id === user.id) + 1;
    const userXp = (await this.findOneById(requestedUser.id)).xp;
    const statsData = {
      rank: requestedUserRank,
      xp: userXp,
      nbOfPlayers: usersOrderedByXp.length
    }
    return statsData;
  }

  async checkMagicNumber(type: string, buffer: Buffer) {
    if (type == 'image/jpg' || type == 'image/jpeg') {
        if (buffer.toString('hex').length < "ffd8ff".length)
          return false;
        if (buffer.toString('hex').substring(0, 6) == "ffd8ff")
          return true;
    }
    else if (type == 'image/png') {
        if (buffer.toString('hex').length < "89504e47".length)
            return false;
        if (buffer.toString('hex').substring(0, 8) == "89504e47")
          return true;
    }
    return false;
  }

  async updateAvatarUrl(id: number, avatarUrl: string)  {
    const user = await this.findOneById(id);
    const prevAvatar = user.avatar.replace(configService.getBackURL(), '');

    const res = await this.usersRepository.update(id, {avatar: avatarUrl});
    //delete old pic
    if (res.affected) {
      unlink(process.cwd() + prevAvatar, (err) => {
        if(err)
        return err;
      });
    }
    return res;
  }

  public async getUserFromToken(accessToken: string) {
    if (!accessToken)
      return;
    const currentTime = Date.now() / 1000;
    try {
      var payload: decodedToken = jwt.verify(accessToken, configService.getJWTSecretKey());
    }
    catch {
      console.log("user token expired");
      return;
    }
    if (payload.id && currentTime < payload.exp) {
      return this.findOneById(payload.id);
    }
    return;
  }
}