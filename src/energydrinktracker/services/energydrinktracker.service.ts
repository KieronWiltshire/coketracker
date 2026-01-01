import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnergyDrinkTrackerDao } from '../daos/energydrinktracker.dao';

@Injectable()
export class EnergyDrinkTrackerService {
  constructor(
    private readonly config: ConfigService,
    private readonly energyDrinkTrackerDao: EnergyDrinkTrackerDao,
  ) {}

  async updateEnergyDrinkTracker(date: Date, hadEnergyDrink: boolean): Promise<void> {
    await this.energyDrinkTrackerDao.create({
      date,
      drank: hadEnergyDrink,
    });
  }

  async getEnergyDrinkStats() {
    return this.energyDrinkTrackerDao.getEnergyDrinkStats();
  }
}

