import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { ServiceContact } from '../entities/service-contact.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ServiceContact)
    private readonly contactRepo: Repository<ServiceContact>,
  ) {}

  getCategories() {
    return this.categoryRepo.find();
  }

  async createCategory(body: { id?: string; name?: string }) {
    const { id, name } = body;
    if (!id || !name) return { error: 'Missing id or name' };
    const exists = await this.categoryRepo.findOne({ where: { id } });
    if (exists) return { error: 'Category ID already exists' };
    return this.categoryRepo.save(this.categoryRepo.create({ id, name }));
  }

  async updateCategory(id: string, body: { name?: string }) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) return { error: 'Category not found' };
    cat.name = body.name || cat.name;
    return this.categoryRepo.save(cat);
  }

  async deleteCategory(id: string) {
    await this.categoryRepo.delete({ id });
  }

  getServiceMembers() {
    return this.contactRepo.find();
  }

  getByCategory(category: string) {
    return this.contactRepo.find({ where: { category } });
  }

  async createMember(body: {
    name?: string;
    phone?: string;
    category?: string;
  }) {
    const { name, phone, category } = body;
    if (!name || !phone || !category) {
      return { error: 'Missing required fields' };
    }
    return this.contactRepo.save(
      this.contactRepo.create({
        id: Date.now().toString(),
        name,
        phone,
        category,
      }),
    );
  }

  async updateMember(id: string, body: Record<string, unknown>) {
    const member = await this.contactRepo.findOne({ where: { id } });
    if (!member) return { error: 'Member not found' };
    Object.assign(member, body);
    return this.contactRepo.save(member);
  }

  async deleteMember(id: string) {
    await this.contactRepo.delete({ id });
  }
}
