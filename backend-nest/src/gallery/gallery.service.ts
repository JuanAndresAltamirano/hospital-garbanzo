import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryCategory } from './entities/gallery-category.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryCategory)
    private categoriesRepository: Repository<GalleryCategory>,
    @InjectRepository(GalleryImage)
    private imagesRepository: Repository<GalleryImage>,
  ) {}

  async findAllCategories() {
    const categories = await this.categoriesRepository.find({
      relations: ['images', 'subcategories', 'parent'],
      order: {
        order: 'ASC',
        subcategories: {
          order: 'ASC',
        },
        images: {
          order: 'ASC',
        },
      },
    });

    // Return only main categories with their subcategories nested
    const mainCategories = categories.filter(category => 
      category.isMainCategory || category.parentId === null
    );

    // For UI display, structure the results with subcategories nested under main categories
    return mainCategories;
  }

  async findCategoryById(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['images', 'subcategories', 'parent'],
      order: {
        subcategories: {
          order: 'ASC',
        },
        images: {
          order: 'ASC',
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Gallery category with ID ${id} not found`);
    }

    return category;
  }

  async createCategory(createCategoryDto: CreateGalleryCategoryDto) {
    const newCategory = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(newCategory);
  }

  async updateCategory(id: number, updateCategoryDto: UpdateGalleryCategoryDto) {
    const category = await this.findCategoryById(id);
    
    const updatedCategory = {
      ...category,
      ...updateCategoryDto,
    };
    
    return this.categoriesRepository.save(updatedCategory);
  }

  async deleteCategory(id: number) {
    const category = await this.findCategoryById(id);
    return this.categoriesRepository.remove(category);
  }

  async findAllImages() {
    return this.imagesRepository.find({
      relations: ['category'],
      order: {
        order: 'ASC',
      },
    });
  }

  async findImageById(id: number) {
    const image = await this.imagesRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!image) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }

    return image;
  }

  async createImage(file: Express.Multer.File, createImageDto: CreateGalleryImageDto) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: createImageDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Gallery category with ID ${createImageDto.categoryId} not found`);
    }

    console.log('Received file:', file); // Debug log

    // Build the image URL using the full file info
    const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
    console.log('Image URL:', imageUrl);

    const newImage = this.imagesRepository.create({
      ...createImageDto,
      src: imageUrl,
      category,
    });

    return this.imagesRepository.save(newImage);
  }

  async updateImage(id: number, file: Express.Multer.File | undefined, updateImageDto: UpdateGalleryImageDto) {
    const image = await this.findImageById(id);
    
    const updatedImage = {
      ...image,
      ...updateImageDto,
    };

    if (file) {
      // Build the image URL using the full file info
      const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
      console.log('Updated image URL:', imageUrl);
      updatedImage.src = imageUrl;
    }

    if (updateImageDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateImageDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Gallery category with ID ${updateImageDto.categoryId} not found`);
      }

      updatedImage.category = category;
    }
    
    return this.imagesRepository.save(updatedImage);
  }

  async deleteImage(id: number) {
    const image = await this.findImageById(id);
    return this.imagesRepository.remove(image);
  }

  async updateCategoryOrder(categoryIds: number[]) {
    const categories = await this.categoriesRepository.find();
    
    const updates = categories.map((category, index) => {
      const newOrder = categoryIds.indexOf(category.id);
      if (newOrder !== -1) {
        return this.categoriesRepository.update(category.id, { order: newOrder });
      }
      return null;
    }).filter(Boolean);
    
    await Promise.all(updates);
    
    return this.findAllCategories();
  }

  async updateImageOrder(imageIds: number[]) {
    const images = await this.imagesRepository.find();
    
    const updates = images.map((image, index) => {
      const newOrder = imageIds.indexOf(image.id);
      if (newOrder !== -1) {
        return this.imagesRepository.update(image.id, { order: newOrder });
      }
      return null;
    }).filter(Boolean);
    
    await Promise.all(updates);
    
    return this.findAllImages();
  }
} 