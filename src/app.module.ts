import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { KnexModule } from 'nest-knexjs';
import appConfig from './config/app.config';
import sqlConfig from './config/sql.config';
import redisConfig from './config/redis.config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import cookieConfig from './config/cookie.config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { RedisOptions } from 'ioredis';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appConfig, cookieConfig, sqlConfig, redisConfig],
    }),
    LoggerModule.forRoot(),
    EventEmitterModule.forRoot(),
    RedisModule,
    CacheModule.registerAsync<RedisOptions>({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('redis.host');
        const port = config.get<number>('redis.port');
        const db = config.get<number>('redis.db');
        const password = config.get<string>('redis.password');

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv({
              url: `redis://${host}:${port}/${db}`,
              password,
            }),
          ],
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    KnexModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        config: {
          client: config.get<string>('sql.driver'),
          connection: {
            host: config.get<string>('sql.host'),
            port: config.get<number>('sql.port'),
            user: config.get<string>('sql.username'),
            password: config.get<string>('sql.password'),
            database: config.get<string>('sql.name'),
          },
          migrations: {
            directory: path.join(
              __dirname,
              'src',
              'database',
              'knex',
              'migrations',
            ),
            extension: 'ts',
          },
          seeds: {
            directory: path.join(__dirname, 'src', 'database', 'knex', 'seeds'),
            extension: 'ts',
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redis: RedisService) => ({
        createClient: () => redis.getClient(),
      }),
      inject: [RedisService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(
        helmet(),
        cookieParser(this.config.get('app.secret')),
        CsrfMiddleware,
      )
      .forRoutes('*');
  }
}
