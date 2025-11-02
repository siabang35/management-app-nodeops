import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger"
import { MindshareService } from "./mindshare.service"

@ApiTags("mindshare")
@Controller("mindshare")
export class MindshareController {
  constructor(private mindshareService: MindshareService) {}

  @Get("leaderboard")
  @ApiOperation({ summary: "Get mindshare leaderboard" })
  @ApiQuery({ name: "limit", required: false, description: "Number of users to return (default: 25)" })
  @ApiResponse({ status: 200, description: "Leaderboard retrieved successfully" })
  async getLeaderboard(@Query("limit") limit?: string) {
    return this.mindshareService.getLeaderboard(limit ? Number.parseInt(limit) : 25)
  }

  @Get("profile/:userId")
  @ApiOperation({ summary: "Get user mindshare profile" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "User profile retrieved successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserProfile(@Param('userId') userId: string) {
    return this.mindshareService.getUserProfile(userId)
  }

  @Post('profile')
  @ApiOperation({ summary: "Create a new mindshare user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async createMindshareUser(
    @Body() body: { userId: string; walletAddress: string },
  ) {
    return this.mindshareService.createMindshareUser(
      body.userId,
      body.walletAddress,
    );
  }

  @Patch("profile/:userId")
  @ApiOperation({ summary: "Update user mindshare profile" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUserProfile(@Param('userId') userId: string, @Body() updates: any) {
    return this.mindshareService.updateUserProfile(userId, updates)
  }

  @Patch("score/:userId")
  @ApiOperation({ summary: "Update user mindshare score" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Score updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateMindshareScore(@Param('userId') userId: string, @Body() body: { points: number }) {
    return this.mindshareService.updateMindshareScore(userId, body.points)
  }

  // Web3 Wallet endpoints
  @Post("wallet/connect")
  @ApiOperation({ summary: "Connect a Web3 wallet" })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'walletAddress', 'walletProvider', 'chainId', 'networkName'],
      properties: {
        userId: { type: 'string' },
        walletAddress: { type: 'string' },
        walletProvider: { type: 'string', enum: ['metamask', 'walletconnect'] },
        chainId: { type: 'number' },
        networkName: { type: 'string' },
        isPrimary: { type: 'boolean', default: false },
        signature: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 201, description: "Wallet connected successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async connectWallet(@Body() body: {
    userId: string
    walletAddress: string
    walletProvider: string
    chainId: number
    networkName: string
    isPrimary?: boolean
    signature?: string
  }) {
    return this.mindshareService.connectWallet(body.userId, body)
  }

  @Delete("wallet/:walletAddress")
  @ApiOperation({ summary: "Disconnect a Web3 wallet" })
  @ApiParam({ name: "walletAddress", description: "Wallet address to disconnect" })
  @ApiQuery({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Wallet disconnected successfully" })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  async disconnectWallet(
    @Param('walletAddress') walletAddress: string,
    @Query('userId') userId: string
  ) {
    return this.mindshareService.disconnectWallet(userId, walletAddress)
  }

  @Get("wallets/:userId")
  @ApiOperation({ summary: "Get user wallets" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Wallets retrieved successfully" })
  async getUserWallets(@Param('userId') userId: string) {
    return this.mindshareService.getUserWallets(userId)
  }

  // Ambassador endpoints
  @Get("ambassador/:userId")
  @ApiOperation({ summary: "Get ambassador profile" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Ambassador profile retrieved successfully" })
  @ApiResponse({ status: 404, description: "Ambassador profile not found" })
  async getAmbassadorProfile(@Param('userId') userId: string) {
    return this.mindshareService.getAmbassadorProfile(userId)
  }

  @Post("activity")
  @ApiOperation({ summary: "Create ambassador activity" })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'walletAddress', 'activityType', 'description', 'pointsEarned'],
      properties: {
        userId: { type: 'string' },
        walletAddress: { type: 'string' },
        activityType: { type: 'string', enum: ['transaction', 'nft_purchase', 'defi_interaction', 'social_share'] },
        description: { type: 'string' },
        pointsEarned: { type: 'number' },
        transactionHash: { type: 'string' },
        chainId: { type: 'number' },
        contractAddress: { type: 'string' },
        tokenAmount: { type: 'number' },
        tokenSymbol: { type: 'string' },
        usdValue: { type: 'number' },
        metadata: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 201, description: "Activity created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async createAmbassadorActivity(@Body() body: {
    userId: string
    walletAddress: string
    activityType: string
    description: string
    pointsEarned: number
    transactionHash?: string
    chainId?: number
    contractAddress?: string
    tokenAmount?: number
    tokenSymbol?: string
    usdValue?: number
    metadata?: any
  }) {
    return this.mindshareService.createAmbassadorActivity(body.userId, body)
  }
}
