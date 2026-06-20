/**
 * サンプルイベントデータ生成（100件）
 * scripts/seed.ts のログタイプ定義と一致するデータを生成する
 * faker.js 不使用 — 固定の配列からローテーションで選択
 */

// ---- 固定データプール ----
const userIds = ['tanaka', 'suzuki', 'yamamoto', 'sato', 'takahashi', 'kobayashi', 'watanabe', 'ito', 'nakamura', 'kato'];
const domain = 'corp.example.com';
const hostnames = Array.from({ length: 20 }, (_, i) => `pc-${String(i + 1).padStart(3, '0')}`);
const servernames = Array.from({ length: 5 }, (_, i) => `srv-${String(i + 1).padStart(3, '0')}`);

// ローテーション用カウンター
let counter = 0;
function pick<T>(arr: T[]): T {
  return arr[counter++ % arr.length];
}

function pickUser() {
  const id = pick(userIds);
  return { userid: id, email: `${id}@${domain}` };
}

function internalIp(): string {
  const a = (counter % 254) + 1;
  const b = ((counter * 7) % 254) + 1;
  return `10.0.${a}.${b}`;
}

function externalIp(): string {
  const a = (counter % 200) + 20;
  const b = ((counter * 3) % 200) + 20;
  const c = ((counter * 7) % 200) + 20;
  const d = ((counter * 11) % 200) + 20;
  return `${a}.${b}.${c}.${d}`;
}

// ---- ログタイプ定義（scripts/seed.ts と一致） ----
interface EventTemplate {
  metadata_eventType: string;
  metadata_logType: string;
  metadata_vendorName: string;
  metadata_productName: string;
  principal_hostname?: string;
  principal_ip?: string;
  principal_user_userid?: string;
  principal_user_email?: string;
  principal_process_pid?: string;
  principal_process_commandLine?: string;
  target_hostname?: string;
  target_ip?: string;
  target_user_userid?: string;
  target_user_email?: string;
  target_url?: string;
  target_resourceName?: string;
  securityResult: {
    action: string;
    severity: string;
    description: string;
    category: string;
  };
}

function generateMicrosoftDefender(): EventTemplate {
  const user = pickUser();
  const commandLines = [
    'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -enc SQBFAFgA',
    'cmd.exe /c whoami /all',
    'cmd.exe /c net user /domain',
    'notepad.exe C:\\Users\\Public\\memo.txt',
    'explorer.exe',
    'chrome.exe --no-sandbox --disable-gpu',
    'svchost.exe -k netsvcs -p',
    'outlook.exe /recycle',
  ];
  const resources = [
    'C:\\Windows\\System32\\cmd.exe',
    'C:\\Users\\Public\\Downloads\\invoice.pdf.exe',
    `C:\\Users\\${user.userid}\\Documents\\report.docx`,
    `C:\\Users\\${user.userid}\\Desktop\\quarterly_data.xlsx`,
  ];
  const eventTypes = ['PROCESS_LAUNCH', 'FILE_CREATION', 'FILE_MODIFICATION', 'NETWORK_CONNECTION'];
  const isMalicious = counter % 8 === 0;

  return {
    metadata_eventType: pick(eventTypes),
    metadata_logType: 'MICROSOFT_DEFENDER_ENDPOINT',
    metadata_vendorName: 'Microsoft',
    metadata_productName: 'Defender for Endpoint',
    principal_hostname: pick(hostnames),
    principal_ip: internalIp(),
    principal_user_userid: user.userid,
    principal_user_email: user.email,
    principal_process_pid: String(1000 + (counter % 9000)),
    principal_process_commandLine: pick(commandLines),
    target_resourceName: pick(resources),
    securityResult: isMalicious
      ? { action: 'BLOCK', severity: 'HIGH', description: 'Suspicious process injection detected', category: 'SOFTWARE_MALICIOUS' }
      : { action: 'ALLOW', severity: 'LOW', description: 'Process execution normal', category: 'SOFTWARE_PROCESS' },
  };
}

