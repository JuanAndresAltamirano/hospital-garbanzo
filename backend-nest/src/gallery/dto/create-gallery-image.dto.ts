import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGalleryImageDto {
  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;
} 