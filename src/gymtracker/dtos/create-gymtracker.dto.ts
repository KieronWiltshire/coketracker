import { GymTrackerDto } from './gymtracker.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateGymTrackerDto extends OmitType(GymTrackerDto, [
  'id',
] as const) {}

