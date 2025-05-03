import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // Categories endpoints
  @Get('categories')
  findAllCategories() {
    return this.galleryService.findAllCategories();
  }

  @Get('categories/:id')
  findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findCategoryById(id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() createCategoryDto: CreateGalleryCategoryDto) {
    return this.galleryService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateGalleryCategoryDto,
  ) {
    return this.galleryService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.deleteCategory(id);
  }

  @Patch('categories/reorder')
  @UseGuards(JwtAuthGuard)
  updateCategoryOrder(@Body() body: { categoryIds: number[] }) {
    return this.galleryService.updateCategoryOrder(body.categoryIds);
  }

  // Images endpoints
  @Get('images')
  findAllImages() {
    return this.galleryService.findAllImages();
  }

  @Get('images/:id')
  findImageById(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findImageById(id);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          console.log(`Generated filename: ${filename}`);
          callback(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, callback) => {
        console.log('File filter in controller:', file);
        if (!file || !file.mimetype.match(/^image\/(jpeg|png|gif|jpg)$/)) {
          return callback(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  createImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateGalleryImageDto,
  ) {
    console.log('Received file in controller:', file);
    console.log('Received DTO in controller:', createImageDto);
    return this.galleryService.createImage(file, createImageDto);
  }

  @Patch('images/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          console.log(`Generated filename for update: ${filename}`);
          callback(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, callback) => {
        if (!file || !file.mimetype.match(/^image\/(jpeg|png|gif|jpg)$/)) {
          return callback(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateImageDto: UpdateGalleryImageDto,
  ) {
    console.log('Updating image:', id, file);
    return this.galleryService.updateImage(id, file, updateImageDto);
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard)
  deleteImage(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.deleteImage(id);
  }

  @Patch('images/reorder')
  @UseGuards(JwtAuthGuard)
  updateImageOrder(@Body() body: { imageIds: number[] }) {
    return this.galleryService.updateImageOrder(body.imageIds);
  }

  @Get('categories/:categoryId/subcategories/:subcategoryId/images')
  getImagesBySubcategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('subcategoryId', ParseIntPipe) subcategoryId: number
  ) {
    return this.galleryService.findImagesBySubcategory(categoryId, subcategoryId);
  }
} 