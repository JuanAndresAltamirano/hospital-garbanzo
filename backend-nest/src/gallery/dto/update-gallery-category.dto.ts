import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateGalleryCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsBoolean()
  isMainCategory?: boolean;
} 