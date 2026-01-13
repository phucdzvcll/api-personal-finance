import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserEntity } from "../../modules/users/entities/user.entity";

interface RequestWithUser extends Request {
  user: UserEntity;
}

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserEntity => {
  const request: RequestWithUser = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});
