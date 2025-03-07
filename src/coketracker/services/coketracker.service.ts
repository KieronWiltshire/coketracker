import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CokeTrackerDao } from '../daos/coketracker.dao';

@Injectable()
export class CokeTrackerService {
  constructor(
    private readonly config: ConfigService,
    private readonly cokeTrackerDao: CokeTrackerDao,
  ) {}

  async updateCokeTracker(date: Date, hadCoke: boolean): Promise<void> {
    await this.cokeTrackerDao.create({
      date,
      drank: hadCoke,
    });
  }

  async getCokeStats() {
    return this.cokeTrackerDao.getCokeStats();
  }
}
