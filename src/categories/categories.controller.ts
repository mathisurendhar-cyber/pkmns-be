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
import { CategoriesService } from './categories.service';

@Controller('api')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() body: { id?: string; name?: string }) {
    return this.categoriesService.createCategory(body);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.categoriesService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  @Get('members')
  getServiceMembers() {
    return this.categoriesService.getServiceMembers();
  }

  @Get('members/:category')
  getByCategory(@Param('category') category: string) {
    return this.categoriesService.getByCategory(category);
  }

  @Post('members')
  createMember(
    @Body() body: { name?: string; phone?: string; category?: string },
  ) {
    return this.categoriesService.createMember(body);
  }

  @Put('members/:id')
  updateMember(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.categoriesService.updateMember(id, body);
  }

  @Delete('members/:id')
  deleteMember(@Param('id') id: string) {
    return this.categoriesService.deleteMember(id);
  }
}
