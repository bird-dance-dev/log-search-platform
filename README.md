## プロダクト概要
実務でGoogle SecOpsの導入支援に関わる中で、導入よりも製品を作る側への思いが強くなり、ログ検索プラットフォームをテーマに設計・実装しました。\
ログ取込を始め、ログ検索、テナント分離、２軸（機能RBAC・データRBAC）独立の権限管理を実現しています。\
特に、テナント分離・権限管理はSaaSプロダクトの根幹機能のため、拡張性を意識して設計判断しました。

## 技術スタック
### バックエンド
- 言語：TypeScript
- フレームワーク：NestJS
- DB：PostgreSQL
- ORM：Prisma
- Test：Jest
### フロントエンド
- 言語：TypeScript
- フレームワーク：React
### インフラ
- 環境構築：Docker
- CI：Github Actions
- API仕様：OpenAPI（Swagger）

## アーキテクチャ図
### 全体構成
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
### 認証・認可フロー
```mermaid
graph LR
  A["HTTPリクエスト"] --> B["トークン検証\n(JWT認証)"]
  B --> C["テナント分離\n(テナントID)"]
  C --> D["機能RBAC\n(機能ロール)"]
  D --> E["データRBAC\n(namespace)"]
  E --> F["Controller"]

  style A fill:none
  style F fill:none
```

## ER図
[ER図](./backend/ERD.md)

## テナント分離・２軸 (機能 / データRBAC) 独立の権限管理の設計
### テナント分離
- A社・B社の２社として定義
- DB上は新規テナントの追加が可能となるよう設計済み
### 機能RBAC
- 管理者・一般ユーザーの２ロールとして定義
- DB上は新規ロールの追加が可能となるよう設計済み
### データRBAC
- データ取込の際に、1イベント（ログ）単位でnamespaceを定義（実際には、取込方法ごとにnamespaceを定義する想定）
- A社ではnamespaceをA, B, Cで定義
- B社ではnamespaceをD, E, Fで定義
- 初期設定では、ユーザーAは、namespaceA, B, C全て表示。ユーザーBはnamespaceAのみ表示
- 同様に、ユーザーCは、namespaceD, E, F全て表示。ユーザーDはnamespaceDのみ表示
- 画面上で、各ユーザーのnamespace設定を変更可能

## デモアカウント一覧

| ユーザー | テナント | 機能RBAC | データRBAC | メールアドレス | パスワード |
|---------|---------|---------|-----------|--------------|-----------|
| A | A社 | 管理者 | namespace A, B, C | `user-a@example.com` | password123 |
| B | A社 | 一般ユーザー | namespace A のみ | `user-b@example.com` | password123 |
| C | B社 | 管理者 | namespace D, E, F | `user-c@example.com` | password123 |
| D | B社 | 一般ユーザー | namespace D のみ | `user-d@example.com` | password123 |

※パスワードはデモ用です