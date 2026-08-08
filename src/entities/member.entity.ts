import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true, default: '' })
  phone: string;

  @Column({ nullable: true, default: 'member' })
  role: string;

  @Column({ nullable: true, default: '' })
  joined: string;

  @Column({ nullable: true, default: '' })
  address: string;

  @Column({ nullable: true })
  photo_url: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
