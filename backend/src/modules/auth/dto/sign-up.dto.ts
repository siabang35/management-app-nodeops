import { IsEmail, IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SignUpDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com"
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: "User password (minimum 8 characters)",
    example: "password123",
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({
    description: "User full name",
    example: "John Doe"
  })
  @IsString()
  fullName: string

  @ApiProperty({
    description: "User role",
    example: "ambassador"
  })
  @IsString()
  role: string
}
