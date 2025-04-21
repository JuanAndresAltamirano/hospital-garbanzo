import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HistoryService } from './history.service';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { UpdateTimelineDto } from './dto/update-timeline.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body('data') data: string,
    @UploadedFile() file?: Express.Multer.File,
    @Req() request?: any
  ) {
    console.log('----------- CREATE TIMELINE REQUEST -----------');
    console.log('Request headers:', request.headers);
    console.log('Request body keys:', Object.keys(request.body || {}));
    console.log('Request files:', request.files);
    console.log('Request file:', request.file);
    console.log('Data param:', data ? 'Present' : 'Missing');
    console.log('File param:', file ? `Present (${file.originalname})` : 'Missing');
    
    if (data) {
      try {
        console.log('Data content:', data);
        const createTimelineDto = JSON.parse(data);
        console.log('Parsed data:', createTimelineDto);
        return await this.historyService.create(createTimelineDto, file);
      } catch (error) {
        console.error('Error parsing data:', error);
        throw new BadRequestException('Invalid data format');
      }
    } else {
      console.error('No data provided in request');
      throw new BadRequestException('Missing data field');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.historyService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.historyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        // Check if it's an image
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new Error('Only JPG and PNG files are allowed'), false);
        }
        cb(null, true);
      },
    })
  )
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body('data') data: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log(`Updating timeline ${id}`);
    console.log('Received data:', data);
    console.log('Received file:', file ? `File present (${file.originalname})` : 'No file');
    
    const updateTimelineDto = JSON.parse(data);
    return await this.historyService.update(id, updateTimelineDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.historyService.remove(id);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateOrder(@Body('orderedIds') orderedIds: number[]) {
    return await this.historyService.updateOrder(orderedIds);
  }
} 