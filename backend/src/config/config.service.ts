import { TypeOrmModuleOptions } from '@nestjs/typeorm';

require('dotenv').config();

class ConfigService {

  constructor(private env: { [k: string]: string | undefined }) { }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('FRONT_PORT', true);
  }

  public getDomainName() {
    return this.getValue('FRONT_URL', true);
  }

	public getBackURL() {
    return this.getValue('BACK_URL', true);
  }

  public getUri() {
    return (this.getDomainName() + ":" + this.getPort());
  }

  public getJWTSecretKey() {
    return this.getValue('JWT_SECRET', true);
  }

  public get42APIPublicKey() {
    return this.getValue('42_API_PUBLIC_KEY', true);
  }

  public get42APIPrivateKey() {
    return this.getValue('42_API_PRIVATE_KEY', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }


  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
			type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
			entities: [this.isProduction() ? "dist/**/*.entity.js" : '**/*.entity{.ts,.js}'],
      ssl: false,
      synchronize: true, //Type orm reads classes and creates tables and columns
    };
  }

}

const configService = new ConfigService(process.env)
  .ensureValues([
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE'
  ]);

export { configService };