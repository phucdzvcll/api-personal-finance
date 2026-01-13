import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { UserRepository } from "./repositories/user.repository";
import { UserEntity } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if username already exists
    const existingUserByUsername: UserEntity | null = await this.userRepository.findByUsername(createUserDto.username);
    if (existingUserByUsername) {
      throw new ConflictException("Username already exists");
    }

    // Check if email already exists
    const existingUserByEmail: UserEntity | null = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new ConflictException("Email already exists");
    }

    // Hash password
    const saltRounds: number = 10;
    const passwordHash: string = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user: UserEntity = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash,
    });

    const savedUser: UserEntity = await this.userRepository.save(user);

    // Return user without password
    return this.toResponseDto(savedUser);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async validatePassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  private toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
