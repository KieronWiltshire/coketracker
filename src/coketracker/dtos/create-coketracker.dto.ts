import { CokeTrackerDto } from './coketracker.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateCokeTrackerDto extends OmitType(CokeTrackerDto, [
  'id',
] as const) {}
