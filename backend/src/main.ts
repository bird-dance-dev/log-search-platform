import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // リクエストボディの上限を10MBに引き上げ
  app.use(json({ limit: '10mb' }));

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('Log Search Platform API')
    .setDescription('ログ検索プラットフォームのREST API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
