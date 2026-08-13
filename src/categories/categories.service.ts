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

  private matchesCategory(
    contactCategory: string,
    category: Category,
  ) {
    const value = (contactCategory || '').trim().toLowerCase();
    return (
      value === String(category.id).toLowerCase() ||
      value === String(category.name).toLowerCase()
    );
  }

  async getCategories() {
    const [categories, contacts] = await Promise.all([
      this.categoryRepo.find(),
      this.contactRepo.find(),
    ]);

    return categories.map((category) => {
      const count = contacts.filter((contact) =>
        this.matchesCategory(contact.category, category),
      ).length;
      return {
        ...category,
        count,
        providers_count: count,
      };
    });
  }

  async createCategory(body: { id?: string; name?: string }) {
    let { id, name } = body;
    if (!name?.trim()) return { error: 'Missing name' };

    name = name.trim();
    if (!id?.trim()) {
      id = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
    }

    const exists = await this.categoryRepo.findOne({ where: { id } });
    if (exists) return { error: 'Category ID already exists' };
    return this.categoryRepo.save(
      this.categoryRepo.create({ id, name, image: '' }),
    );
  }

  async updateCategory(id: string, body: { name?: string }) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) return { error: 'Category not found' };
    cat.name = body.name || cat.name;
    return this.categoryRepo.save(cat);
  }

  async deleteCategory(id: string) {
    const linked = await this.contactRepo.count({ where: { category: id } });
    if (linked > 0) {
      return { error: 'Remove providers from this category first.' };
    }
    await this.categoryRepo.delete({ id });
    return { success: true };
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
        name: name.trim(),
        phone: phone.trim(),
        category: String(category).trim(),
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
    return { success: true };
  }
}
