import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('gallery')
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @Column()
  url: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
