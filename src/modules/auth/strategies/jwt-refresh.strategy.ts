import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { UsersService } from "../../users/users.service";
import { UserEntity } from "../../users/entities/user.entity";

interface RefreshTokenRequestBody {
  refreshToken?: string;
}

type RequestWithBody = Request<unknown, unknown, RefreshTokenRequestBody>;

export interface JwtRefreshPayload {
  sub: number;
  username: string;
  type: "refresh";
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    const jwtSecret: string = configService.get<string>("jwt.secret") || "";

    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: RequestWithBody, payload: JwtRefreshPayload): Promise<UserEntity> {
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    const refreshToken: string | undefined = req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required");
    }

    const userId: number = payload.sub;
    const user: UserEntity | null = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return user;
  }
}
