import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GalleryImage } from './gallery-image.entity';

@Entity()
export class GalleryCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => GalleryCategory, category => category.subcategories, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: GalleryCategory;

  @OneToMany(() => GalleryCategory, category => category.parent)
  subcategories: GalleryCategory[];

  @Column({ default: false })
  isMainCategory: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GalleryImage, image => image.category, { cascade: true })
  images: GalleryImage[];
} 