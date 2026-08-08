import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  count: number;

  @Column({ type: 'bigint' })
  lastReset: string;
}
