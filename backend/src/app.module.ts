import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [PrismaModule, EventsModule, AuthModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
