import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { UserEntity } from "../users/entities/user.entity";
import { JwtPayload } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    try {
      const user: UserResponseDto = await this.usersService.create(createUserDto);

      const accessToken: string = await this.generateToken({
        sub: user.id,
        username: user.username,
      });

      return {
        accessToken,
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error("Failed to register user");
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Try to find user by username first
    let user: UserEntity | null = await this.usersService.findByUsername(loginDto.usernameOrEmail);

    // If not found by username, try to find by email
    if (!user) {
      const isEmail: boolean = loginDto.usernameOrEmail.includes("@");
      if (isEmail) {
        user = await this.usersService.findByEmail(loginDto.usernameOrEmail);
      }
    }

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValidPassword: boolean = await this.usersService.validatePassword(loginDto.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken: string = await this.generateToken({
      sub: user.id,
      username: user.username,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  private async generateToken(payload: JwtPayload): Promise<string> {
    const expiresInConfig: string = this.configService.get<string>("jwt.expiresIn") || "7d";
    const expiresIn: StringValue | number = expiresInConfig as StringValue;
    return this.jwtService.signAsync(payload, {
      expiresIn,
    });
  }
}
