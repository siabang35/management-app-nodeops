import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { SignUpDto } from "./dto/sign-up.dto"
import { SignInDto } from "./dto/sign-in.dto"
import { JwtGuard } from "./jwt.guard"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: "User registration" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getProfile(@Param('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtGuard)
  @Patch("profile")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateProfile(@Req() req: any, @Body() updates: any) {
    return this.authService.updateProfile(req.user.sub, updates)
  }
}
