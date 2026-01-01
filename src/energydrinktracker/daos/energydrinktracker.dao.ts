import { EnergyDrinkTrackerDto } from '../dtos/energydrinktracker.dto';
import { CreateEnergyDrinkTrackerDto } from '../dtos/create-energydrinktracker.dto';
import { Injectable } from '@nestjs/common';
import { KnexDao } from '../../database/knex/knex.dao';
import { EnergyDrinkStatsDto } from '../dtos/energydrinkstats.dto';

@Injectable()
export class EnergyDrinkTrackerDao extends KnexDao<EnergyDrinkTrackerDao> {
  async create(createEnergyDrinkTrackerDto: CreateEnergyDrinkTrackerDto) {
    return this.knex<EnergyDrinkTrackerDto>('energy_drink_tracker').insert(
      createEnergyDrinkTrackerDto,
    );
  }

  async getEnergyDrinkStats() {
    const stats = (await this.knex('energy_drink_tracker')
      .select(this.knex.raw('drank, COUNT(*) as count'))
      .groupBy('drank')) as EnergyDrinkStatsDto[];

    return {
      daysWithEnergyDrink: stats.find((s) => s.drank)?.count || 0,
      daysWithoutEnergyDrink: stats.find((s) => !s.drank)?.count || 0,
    };
  }
}

