import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitor } from '../entities/visitor.entity';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(Visitor)
    private readonly visitorRepo: Repository<Visitor>,
  ) {}

  async visitors() {
    let row = await this.visitorRepo.findOne({ where: { id: 1 } });
    if (!row) {
      row = await this.visitorRepo.save(
        this.visitorRepo.create({
          count: 0,
          lastReset: String(Date.now()),
        }),
      );
    }

    let count = row.count || 0;
    let lastReset = Number(row.lastReset) || Date.now();

    if (Date.now() - lastReset > 24 * 60 * 60 * 1000) {
      count = 0;
      lastReset = Date.now();
    }

    count++;
    row.count = count;
    row.lastReset = String(lastReset);
    await this.visitorRepo.save(row);

    return { count };
  }
}
