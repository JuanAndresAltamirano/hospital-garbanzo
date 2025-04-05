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

      // Handle file upload if provided
      let imagePath: string | undefined = undefined;
      if (file) {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);
        imagePath = `/uploads/${fileName}`;
      }

      // Create the timeline item
      const timeline = this.timelineRepository.create({
        ...createTimelineDto,
        displayOrder,
        image: imagePath,
      });

      return await this.timelineRepository.save(timeline);
    } catch (error) {
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
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Delete old image if exists
        if (timeline.image) {
          const oldImagePath = path.join(process.cwd(), timeline.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);
        timeline.image = `/uploads/${fileName}`;
      }

      // Update other fields
      Object.assign(timeline, updateTimelineDto);
      return await this.timelineRepository.save(timeline);
    } catch (error) {
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
        const imagePath = path.join(process.cwd(), timeline.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
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