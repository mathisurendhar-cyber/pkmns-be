import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true, default: '' })
  password: string;

  @Column({ nullable: true, default: 'admin' })
  role: string;

  @Column({ nullable: true, default: '' })
  name: string;

  @Column({ nullable: true, default: '' })
  email: string;

  @Column({ nullable: true, default: '' })
  phone: string;

  @Column({ nullable: true, default: '' })
  joined: string;

  @Column({ nullable: true, default: 'img/avatar1.png' })
  avatar: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'varchar', nullable: true })
  otp: string | null;

  @Column({ type: 'bigint', nullable: true })
  otpExpiry: string | null;
}
