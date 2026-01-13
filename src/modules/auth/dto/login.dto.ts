import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "Username or email",
    example: "johndoe",
  })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({
    description: "User password",
    example: "SecurePassword123!",
  })
  @IsString()
  @MinLength(8)
  password: string;
}
