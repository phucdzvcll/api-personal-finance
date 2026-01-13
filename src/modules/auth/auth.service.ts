import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";
import { UsersService } from "../users/users.service";
import { CategoriesService } from "../categories/categories.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { UserEntity } from "../users/entities/user.entity";
import { JwtPayload } from "./strategies/jwt.strategy";
import { JwtRefreshPayload } from "./strategies/jwt-refresh.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    try {
      const user: UserResponseDto = await this.usersService.create(createUserDto);

      // Create default categories for the new user
      await this.categoriesService.createDefaultCategories(user.id);

      const accessToken: string = await this.generateAccessToken({
        sub: user.id,
        username: user.username,
      });

      const refreshToken: string = await this.generateRefreshToken({
        sub: user.id,
        username: user.username,
      });

      await this.usersService.updateRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
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

    const accessToken: string = await this.generateAccessToken({
      sub: user.id,
      username: user.username,
    });

    const refreshToken: string = await this.generateRefreshToken({
      sub: user.id,
      username: user.username,
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const payload: JwtRefreshPayload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken);

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      const user: UserEntity | null = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const accessToken: string = await this.generateAccessToken({
        sub: user.id,
        username: user.username,
      });

      const newRefreshToken: string = await this.generateRefreshToken({
        sub: user.id,
        username: user.username,
      });

      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    const expiresInConfig: string = this.configService.get<string>("jwt.accessTokenExpiresIn") || "15m";
    const expiresIn: StringValue | number = expiresInConfig as StringValue;
    return this.jwtService.signAsync(payload, {
      expiresIn,
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const expiresInConfig: string = this.configService.get<string>("jwt.refreshTokenExpiresIn") || "7d";
    const expiresIn: StringValue | number = expiresInConfig as StringValue;
    const refreshPayload: JwtRefreshPayload = {
      ...payload,
      type: "refresh",
    };
    return this.jwtService.signAsync(refreshPayload, {
      expiresIn,
    });
  }
}
