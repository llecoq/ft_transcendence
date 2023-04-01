import { Get, Injectable, Post } from "@nestjs/common";
const axios = require('axios');
import { configService } from '../config/config.service';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { UsersService } from "src/users/users.service";
const bcrypt = require('bcrypt');

const saltRounds = 10;
var jwt = require('jsonwebtoken');

//Every x hours, need to login again
const JWT_EXPIRES_IN = '2h';

export interface decodedToken {
  exp: number;
  iat: number;
  id: number;
}

@Injectable()
export class AuthService {

  //Function : returns ths 42 data by getting the data access token in exchange of the temporary token and then doing another get request for getting the user's data in exchange of the data accesss token
  //Param : temporaryToken is the temporary token you received from filling the 42 login form
  //Result : data contains the data given by 42 and status is the result status 403 meaning unauthorized access and 200 success
  async getUserData(temporaryToken: string): Promise<{ data: string; status: number; }> {
    let access_token: string;
    let userData;
    if (!temporaryToken)
      return { data: "Access Denied : Could not get access token. Temporary Code missing", status: 403 };
    await this.getAccessToken(temporaryToken).then((res) => (access_token = res));
    if (!access_token)
      return { data: "Access Denied : Could not get access token. Temporary Code might be wrong. 42 API not working.", status: 403 };
    let isFirstConnect = false;
     let response = await axios({
        method: "GET",
        url: "https://api.intra.42.fr/v2/me",
        headers: {
          authorization: `Bearer ${access_token}`,
          "content-type": "application/json",
        },
      })
        const user = { fortytwoId: response.data.id, username: response.data.login, email: response.data.email, avatar: response.data.image.link }
        try {
          console.log("check if user exists")
          response = await axios.get('https://localhost:8080/users/username/' + user.username);
          if (response.data && user.fortytwoId != response.data.fortytwoId)
          {
            return { data: "A user already exists with this username.", status: 404 };
          }
          response = await axios.get('https://localhost:8080/users/email/' + user.email);
          if (response.data && user.fortytwoId != response.data.fortytwoId) {
            return { data: "A user already exists with this email adress please login", status: 404 };
          }
          else if (!response.data) {
            console.log("User does not exist -> create user");
            try {
              response = await axios.post('https://localhost:8080/users/with42', { ...user, is2FAactive: false });
              isFirstConnect = true;
            } catch (err) {
              console.log("create new user error")
              console.log("Error while creating user : " + err.response.data.message[0])
              return { data: "Error while creating user : " + err.response.data.message[0], status: err.response.data.statusCode };
            }
          }
        } catch (err) {
          return { data: "Error while creating user:" + response.data.message[0], status: response.data.statusCode };
        }
        //accessToken is the token that is being used by socketIO to check if user is connected before sending him the socket's data
        //In the accessToken the id is stored and encrypted. We can put other sensitive data there
        const accessToken = jwt.sign(
          { id: response.data.id },
          configService.getJWTSecretKey(),
          { expiresIn: JWT_EXPIRES_IN }
        );
        userData = { username: response.data.username, email: response.data.email, avatar: response.data.avatar, xp: response.data.xp, is2FAactive: response.data.is2FAactive, accessToken, isFirstConnect };
    return { data: userData, status: 200 };
  }

  async registerFormUser(password: string, email: string, username: string) {
    let hashedPassword: string = bcrypt.hashSync(password, saltRounds);
    const user = { username, email, password: hashedPassword, is2FAactive: false }
    try {
      console.log("check if user exists")
      var response = await axios.get('https://localhost:8080/users/email/' + user.email);
      if (response.data)
        return { message: "A user already exists with this email adress please login", status: 404 };
      var response = await axios.get('https://localhost:8080/users/username/' + user.username);
      if (response.data)
        return { message: "A user already exists with this username please try another username", status: 404 };
      console.log("User does not exist -> create user");
      try {
        var response = await axios.post('https://localhost:8080/users/withForm', user);
      } catch (err) {
        return { message: "Error while creating user : " + err.response.data.message, status: err.response.data.statusCode };
      }
    } catch (err) {
        return { message: "Error while creating user : " + err.response.data.message, status: err.response.data.statusCode };
    }
    //accessToken is the token that is being used by socketIO to check if user is connected before sending him the socket's data
    //In the accessToken the id is stored and encrypted. We can put other sensitive data there
    const accessToken = jwt.sign(
      { id: response.data.id },
      configService.getJWTSecretKey(),
      { expiresIn: JWT_EXPIRES_IN }
    );
    if (!response.data.email)
      return { message: "Could not create user please try again", status: 404 };

    let userData = { username: response.data.username, email: response.data.email, avatar: response.data.avatar, xp: response.data.xp, accessToken };
    return { data: userData, status: 200 };
  }

