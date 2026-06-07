## アーキテクチャ図
```mermaid
graph LR
  subgraph External
    Seed[seed.ts\nデータ投入スクリプト]
  end

  subgraph Frontend
    React[React SPA\nログ検索画面]
  end

  subgraph Backend
    NestJS[NestJS\nREST API]
  end

  subgraph Database
    PG[(PostgreSQL)]
  end

  Seed -- "POST /audit-logs\n大量ログ投入" --> NestJS
  React -- "GET /audit-logs\n検索リクエスト" --> NestJS
  NestJS -- "INSERT / SELECT" --> PG
  NestJS -- "検索結果" --> React
  ```

## ER図
[ER図](./backend/ERD.md)