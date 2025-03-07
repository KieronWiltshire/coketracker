import { CokeTrackerDto } from '../dtos/coketracker.dto';
import { CreateCokeTrackerDto } from '../dtos/create-coketracker.dto';
import { Injectable } from '@nestjs/common';
import { KnexDao } from '../../database/knex/knex.dao';
import { CokeStatsDto } from '../dtos/cokestats.dto';

@Injectable()
export class CokeTrackerDao extends KnexDao<CokeTrackerDao> {
  async create(createCokeTrackerDto: CreateCokeTrackerDto) {
    return this.knex<CokeTrackerDto>('coke_tracker').insert(
      createCokeTrackerDto,
    );
  }

  async getCokeStats() {
    const stats = (await this.knex('coke_tracker')
      .select(this.knex.raw('drank, COUNT(*) as count'))
      .groupBy('drank')) as CokeStatsDto[];

    return {
      daysWithCoke: stats.find((s) => s.drank)?.count || 0,
      daysWithoutCoke: stats.find((s) => !s.drank)?.count || 0,
    };
  }
}
