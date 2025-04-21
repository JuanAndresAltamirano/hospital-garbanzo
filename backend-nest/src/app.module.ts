import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { PromotionsModule } from './promotions/promotions.module';
import { Promotion } from './promotions/entities/promotion.entity';
import { SpecialistsModule } from './specialists/specialists.module';
import { ServicesModule } from './services/services.module';
import { HistoryModule } from './history/history.module';
import { GalleryModule } from './gallery/gallery.module';
import { Service } from './services/entities/service.entity';
import { Timeline } from './history/entities/timeline.entity';
import { GalleryCategory } from './gallery/entities/gallery-category.entity';
import { GalleryImage } from './gallery/entities/gallery-image.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') ? +configService.get('DB_PORT') : 3306,
        username: configService.get('DB_USERNAME') || 'root',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_DATABASE') || 'hospital',
        entities: [User, Promotion, Service, Timeline, GalleryCategory, GalleryImage],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UsersModule,
    PromotionsModule,
    SpecialistsModule,
    ServicesModule,
    HistoryModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
