import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('service_contacts')
export class ServiceContact {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  category: string;
}
