import { IsString, IsNumber, IsOptional, Min, MaxLength, MinLength, IsIn } from 'class-validator';

const VALID_ICONS = [
  'stethoscope',
  'ambulance',
  'flask',
  'xray',
  'baby',
  'female',
  'doctor',
  'hospital',
  'heartbeat',
  'bandaid',
  'pills',
  'syringe',
  'wheelchair',
  'teeth',
  'lungs',
  'brain',
  'eye',
  'notes',
  'clinic',
  'firstaid',
  'vial',
  'microscope',
  'dna',
  'book',
  'patient',
  'nurse',
  'bed',
  'virus',
  'disease',
  'thermometer'
] as const;

export class CreateServiceDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot be longer than 100 characters' })
  name: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description cannot be longer than 1000 characters' })
  description: string;

  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsNumber()
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsIn(VALID_ICONS, { message: 'Invalid icon selected' })
  icon: string;
} 