  async loginFormUser(password: string, email: string) {
    const user = { email, password }
    try {
      var response = await axios.get('https://localhost:8080/users/email/' + user.email);
      if (!response.data)
        return { message: "User does not exist please fill out registration form", status: 404 };
      if (!bcrypt.compareSync(user.password, response.data.password)) {
        return {
          status: 400,
          message: 'Wrong Password'
        }
      }
    } catch (err) {
      return { message: "Error while checking password or existence of user :" + err, status: 404 };
    }
    //accessToken is the token that is being used by socketIO to check if user is connected before sending him the socket's data
    //In the accessToken the id is stored and encrypted. We can put other sensitive data there
    const accessToken = jwt.sign(
      { id: response.data.id },
      configService.getJWTSecretKey(),
      { expiresIn: JWT_EXPIRES_IN }
    );
    let userData = { username: response.data.username, email: response.data.email, avatar: response.data.avatar, xp: response.data.xp, is2FAactive: response.data.is2FAactive, accessToken };
    return { data: userData, status: 200 };
  }

  //Function : returns the data access token in exchange of the temporary token
  //Param : temporaryToken is the temporary token you received from filling the 42 login form
  //Result : string that contain the data access token
  async getAccessToken(temporaryToken: string): Promise<string> {
    console.log("getAccessToken")
    //client_id and client_secret are the API keys that we got after registering the app on the 42 API manager : Watch out the private key expires
    const payload = {
      grant_type: "authorization_code",
      client_id: configService.get42APIPublicKey(),
      client_secret: configService.get42APIPrivateKey(),
      redirect_uri: configService.getDomainName(),
      code: temporaryToken,
    };
    let ret: string;
    try {
      await axios({
        method: "post",
        url: "https://api.intra.42.fr/oauth/token",
        data: JSON.stringify(payload),
        headers: {
          "content-type": "application/json",
        },
      }).then(function (response) {
        ret = response.data.access_token;
      });
    }
    catch (error) {
      console.log("Identify with 42 error")
      return null;
    }
    return ret;
  }

  async getUserFromAuthenticationToken(accessToken: string, usersService: UsersService) {

  }

  public async getUserFromSocket(socket: Socket, usersService: UsersService) {
    const accessToken = socket.handshake.auth.accessToken;

    if (!accessToken)
      return;
    const currentTime = Date.now() / 1000;
    try {
      var payload: decodedToken = jwt.verify(accessToken, configService.getJWTSecretKey());
    }
    catch {
      console.log("user token expired");
      var payload2: decodedToken = jwt.decode(accessToken, configService.getJWTSecretKey());
      return ({ expired: true, user: await usersService.findOneById(payload2.id) });
    }
    if (payload.id && currentTime < payload.exp) {
      return ({ expired: false, user: await usersService.findOneById(payload.id) });
    }
    return ({ expired: true, user: null });
  }

  public async getSocketFromUserId(wss: any, userId: number): Promise<Socket> {
    let sockets = Array.from(await wss.sockets);
    var sock_res = null;
    sockets.forEach(socket => {
      let accessToken = (socket as any)[1].handshake.auth.accessToken;
      if (!accessToken)
        return null;
      var payload: decodedToken = jwt.verify(accessToken, configService.getJWTSecretKey());
      if (payload && payload.id == userId)
        sock_res = socket[1];
    })
    return sock_res;
  }

  public getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
    const payload = { userId, isSecondFactorAuthenticated };
    const token = jwt.sign(
      { payload },
      configService.getJWTSecretKey(),
      { expiresIn: JWT_EXPIRES_IN });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${JWT_EXPIRES_IN}`;
  }
}
