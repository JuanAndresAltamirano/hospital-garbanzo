import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGalleryImageDto {
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

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;
} 