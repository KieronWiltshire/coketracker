import { Module } from '@nestjs/common';
import { GymTrackerService } from './services/gymtracker.service';
import { GymTrackerDao } from './daos/gymtracker.dao';

@Module({
  providers: [GymTrackerService, GymTrackerDao],
  exports: [GymTrackerService],
})
export class GymTrackerModule {}

