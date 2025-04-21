import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Ensure uploads directory exists
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Setting up static assets from:', uploadsPath);
  
  if (!existsSync(uploadsPath)) {
    console.log('Creating uploads directory');
    mkdirSync(uploadsPath, { recursive: true });
  }
  
  // First, serve static files directly without the /api prefix
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });
  
  console.log('Static assets served at: /uploads/*');
  
  // Set global prefix for API routes - MUST be after useStaticAssets to not affect static paths
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;
  
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
