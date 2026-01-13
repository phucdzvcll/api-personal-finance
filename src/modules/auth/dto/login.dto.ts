import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "Username or email",
    example: "Rhymastic",
    default: "Rhymastic",
  })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({
    description: "User password",
    example: "P@ssw0rd",
    default: "P@ssw0rd",
  })
  @IsString()
  @MinLength(8)
  password: string;
}
