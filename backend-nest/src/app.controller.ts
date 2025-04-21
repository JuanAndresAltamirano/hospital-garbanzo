import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('check-uploads')
  checkUploads(): any {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const exists = fs.existsSync(uploadsDir);
      const files = exists ? fs.readdirSync(uploadsDir) : [];
      
      return {
        uploadsDirectoryExists: exists,
        uploadsPath: uploadsDir,
        files: files,
      };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }

  @Get('debug-uploads')
  debugUploads(): any {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const exists = fs.existsSync(uploadsDir);
      const files = exists ? fs.readdirSync(uploadsDir) : [];
      
      // Check if files are readable
      const fileDetails = files.map(filename => {
        try {
          const filePath = path.join(uploadsDir, filename);
          const stats = fs.statSync(filePath);
          return {
            filename,
            size: stats.size,
            isFile: stats.isFile(),
            readable: fs.accessSync(filePath, fs.constants.R_OK) === undefined,
            url: `/uploads/${filename}`
          };
        } catch (err) {
          return {
            filename,
            error: err.message
          };
        }
      });
      
      return {
        uploadsDirectoryExists: exists,
        uploadsPath: uploadsDir,
        fileCount: files.length,
        files: fileDetails,
        staticAssetsConfig: {
          path: uploadsDir,
          prefix: '/uploads'
        }
      };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }
}
