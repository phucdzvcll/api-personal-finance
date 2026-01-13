import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryRepository } from "./repositories/category.repository";
import { CategoryEntity, CategoryType } from "./entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async create(userId: number, createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Check if category name already exists for this user and type
    const existingCategory: CategoryEntity | null = await this.categoryRepository.findByNameAndUserIdAndType(
      createCategoryDto.name,
      userId,
      createCategoryDto.type
    );

    if (existingCategory) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists for type "${createCategoryDto.type}"`);
    }

    // Create category
    const category: CategoryEntity = this.categoryRepository.create({
      userId,
      name: createCategoryDto.name,
      type: createCategoryDto.type,
      icon: createCategoryDto.icon ?? null,
      color: createCategoryDto.color ?? null,
    });

    const savedCategory: CategoryEntity = await this.categoryRepository.save(category);

    return this.toResponseDto(savedCategory);
  }

  async findAll(userId: number, type?: CategoryType): Promise<CategoryResponseDto[]> {
    const categories: CategoryEntity[] = type
      ? await this.categoryRepository.findByUserIdAndType(userId, type)
      : await this.categoryRepository.findByUserId(userId);

    return categories.map((category) => this.toResponseDto(category));
  }

  async findOne(id: number, userId: number): Promise<CategoryResponseDto> {
    const category: CategoryEntity | null = await this.categoryRepository.findByIdAndUserId(id, userId);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.toResponseDto(category);
  }

  async update(id: number, userId: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category: CategoryEntity | null = await this.categoryRepository.findByIdAndUserId(id, userId);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // If name is being updated, check for uniqueness per user and type
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory: CategoryEntity | null = await this.categoryRepository.findByNameAndUserIdAndType(
        updateCategoryDto.name,
        userId,
        category.type
      );

      if (existingCategory) {
        throw new ConflictException(`Category with name "${updateCategoryDto.name}" already exists for type "${category.type}"`);
      }
    }

    // Update category (type cannot be changed per business rules)
    Object.assign(category, {
      name: updateCategoryDto.name ?? category.name,
      icon: updateCategoryDto.icon !== undefined ? updateCategoryDto.icon : category.icon,
      color: updateCategoryDto.color !== undefined ? updateCategoryDto.color : category.color,
    });

    const updatedCategory: CategoryEntity = await this.categoryRepository.save(category);

    return this.toResponseDto(updatedCategory);
  }

  async remove(id: number, userId: number): Promise<void> {
    const category: CategoryEntity | null = await this.categoryRepository.findByIdAndUserId(id, userId);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category is used by any transactions
    const transactionCount: number = await this.categoryRepository.countTransactionsByCategoryId(id);

    if (transactionCount > 0) {
      throw new BadRequestException(`Cannot delete category "${category.name}" because it is used by ${transactionCount} transaction(s)`);
    }

    await this.categoryRepository.remove(category);
  }

  async createDefaultCategories(userId: number): Promise<CategoryEntity[]> {
    const defaultCategories: Array<{ name: string; type: CategoryType; icon?: string; color?: string }> = [
      // Expense categories
      { name: "Food", type: CategoryType.EXPENSE, icon: "food", color: "#FF5733" },
      { name: "Transportation", type: CategoryType.EXPENSE, icon: "transportation", color: "#3498DB" },
      { name: "Shopping", type: CategoryType.EXPENSE, icon: "shopping", color: "#9B59B6" },
      { name: "Others", type: CategoryType.EXPENSE, icon: "others", color: "#95A5A6" },
      // Income categories
      { name: "Salary", type: CategoryType.INCOME, icon: "salary", color: "#2ECC71" },
      { name: "Other Income", type: CategoryType.INCOME, icon: "income", color: "#1ABC9C" },
    ];

    const createdCategories: CategoryEntity[] = [];

    for (const defaultCategory of defaultCategories) {
      // Check if category already exists
      const existingCategory: CategoryEntity | null = await this.categoryRepository.findByNameAndUserIdAndType(
        defaultCategory.name,
        userId,
        defaultCategory.type
      );

      if (!existingCategory) {
        const category: CategoryEntity = this.categoryRepository.create({
          userId,
          name: defaultCategory.name,
          type: defaultCategory.type,
          icon: defaultCategory.icon ?? null,
          color: defaultCategory.color ?? null,
        });

        const savedCategory: CategoryEntity = await this.categoryRepository.save(category);
        createdCategories.push(savedCategory);
      }
    }

    return createdCategories;
  }

  private toResponseDto(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
