import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class ImageProcessingMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Only process requests to /uploads directory
    if (!req.path.startsWith('/uploads/')) {
      return next();
    }

    // Check if the request has format query parameter
    const requestedFormat = req.query.format as string || '';
    const requestedWidth = req.query.width ? parseInt(req.query.width as string, 10) : null;

    // If no format is specified, just pass through
    if (!requestedFormat) {
      return next();
    }

    try {
      // Extract the original file path from the request
      const filePath = path.join(process.cwd(), req.path.replace('/uploads/', 'uploads/'));
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return next();
      }
      
      // Read the file
      const originalImage = sharp(filePath);
      
      // Determine output format
      let transformer = originalImage;
      let contentType = 'image/jpeg'; // Default

      // Apply resizing if width is specified
      if (requestedWidth && !isNaN(requestedWidth)) {
        transformer = transformer.resize(requestedWidth);
      }

      // Set format based on requested format
      switch (requestedFormat.toLowerCase()) {
        case 'webp':
          transformer = transformer.webp({ quality: 80 });
          contentType = 'image/webp';
          break;
        case 'jpg':
        case 'jpeg':
          transformer = transformer.jpeg({ quality: 80 });
          contentType = 'image/jpeg';
          break;
        case 'png':
          transformer = transformer.png({ quality: 80 });
          contentType = 'image/png';
          break;
        default:
          // If format is not supported, continue to next middleware
          return next();
      }

      // Get the processed image buffer
      const buffer = await transformer.toBuffer();

      // Send the response
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=604800'); // Cache for a week
      res.end(buffer);
    } catch (error) {
      console.error('Error processing image:', error);
      next();
    }
  }
} 