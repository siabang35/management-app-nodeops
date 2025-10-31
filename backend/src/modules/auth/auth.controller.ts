import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import type { SignUpDto } from "./dto/sign-up.dto"
import type { SignInDto } from "./dto/sign-in.dto"
import { JwtGuard } from "./jwt.guard"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Get('profile/:id')
  async getProfile(@Param('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtGuard)
  @Patch("profile")
  async updateProfile(@Req() req: any, @Body() updates: any) {
    return this.authService.updateProfile(req.user.sub, updates)
  }
}
