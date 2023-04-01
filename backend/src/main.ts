import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { configService } from './config/config.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/transcendence.key', 'utf8'),
    cert: fs.readFileSync('./certs/transcendence.crt', 'utf8'),
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });
  app.enableCors(({
    origin: configService.getDomainName(),
    methods: "GET,PUT,POST,DELETE,PATCH",
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 204
  }))

  //Allow the use of class-validator and class-tranformer in DTOs
  app.useGlobalPipes(new ValidationPipe());

  //------------Swagger------------- 
  /*const config = new DocumentBuilder()
    .setTitle('Users')
    .setDescription('The Users API description')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  //Be careful to set the path right ! Here '/'
  SwaggerModule.setup('/', app, document);*/
  //----------Swagger-------------

  //To access Avatar pics
  app.useStaticAssets(join(__dirname, '..', 'publics/uploads/profileImages'), {
    prefix: '/publics/uploads/profileImages/'
  });

  await app.listen(8080);
}
bootstrap();