import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { ServiceContact } from '../entities/service-contact.entity';

@Controller('api')
export class CategoriesController {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ServiceContact)
    private readonly contactRepo: Repository<ServiceContact>,
  ) {}

  @Get('categories')
  async getCategories() {
    return this.categoryRepo.find();
  }

  @Post('categories')
  async createCategory(@Body() body: { id?: string; name?: string }) {
    const { id, name } = body;
    if (!id || !name) return { error: 'Missing id or name' };
    const exists = await this.categoryRepo.findOne({ where: { id } });
    if (exists) return { error: 'Category ID already exists' };
    const cat = await this.categoryRepo.save(
      this.categoryRepo.create({ id, name }),
    );
    return cat;
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) return { error: 'Category not found' };
    cat.name = body.name || cat.name;
    return this.categoryRepo.save(cat);
  }

  @Delete('categories/:id')
  @HttpCode(204)
  async deleteCategory(@Param('id') id: string) {
    await this.categoryRepo.delete({ id });
  }

  @Get('members')
  async getServiceMembers() {
    return this.contactRepo.find();
  }

  @Get('members/:category')
  async getByCategory(@Param('category') category: string) {
    return this.contactRepo.find({ where: { category } });
  }

  @Post('members')
  async createMember(
    @Body() body: { name?: string; phone?: string; category?: string },
  ) {
    const { name, phone, category } = body;
    if (!name || !phone || !category) {
      return { error: 'Missing required fields' };
    }
    const newMember = await this.contactRepo.save(
      this.contactRepo.create({
        id: Date.now().toString(),
        name,
        phone,
        category,
      }),
    );
    return newMember;
  }

  @Put('members/:id')
  async updateMember(@Param('id') id: string, @Body() body: any) {
    const member = await this.contactRepo.findOne({ where: { id } });
    if (!member) return { error: 'Member not found' };
    Object.assign(member, body);
    return this.contactRepo.save(member);
  }

  @Delete('members/:id')
  @HttpCode(204)
  async deleteMember(@Param('id') id: string) {
    await this.contactRepo.delete({ id });
  }
}
