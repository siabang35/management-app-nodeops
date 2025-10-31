import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common"
import type { MindshareService } from "./mindshare.service"

@Controller("mindshare")
export class MindshareController {
  constructor(private mindshareService: MindshareService) {}

  @Get("leaderboard")
  async getLeaderboard(limit?: string) {
    return this.mindshareService.getLeaderboard(limit ? Number.parseInt(limit) : 25)
  }

  @Get("profile/:userId")
  async getUserProfile(userId: string) {
    return this.mindshareService.getUserProfile(userId)
  }

  @Post('profile')
  async createMindshareUser(
    @Body() body: { userId: string; walletAddress: string },
  ) {
    return this.mindshareService.createMindshareUser(
      body.userId,
      body.walletAddress,
    );
  }

  @Patch("profile/:userId")
  async updateUserProfile(@Param('userId') userId: string, @Body() updates: any) {
    return this.mindshareService.updateUserProfile(userId, updates)
  }

  @Patch("score/:userId")
  async updateMindshareScore(@Param('userId') userId: string, @Body() body: { points: number }) {
    return this.mindshareService.updateMindshareScore(userId, body.points)
  }
}
