import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeline } from './entities/timeline.entity';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { UpdateTimelineDto } from './dto/update-timeline.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(Timeline)
    private timelineRepository: Repository<Timeline>,
  ) {}

  async create(createTimelineDto: CreateTimelineDto, file?: Express.Multer.File) {
    try {
      // Get the maximum display_order
      const maxOrderResult = await this.timelineRepository
        .createQueryBuilder('timeline')
        .select('MAX(timeline.displayOrder)', 'maxOrder')
        .getRawOne();
      
      const displayOrder = (maxOrderResult?.maxOrder || 0) + 1;

      // Debug file information
      console.log('File received in create method:', file ? 'yes' : 'no');
      
      // Handle file upload manually if needed
      let image: string | undefined = undefined;
      
      if (file) {
        console.log('File details:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          fieldname: file.fieldname,
          filename: file.filename,
          path: file.path
        });
        
        try {
          // Ensure uploads directory exists
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('Created uploads directory:', uploadsDir);
          }
          
          // If Multer already saved the file, use that filename
          if (file.filename && file.path) {
            // Check if file exists at the expected path
            if (fs.existsSync(file.path)) {
              console.log('File already saved by Multer at:', file.path);
              image = file.filename;
            } else {
              console.warn('File not found at expected path:', file.path);
              
              // Generate a unique filename
              const fileExt = path.extname(file.originalname) || '.jpg';
              const filename = `${uuidv4()}${fileExt}`;
              const filepath = path.join(uploadsDir, filename);
              
              // Save file from buffer
              if (file.buffer) {
                fs.writeFileSync(filepath, file.buffer);
                console.log('Manually saved file from buffer to:', filepath);
                image = filename;
              } else {
                console.error('No file buffer available to save');
              }
            }
          } else {
            console.log('File does not have filename or path');
            
            // Generate a unique filename
            const fileExt = path.extname(file.originalname) || '.jpg';
            const filename = `${uuidv4()}${fileExt}`;
            const filepath = path.join(uploadsDir, filename);
            
            // Save file from buffer
            if (file.buffer) {
              fs.writeFileSync(filepath, file.buffer);
              console.log('Manually saved file to:', filepath);
              image = filename;
            } else {
              console.error('No file buffer available to save');
            }
          }
          
          console.log('Image filename set to:', image);
        } catch (err) {
          console.error('Error saving file:', err);
        }
      }
      
      // Create the timeline item
      const timeline = this.timelineRepository.create({
        ...createTimelineDto,
        displayOrder,
        image,
      });
      
      const savedTimeline = await this.timelineRepository.save(timeline);
      console.log('Saved timeline:', {
        id: savedTimeline.id,
        title: savedTimeline.title,
        image: savedTimeline.image
      });
      return savedTimeline;
    } catch (error) {
      console.error('Error creating timeline item:', error);
      throw new BadRequestException('Error creating timeline item: ' + error.message);
    }
  }

  async findAll() {
    try {
      return await this.timelineRepository.find({
        order: {
          displayOrder: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Error fetching timeline items: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const timeline = await this.timelineRepository.findOneBy({ id });
      if (!timeline) {
        throw new NotFoundException(`Timeline item with ID ${id} not found`);
      }
      return timeline;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching timeline item: ' + error.message);
    }
  }

  async update(id: number, updateTimelineDto: UpdateTimelineDto, file?: Express.Multer.File) {
    try {
      const timeline = await this.timelineRepository.findOneBy({ id });
      if (!timeline) {
        throw new NotFoundException(`Timeline item with ID ${id} not found`);
      }

      // Handle file upload if provided
      if (file) {
        // Delete old image if exists
        if (timeline.image) {
          try {
            const oldImagePath = path.join(process.cwd(), 'uploads', timeline.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (error) {
            console.warn('Error deleting old image:', error);
          }
        }

        // Use only filename property which is set by Multer
        timeline.image = file.filename;
      }

      // Update other fields
      Object.assign(timeline, updateTimelineDto);
      return await this.timelineRepository.save(timeline);
    } catch (error) {
      console.error('Error updating timeline item:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating timeline item: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const timeline = await this.timelineRepository.findOneBy({ id });
      if (!timeline) {
        throw new NotFoundException(`Timeline item with ID ${id} not found`);
      }

      // Delete image file if exists
      if (timeline.image) {
        try {
          const imagePath = path.join(process.cwd(), 'uploads', timeline.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (error) {
          console.warn('Error deleting image file:', error);
        }
      }

      // Delete the timeline item
      await this.timelineRepository.remove(timeline);

      // Update display order for remaining items
      await this.timelineRepository
        .createQueryBuilder()
        .update(Timeline)
        .set({
          displayOrder: () => 'displayOrder - 1',
        })
        .where('displayOrder > :order', { order: timeline.displayOrder })
        .execute();

      return timeline;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting timeline item: ' + error.message);
    }
  }

  async updateOrder(orderedIds: number[]) {
    try {
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        throw new BadRequestException('Invalid order data provided');
      }

      // Start a transaction
      await this.timelineRepository.manager.transaction(async (transactionalEntityManager) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Timeline)
            .set({ displayOrder: i })
            .where('id = :id', { id: orderedIds[i] })
            .execute();
        }
      });

      return { message: 'Order updated successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error updating timeline order: ' + error.message);
    }
  }
} 