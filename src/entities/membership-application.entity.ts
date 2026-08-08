import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('membership_applications')
export class MembershipApplication {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  mobile: string;

  @Column()
  refId: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;
}
