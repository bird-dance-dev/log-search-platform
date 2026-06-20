# ---- ベースイメージ ----
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージ情報だけ先にコピー
COPY package.json package-lock.json ./

# パッケージインストール
RUN npm ci

# Prismaのスキーマをコピーしてクライアント生成
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# 残りのソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# NestJSのデフォルトポート
EXPOSE 3000

# 起動コマンド
CMD sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"
