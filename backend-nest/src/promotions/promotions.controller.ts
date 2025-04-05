import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileUploadService } from './services/file-upload.service';

@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPromotionDto: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    // Convert form data to proper types
    const transformedDto: CreatePromotionDto = {
      title: createPromotionDto.title,
      description: createPromotionDto.description,
      discount: parseInt(createPromotionDto.discount, 10),
      startDate: new Date(createPromotionDto.startDate),
      endDate: new Date(createPromotionDto.endDate),
      isActive: createPromotionDto.isActive === 'true',
      image: ''
    };

    // Upload the file and get the filename
    const fileName = await this.fileUploadService.uploadFile(file);
    
    // Set the image path in the DTO
    transformedDto.image = fileName;
    
    console.log('Transformed DTO:', transformedDto);
    
    // Create the promotion with the transformed data
    return this.promotionsService.create(transformedDto);
  }

  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    // Convert form data to proper types
    const transformedDto: UpdatePromotionDto = {
      title: updatePromotionDto.title,
      description: updatePromotionDto.description,
      discount: parseInt(updatePromotionDto.discount, 10),
      startDate: new Date(updatePromotionDto.startDate),
      endDate: new Date(updatePromotionDto.endDate),
      isActive: updatePromotionDto.isActive === 'true',
    };
    
    // If file was uploaded, update image
    if (file) {
      const fileName = await this.fileUploadService.uploadFile(file);
      
      // Get the current promotion to find the old image
      const promotion = await this.promotionsService.findOne(+id);
      
      // Delete the old image
      if (promotion.image) {
        try {
          await this.fileUploadService.deleteFile(promotion.image);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      
      transformedDto.image = fileName;
    }
    
    return this.promotionsService.update(+id, transformedDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const promotion = await this.promotionsService.findOne(+id);
    if (promotion.image) {
      try {
        await this.fileUploadService.deleteFile(promotion.image);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    return this.promotionsService.remove(+id);
  }
} 