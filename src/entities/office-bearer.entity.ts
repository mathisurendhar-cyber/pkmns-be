import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('office_bearers')
export class OfficeBearer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  image_url: string;
}
