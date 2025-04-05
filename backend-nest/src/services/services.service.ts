import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto, file?: Express.Multer.File) {
    try {
      // Validate service data
      if (!createServiceDto.name || !createServiceDto.description || !createServiceDto.price || !createServiceDto.duration) {
        throw new BadRequestException('Missing required fields');
      }

      if (createServiceDto.price < 0) {
        throw new BadRequestException('Price cannot be negative');
      }

      if (createServiceDto.duration <= 0) {
        throw new BadRequestException('Duration must be greater than 0');
      }

      // Get the maximum display_order
      const maxOrderResult = await this.serviceRepository
        .createQueryBuilder('service')
        .select('MAX(service.displayOrder)', 'maxOrder')
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

      // Create the service
      const service = this.serviceRepository.create({
        ...createServiceDto,
        displayOrder,
        image: imagePath,
      });

      return await this.serviceRepository.save(service);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error creating service: ' + error.message);
    }
  }

  async findAll() {
    try {
      return await this.serviceRepository.find({
        order: {
          displayOrder: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Error fetching services: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const service = await this.serviceRepository.findOneBy({ id });
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching service: ' + error.message);
    }
  }

  async update(id: number, updateServiceDto: UpdateServiceDto, file?: Express.Multer.File) {
    try {
      const service = await this.serviceRepository.findOneBy({ id });
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      // Validate update data
      if (updateServiceDto.price !== undefined && updateServiceDto.price < 0) {
        throw new BadRequestException('Price cannot be negative');
      }

      if (updateServiceDto.duration !== undefined && updateServiceDto.duration <= 0) {
        throw new BadRequestException('Duration must be greater than 0');
      }

      // Handle file upload if provided
      if (file) {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Delete old image if exists
        if (service.image) {
          const oldImagePath = path.join(process.cwd(), service.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);
        service.image = `/uploads/${fileName}`;
      }

      // Update other fields
      Object.assign(service, updateServiceDto);
      return await this.serviceRepository.save(service);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error updating service: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const service = await this.serviceRepository.findOneBy({ id });
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      // Delete image file if exists
      if (service.image) {
        const imagePath = path.join(process.cwd(), service.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete the service
      await this.serviceRepository.remove(service);

      // Update display order for remaining services
      await this.serviceRepository
        .createQueryBuilder()
        .update(Service)
        .set({
          displayOrder: () => 'displayOrder - 1',
        })
        .where('displayOrder > :order', { order: service.displayOrder })
        .execute();

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting service: ' + error.message);
    }
  }

  async updateOrder(orderedIds: number[]) {
    try {
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        throw new BadRequestException('Invalid order data provided');
      }

      // Start a transaction
      await this.serviceRepository.manager.transaction(async (transactionalEntityManager) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Service)
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
      throw new BadRequestException('Error updating service order: ' + error.message);
    }
  }
} 