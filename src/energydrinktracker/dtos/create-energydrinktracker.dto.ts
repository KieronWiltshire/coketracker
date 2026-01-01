import { EnergyDrinkTrackerDto } from './energydrinktracker.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateEnergyDrinkTrackerDto extends OmitType(EnergyDrinkTrackerDto, [
  'id',
] as const) {}

