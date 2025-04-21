import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { GalleryCategory } from './gallery-category.entity';

@Entity()
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ nullable: true })
  caption: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GalleryCategory, category => category.images, { onDelete: 'CASCADE' })
  category: GalleryCategory;
} 