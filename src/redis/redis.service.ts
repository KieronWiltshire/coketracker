import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private redlock: Redlock;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      db: this.configService.get<number>('redis.db'),
      password: this.configService.get<string>('redis.password'),
      keyPrefix: this.configService.get<string>('redis.keyPrefix'),
    });
    this.redlock = new Redlock(
      [this.client], // List of Redis clients
      {
        driftFactor: 0.01, // Multiplier for determining clock drift
        retryCount: 5, // Retry 5 times
        retryDelay: 200, // Wait 200ms between retries
      },
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient() {
    return this.client;
  }

  getRedlock(): Redlock {
    return this.redlock;
  }
}
