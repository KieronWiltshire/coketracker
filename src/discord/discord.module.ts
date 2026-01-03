import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { CokeTrackerCommand } from './commands/coke-tracker.command';
import { CokeTrackerModule } from '../coketracker/coketracker.module';
import { PingCommand } from './commands/ping.command';
import { GymTrackerModule } from '../gymtracker/gymtracker.module';
import { GymTrackerCommand } from './commands/gym-tracker.command';
import { EnergyDrinkTrackerModule } from '../energydrinktracker/energydrinktracker.module';
import { EnergyDrinkTrackerCommand } from './commands/energy-drink-tracker.command';

@Module({
  imports: [
    CokeTrackerModule,
    GymTrackerModule,
    EnergyDrinkTrackerModule,
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('discord.token'),
        intents: [
          IntentsBitField.Flags.GuildMembers,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.MessageContent,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CokeTrackerCommand,
    GymTrackerCommand,
    EnergyDrinkTrackerCommand,
    PingCommand,
  ],
})
export class DiscordModule {}
