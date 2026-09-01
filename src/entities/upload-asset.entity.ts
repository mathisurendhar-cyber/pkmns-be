import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('upload_assets')
export class UploadAsset {
  @PrimaryColumn({ type: 'varchar', length: 512 })
  path: string;

  @Column({ type: 'varchar', length: 120, default: 'application/octet-stream' })
  mime: string;

  @Column({ type: 'int', default: 0 })
  size: number;

  @Column({ type: 'bytea' })
  data: Buffer;
}