function generateTrendMicro(): EventTemplate {
  const eventTypes = ['PROCESS_LAUNCH', 'FILE_CREATION', 'SCAN_HOST'];
  const commandLines = [
    'w3wp.exe -ap "DefaultAppPool"',
    'sqlservr.exe -sMSSQLSERVER',
    'java.exe -jar /opt/app/server.jar',
    'powershell.exe -File C:\\Scripts\\backup.ps1',
  ];
  const resources = [
    '/var/log/syslog',
    '/opt/app/server.jar',
    'C:\\inetpub\\wwwroot\\web.config',
    'C:\\ProgramData\\update.exe',
  ];
  const isMalicious = counter % 12 === 0;

  return {
    metadata_eventType: pick(eventTypes),
    metadata_logType: 'TRENDMICRO_APEX_ONE',
    metadata_vendorName: 'Trend Micro',
    metadata_productName: 'Apex One SaaS',
    principal_hostname: pick(servernames),
    principal_ip: `172.16.${(counter % 10) + 1}.${(counter % 254) + 1}`,
    principal_user_userid: 'SYSTEM',
    principal_process_pid: String(2000 + (counter % 5000)),
    principal_process_commandLine: pick(commandLines),
    target_resourceName: pick(resources),
    securityResult: isMalicious
      ? { action: 'QUARANTINE', severity: 'CRITICAL', description: 'Webshell detected on server', category: 'SOFTWARE_MALICIOUS' }
      : { action: 'ALLOW', severity: 'LOW', description: 'Scheduled scan completed', category: 'SOFTWARE_PROCESS' },
  };
}

function generateAzureAd(): EventTemplate {
  const user = pickUser();
  const eventTypes = ['USER_LOGIN', 'USER_LOGOUT', 'USER_RESOURCE_ACCESS', 'USER_CREATION'];
  const urls = [
    'https://login.microsoftonline.com',
    'https://portal.azure.com',
    'https://outlook.office365.com',
    'https://teams.microsoft.com',
  ];
  const resources = [
    'Microsoft Office 365',
    'Azure Portal',
    'Microsoft Teams',
    'SharePoint Online',
  ];
  const isFailed = counter % 10 === 0;

  return {
    metadata_eventType: pick(eventTypes),
    metadata_logType: 'AZURE_AD',
    metadata_vendorName: 'Microsoft',
    metadata_productName: 'Azure AD',
    principal_hostname: pick(hostnames),
    principal_ip: internalIp(),
    principal_user_userid: user.userid,
    principal_user_email: user.email,
    target_url: pick(urls),
    target_resourceName: pick(resources),
    securityResult: isFailed
      ? { action: 'BLOCK', severity: 'MEDIUM', description: 'Invalid password attempt', category: 'AUTH_VIOLATION' }
      : { action: 'ALLOW', severity: 'LOW', description: 'Sign-in successful', category: 'AUTH_ACTIVITY' },
  };
}

function generateOffice365(): EventTemplate {
  const user = pickUser();
  const eventTypes = ['USER_RESOURCE_ACCESS', 'USER_RESOURCE_UPDATE_CONTENT', 'USER_RESOURCE_CREATION'];
  const urls = [
    'https://outlook.office365.com/mail',
    'https://example.sharepoint.com/sites/project',
    'https://teams.microsoft.com/channel/general',
  ];
  const resources = [
    '2026年度_予算計画.xlsx',
    '取締役会議事録_Q1.docx',
    '顧客リスト_機密.csv',
    'プロジェクト進捗報告.pptx',
  ];
  const isSuspicious = counter % 12 === 0;

  return {
    metadata_eventType: pick(eventTypes),
    metadata_logType: 'OFFICE_365',
    metadata_vendorName: 'Microsoft',
    metadata_productName: 'Office 365',
    principal_hostname: pick(hostnames),
    principal_ip: internalIp(),
    principal_user_userid: user.userid,
    principal_user_email: user.email,
    target_url: pick(urls),
    target_resourceName: pick(resources),
    securityResult: isSuspicious
      ? { action: 'BLOCK', severity: 'HIGH', description: 'Sensitive file shared externally', category: 'DATA_EXFILTRATION' }
      : { action: 'ALLOW', severity: 'LOW', description: 'File accessed', category: 'USER_ACTIVITY' },
  };
}

function generatePaloAlto(): EventTemplate {
  const isOutbound = counter % 3 !== 0;
  const isBlocked = counter % 7 === 0;

  return {
    metadata_eventType: 'NETWORK_CONNECTION',
    metadata_logType: 'PALO_ALTO_FIREWALL',
    metadata_vendorName: 'Palo Alto Networks',
    metadata_productName: 'PA-Series Firewall',
    principal_ip: isOutbound ? internalIp() : externalIp(),
    principal_user_userid: isOutbound ? pick(userIds) : undefined,
    target_ip: isOutbound ? externalIp() : internalIp(),
    target_url: isOutbound ? `https://example-${counter % 20}.com` : undefined,
    securityResult: isBlocked
      ? { action: 'BLOCK', severity: 'HIGH', description: 'Connection to known C2 server blocked', category: 'NETWORK_SUSPICIOUS' }
      : { action: 'ALLOW', severity: 'LOW', description: 'Traffic allowed by policy', category: 'NETWORK_CONNECTION' },
  };
}

