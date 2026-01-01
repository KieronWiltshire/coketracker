import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GymTrackerDao } from '../daos/gymtracker.dao';

@Injectable()
export class GymTrackerService {
  constructor(
    private readonly config: ConfigService,
    private readonly gymTrackerDao: GymTrackerDao,
  ) {}

  async updateGymTracker(date: Date, wentToGym: boolean): Promise<void> {
    await this.gymTrackerDao.create({
      date,
      went: wentToGym,
    });
  }

  async getGymStats() {
    return this.gymTrackerDao.getGymStats();
  }
}

