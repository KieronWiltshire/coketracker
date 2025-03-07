import { Module } from '@nestjs/common';
import { CokeTrackerService } from './services/coketracker.service';
import { CokeTrackerDao } from './daos/coketracker.dao';

@Module({
  providers: [CokeTrackerService, CokeTrackerDao],
  exports: [CokeTrackerService],
})
export class CokeTrackerModule {}