function generateZscaler(): EventTemplate {
  const user = pickUser();
  const urls = [
    `https://drive.google.com/file/d/sample${counter % 10}`,
    'https://www.dropbox.com/s/sample-file',
    'https://github.com/org/repo/archive/main.zip',
    'https://login.microsoftonline.com/common/oauth2/authorize',
    'https://docs.google.com/spreadsheets/d/export',
  ];
  const isBlocked = counter % 10 === 0;

  return {
    metadata_eventType: 'NETWORK_HTTP',
    metadata_logType: 'ZSCALER_WEBPROXY',
    metadata_vendorName: 'Zscaler',
    metadata_productName: 'Zscaler Internet Access',
    principal_hostname: pick(hostnames),
    principal_ip: internalIp(),
    principal_user_userid: user.userid,
    principal_user_email: user.email,
    target_ip: externalIp(),
    target_url: pick(urls),
    securityResult: isBlocked
      ? { action: 'BLOCK', severity: 'HIGH', description: 'Phishing site blocked', category: 'NETWORK_MALICIOUS' }
      : { action: 'ALLOW', severity: 'LOW', description: 'Web access allowed', category: 'NETWORK_CONNECTION' },
  };
}

// ---- ログタイプ → 生成関数のマッピング ----
const generators: (() => EventTemplate)[] = [
  generateMicrosoftDefender,
  generateTrendMicro,
  generateAzureAd,
  generateOffice365,
  generatePaloAlto,
  generateZscaler,
];

// ---- タイムスタンプ生成（過去30日間に分散） ----
function generateTimestamp(index: number): Date {
  const now = new Date();
  const daysAgo = 30 - (index % 30);
  const hours = (index * 3) % 24;
  const minutes = (index * 7) % 60;
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// ---- メインの生成関数 ----
export interface NamespaceAllocation {
  namespaceId: string;
  count: number;
}

export interface TenantAllocation {
  tenantId: string;
  namespaces: NamespaceAllocation[];
}

export interface SeedEvent {
  tenantId: string;
  namespaceId: string;
  metadata_eventTimestamp: Date;
  metadata_eventType: string;
  metadata_logType: string;
  metadata_vendorName: string;
  metadata_productName: string;
  principal_hostname?: string;
  principal_ip?: string;
  principal_user_userid?: string;
  principal_user_email?: string;
  principal_process_pid?: string;
  principal_process_commandLine?: string;
  target_hostname?: string;
  target_ip?: string;
  target_user_userid?: string;
  target_user_email?: string;
  target_url?: string;
  target_resourceName?: string;
  securityResults: {
    create: Array<{
      action: string;
      severity: string;
      description: string;
      category: string;
    }>;
  };
}

/**
 * サンプルイベントデータを生成する
 *
 * @param allocations テナントごとのnamespace配分
 *   例: [
 *     { tenantId: 'xxx', namespaces: [{ namespaceId: 'a', count: 18 }, { namespaceId: 'b', count: 17 }, { namespaceId: 'c', count: 15 }] },
 *     { tenantId: 'yyy', namespaces: [{ namespaceId: 'd', count: 18 }, { namespaceId: 'e', count: 17 }, { namespaceId: 'f', count: 15 }] },
 *   ]
 * @returns SeedEvent[] 生成されたイベント配列
 */
export function generateSampleEvents(allocations: TenantAllocation[]): SeedEvent[] {
  counter = 0;
  const events: SeedEvent[] = [];

  let globalIndex = 0;

  for (const tenant of allocations) {
    for (const ns of tenant.namespaces) {
      for (let i = 0; i < ns.count; i++) {
        const generator = generators[globalIndex % generators.length];
        const template = generator();

        events.push({
          tenantId: tenant.tenantId,
          namespaceId: ns.namespaceId,
          metadata_eventTimestamp: generateTimestamp(globalIndex),
          metadata_eventType: template.metadata_eventType,
          metadata_logType: template.metadata_logType,
          metadata_vendorName: template.metadata_vendorName,
          metadata_productName: template.metadata_productName,
          principal_hostname: template.principal_hostname,
          principal_ip: template.principal_ip,
          principal_user_userid: template.principal_user_userid,
          principal_user_email: template.principal_user_email,
          principal_process_pid: template.principal_process_pid,
          principal_process_commandLine: template.principal_process_commandLine,
          target_hostname: template.target_hostname,
          target_ip: template.target_ip,
          target_user_userid: template.target_user_userid,
          target_user_email: template.target_user_email,
          target_url: template.target_url,
          target_resourceName: template.target_resourceName,
          securityResults: {
            create: [template.securityResult],
          },
        });

        globalIndex++;
      }
    }
  }

  return events;
}