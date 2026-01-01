import { GymTrackerDto } from '../dtos/gymtracker.dto';
import { CreateGymTrackerDto } from '../dtos/create-gymtracker.dto';
import { Injectable } from '@nestjs/common';
import { KnexDao } from '../../database/knex/knex.dao';
import { GymStatsDto } from '../dtos/gymstats.dto';

@Injectable()
export class GymTrackerDao extends KnexDao<GymTrackerDao> {
  async create(createGymTrackerDto: CreateGymTrackerDto) {
    return this.knex<GymTrackerDto>('gym_tracker').insert(
      createGymTrackerDto,
    );
  }

  async getGymStats() {
    const stats = (await this.knex('gym_tracker')
      .select(this.knex.raw('went, COUNT(*) as count'))
      .groupBy('went')) as GymStatsDto[];

    return {
      daysWithGym: stats.find((s) => s.went)?.count || 0,
      daysWithoutGym: stats.find((s) => !s.went)?.count || 0,
    };
  }
}

