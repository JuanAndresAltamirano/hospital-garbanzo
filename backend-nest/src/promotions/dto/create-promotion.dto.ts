import { IsString, IsNotEmpty, IsNumber, IsDateString, IsBoolean, Min, Max } from 'class-validator';

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

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsBoolean()
  isActive: boolean;
} 