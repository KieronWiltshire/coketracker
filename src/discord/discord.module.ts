import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { CokeTrackerCommand } from './commands/coke-tracker.command';
import { CokeTrackerModule } from '../coketracker/coketracker.module';

@Module({
  imports: [
    CokeTrackerModule,
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('discord.token'),
        intents: [
          IntentsBitField.Flags.GuildMembers,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.MessageContent,
        ]
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CokeTrackerCommand],
})
export class DiscordModule {}
