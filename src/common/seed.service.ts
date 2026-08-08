import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { Category } from '../entities/category.entity';
import { MembershipApplication } from '../entities/membership-application.entity';
import { Visitor } from '../entities/visitor.entity';

const SEED_USERS = [
  {
    username: 'mainadmin',
    password: '119313',
    role: 'super',
    name: 'Main Admin',
    email: 'mathisurendhar@gmail.com',
    phone: '',
    joined: '',
    avatar: 'img/avatar1.png',
  },
  {
    username: 'saravanan',
    role: 'admin',
    phone: '651168494',
    joined: '',
    email: 'mizzey1193@gmail.com',
    avatar: 'img/avatar2.png',
    password: '12345',
  },
  {
    username: 'Mukesh',
    phone: '-',
    role: 'member',
    joined: '-',
    photo: '/uploads/Mukesh.jpeg',
    email: 'csccscscs@gmail.com',
    password: '',
  },
  {
    username: 'prabu',
    phone: '-',
    role: 'member',
    joined: '-',
    photo: '/uploads/prabu.png',
    email: '',
    password: '',
  },
];

const SEED_CATEGORIES = [
  {
    id: 'corporation_department',
    name: 'Corporation Department',
    image: '/img/services/corp.png',
  },
  { id: 'police', name: 'Police', image: '/img/services/police.png' },
  {
    id: 'forest_department',
    name: 'Forest Department',
    image: '/img/services/forest.png',
  },
  { id: 'taxi', name: 'Taxi', image: '/img/services/taxi.png' },
  {
    id: 'fire_service',
    name: 'Fire Service',
    image: '/img/services/fire.png',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    image: '/img/services/electrician.png',
  },
  { id: 'plumber', name: 'Plumber', image: '/img/services/plumber.png' },
  {
    id: 'house_made',
    name: 'House Made',
    image: '/img/services/house_maid.png',
  },
  { id: 'gas', name: 'Gas', image: '/img/services/gas.png' },
  { id: 'cm_cell', name: 'CM Cell', image: '/img/services/cm_cell.png' },
  { id: 'mechanic', name: 'Mechanic', image: '/img/services/mechanic.png' },
  { id: '8', name: 'car_service', image: '' },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(MembershipApplication)
    private readonly appRepo: Repository<MembershipApplication>,
    @InjectRepository(Visitor)
    private readonly visitorRepo: Repository<Visitor>,
  ) {}

  async onModuleInit() {
    const userCount = await this.adminRepo.count();
    if (userCount === 0) {
      await this.adminRepo.save(SEED_USERS.map((u) => this.adminRepo.create(u)));
      console.log('Seeded admin_users');
    }

    const catCount = await this.categoryRepo.count();
    if (catCount === 0) {
      await this.categoryRepo.save(
        SEED_CATEGORIES.map((c) => this.categoryRepo.create(c)),
      );
      console.log('Seeded categories');
    }

    const appCount = await this.appRepo.count();
    if (appCount === 0) {
      await this.appRepo.save(
        this.appRepo.create({
          id: '1786024196725',
          name: 'Mageshwaran M',
          mobile: '9943366427',
          refId: '89iuery498674',
          status: 'pending',
          createdAt: new Date('2026-08-06T13:49:56.725Z'),
        }),
      );
      console.log('Seeded membership applications');
    }

    const visitorCount = await this.visitorRepo.count();
    if (visitorCount === 0) {
      await this.visitorRepo.save(
        this.visitorRepo.create({
          count: 0,
          lastReset: String(Date.now()),
        }),
      );
    }
  }
}
