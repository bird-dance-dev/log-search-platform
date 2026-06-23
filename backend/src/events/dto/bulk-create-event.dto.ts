import { ApiProperty } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto.js';

export class BulkCreateEventDto {
  @ApiProperty({ type: [CreateEventDto], description: 'イベントの配列' })
  events!: CreateEventDto[];
}
