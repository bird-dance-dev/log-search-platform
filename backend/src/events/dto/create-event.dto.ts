import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSecurityResultDto {
  @ApiProperty({
    example: 'ALLOW',
    description: 'アクション（ALLOW, BLOCK, QUARANTINE 等）',
  })
  action!: string;

  @ApiPropertyOptional({
    example: 'LOW',
    description: '深刻度（LOW, MEDIUM, HIGH, CRITICAL）',
  })
  severity?: string;

  @ApiPropertyOptional({
    example: 'ログイン成功',
    description: '検出内容の説明',
  })
  description?: string;

  @ApiPropertyOptional({ example: 'AUTH_ACTIVITY', description: 'カテゴリ' })
  category?: string;
}

export class CreateEventDto {
  // ---- namespace ----
  @ApiProperty({ example: 'namespace-uuid', description: 'NamespaceのID' })
  namespaceId!: string;

  // ---- metadata ----
  @ApiProperty({
    example: '2026-04-10T10:00:00Z',
    description: 'イベント発生日時',
  })
  metadata_eventTimestamp!: string;

  @ApiProperty({ example: 'USER_LOGIN', description: 'イベント種別' })
  metadata_eventType!: string;

  @ApiProperty({ example: 'GOOGLE_WORKSPACE', description: 'ログソース' })
  metadata_logType!: string;

  @ApiProperty({ example: 'Google', description: 'ベンダー名' })
  metadata_vendorName!: string;

  @ApiProperty({ example: 'Workspace', description: 'プロダクト名' })
  metadata_productName!: string;

  // ---- principal ----
  @ApiPropertyOptional({ example: 'pc-001', description: '行為者のホスト名' })
  principal_hostname?: string;

  @ApiPropertyOptional({
    example: '192.168.1.10',
    description: '行為者のIPアドレス',
  })
  principal_ip?: string;

  @ApiPropertyOptional({
    example: 'tanaka',
    description: '行為者のユーザーID',
  })
  principal_user_userid?: string;

  @ApiPropertyOptional({
    example: 'tanaka@example.com',
    description: '行為者のメールアドレス',
  })
  principal_user_email?: string;

  @ApiPropertyOptional({ example: '4832', description: 'プロセスID' })
  principal_process_pid?: string;

  @ApiPropertyOptional({
    example: 'powershell.exe -enc ...',
    description: '実行コマンドライン',
  })
  principal_process_commandLine?: string;

  // ---- target ----
  @ApiPropertyOptional({
    example: 'server-001',
    description: '対象のホスト名',
  })
  target_hostname?: string;

  @ApiPropertyOptional({
    example: '203.0.113.50',
    description: '対象のIPアドレス',
  })
  target_ip?: string;

  @ApiPropertyOptional({ example: 'admin', description: '対象のユーザーID' })
  target_user_userid?: string;

  @ApiPropertyOptional({
    example: 'admin@example.com',
    description: '対象のメールアドレス',
  })
  target_user_email?: string;

  @ApiPropertyOptional({
    example: 'https://admin.example.com',
    description: 'アクセス先URL',
  })
  target_url?: string;

  @ApiPropertyOptional({
    example: '機密データ.xlsx',
    description: '操作対象のリソース名',
  })
  target_resourceName?: string;

  // ---- securityResults ----
  @ApiPropertyOptional({
    type: [CreateSecurityResultDto],
    description: 'セキュリティ判定の配列',
  })
  securityResults?: CreateSecurityResultDto[];
}
