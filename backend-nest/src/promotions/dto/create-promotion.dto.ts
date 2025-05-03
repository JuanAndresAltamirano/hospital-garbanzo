import { IsString, IsNotEmpty, IsNumber, IsDateString, IsBoolean, Min, Max, IsOptional } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsBoolean()
  isActive: boolean;
} 