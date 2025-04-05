import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionsRepository.create(createPromotionDto);
    return this.promotionsRepository.save(promotion);
  }

  findAll(): Promise<Promotion[]> {
    return this.promotionsRepository.find();
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);
    Object.assign(promotion, updatePromotionDto);
    return this.promotionsRepository.save(promotion);
  }

  async remove(id: number): Promise<void> {
    const result = await this.promotionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
  }
} 