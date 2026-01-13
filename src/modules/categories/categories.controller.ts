import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";
import { ListCategoriesQueryDto } from "./dto/list-categories-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { UserEntity } from "../users/entities/user.entity";

@ApiTags("categories")
@Controller("categories")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({
    status: 201,
    description: "Category successfully created",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Category name already exists for this user and type",
  })
  async create(@GetUser() user: UserEntity, @Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(user.id, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: "List all categories for the authenticated user" })
  @ApiQuery({ name: "type", required: false, enum: ["income", "expense"], description: "Filter by category type" })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
    type: [CategoryResponseDto],
  })
  async findAll(@GetUser() user: UserEntity, @Query() query: ListCategoriesQueryDto): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll(user.id, query.type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({ name: "id", type: "number", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  async findOne(@GetUser() user: UserEntity, @Param("id", ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id, user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a category" })
  @ApiParam({ name: "id", type: "number", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Category successfully updated",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  @ApiResponse({
    status: 409,
    description: "Category name already exists for this user and type",
  })
  async update(
    @GetUser() user: UserEntity,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, user.id, updateCategoryDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a category" })
  @ApiParam({ name: "id", type: "number", description: "Category ID" })
  @ApiResponse({
    status: 204,
    description: "Category successfully deleted",
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  @ApiResponse({
    status: 400,
    description: "Cannot delete category because it is used by transactions",
  })
  async remove(@GetUser() user: UserEntity, @Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.categoriesService.remove(id, user.id);
  }
}
