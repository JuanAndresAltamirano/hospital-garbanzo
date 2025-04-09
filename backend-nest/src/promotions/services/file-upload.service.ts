import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    console.log('Uploading file:', file.originalname);
    console.log('File size:', file.size);
    console.log('Destination path:', filePath);

    try {
      // Ensure directory exists
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }

      await fs.promises.writeFile(filePath, file.buffer);
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to upload file');
    }

    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    // Extract just the filename part if a full path is provided
    const justFileName = fileName.split('/').pop() || fileName;
    const filePath = this.getFilePath(justFileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadDir, fileName);
  }
} 