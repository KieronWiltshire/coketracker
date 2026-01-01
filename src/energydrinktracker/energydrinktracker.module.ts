import { Module } from '@nestjs/common';
import { EnergyDrinkTrackerService } from './services/energydrinktracker.service';
import { EnergyDrinkTrackerDao } from './daos/energydrinktracker.dao';

@Module({
  providers: [EnergyDrinkTrackerService, EnergyDrinkTrackerDao],
  exports: [EnergyDrinkTrackerService],
})
export class EnergyDrinkTrackerModule {}

