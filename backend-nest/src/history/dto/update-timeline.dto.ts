import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

export class UpdateTimelineDto {
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'Year must be at least 4 characters long' })
  @MaxLength(4, { message: 'Year must be exactly 4 characters long' })
  year?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description cannot be longer than 1000 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Video URL must be a valid URL' })
  videoUrl?: string;
} 