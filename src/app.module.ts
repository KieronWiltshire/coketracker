import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { KnexModule } from 'nest-knexjs';
import appConfig from './config/app.config';
import sqlConfig from './config/sql.config';
import { LoggerModule } from 'nestjs-pino';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import cookieConfig from './config/cookie.config';
import { ScheduleModule } from '@nestjs/schedule';
import discordConfig from './config/discord.config';
import { DiscordModule } from './discord/discord.module';
import { CokeTrackerModule } from './coketracker/coketracker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appConfig, cookieConfig, sqlConfig, discordConfig],
    }),
    LoggerModule.forRoot(),
    KnexModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        config: {
          client: config.get<string>('sql.driver'),
          useNullAsDefault: true,
          connection: {
            host: config.get<string>('sql.host'),
            port: config.get<number>('sql.port'),
            user: config.get<string>('sql.username'),
            password: config.get<string>('sql.password'),
            database: config.get<string>('sql.name'),
            filename: config.get<string>('sql.filename'),
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
    ScheduleModule.forRoot(),
    CokeTrackerModule,
    DiscordModule,
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
