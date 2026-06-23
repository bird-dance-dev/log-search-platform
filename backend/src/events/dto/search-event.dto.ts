import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchEventDto {
  @ApiPropertyOptional({
    example: 'metadata_eventType="USER_LOGIN" AND principal_ip="192.168.1.10"',
    description: 'UDMフィールドの検索条件（=, !=, LIKE, AND, OR をサポート）',
  })
  filter?: string;

  @ApiPropertyOptional({
    example: '2026-04-01T00:00:00Z',
    description: '検索開始日時',
  })
  startTime?: string;

  @ApiPropertyOptional({
    example: '2026-04-10T23:59:59Z',
    description: '検索終了日時',
  })
  endTime?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ページ番号（デフォルト: 1）',
  })
  page?: number;

  @ApiPropertyOptional({
    example: 50,
    description: '1ページあたりの件数（デフォルト: 50）',
  })
  limit?: number;
}
