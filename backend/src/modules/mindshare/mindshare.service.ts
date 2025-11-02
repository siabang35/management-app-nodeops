import { Injectable, BadRequestException } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"

@Injectable()
export class MindshareService {
  constructor(private supabaseService: SupabaseService) {}

  async getLeaderboard(limit = 25) {
    try {
      const supabase = this.supabaseService.getClient()
      const { data, error } = await supabase
        .from("mindshare_users")
        .select(`
          *,
          user_wallets!inner(wallet_address, wallet_provider, is_primary)
        `)
        .order("mindshare_score", { ascending: false })
        .limit(limit)

      if (error) throw new BadRequestException(error.message)

      return data.map((user, index) => ({
        ...user,
        rank: index + 1,
        primary_wallet: user.user_wallets?.find((w: any) => w.is_primary) || user.user_wallets?.[0],
      }))
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async getUserProfile(userId: string) {
    try {
      const supabase = this.supabaseService.getClient()
      const { data, error } = await supabase
        .from("mindshare_users")
        .select(`
          *,
          user_wallets(*),
          ambassador_program(*)
        `)
        .eq("user_id", userId)
        .single()

      if (error) throw new BadRequestException(error.message)
      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async updateMindshareScore(userId: string, points: number) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data: currentUser } = await supabase
        .from("mindshare_users")
        .select("mindshare_score")
        .eq("user_id", userId)
        .single()

      const newScore = (currentUser?.mindshare_score || 0) + points

      const { data, error } = await supabase
        .from("mindshare_users")
        .update({ mindshare_score: newScore })
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw new BadRequestException(error.message)
      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    try {
      const supabase = this.supabaseService.getClient()
      const { data, error } = await supabase
        .from("mindshare_users")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw new BadRequestException(error.message)
      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async createMindshareUser(userId: string, walletAddress: string) {
    try {
      const supabase = this.supabaseService.getClient()
      const promoCode = this.generatePromoCode()

      const { data, error } = await supabase
        .from("mindshare_users")
        .insert([
          {
            user_id: userId,
            promo_code: promoCode,
            mindshare_score: 0,
            is_verified: false,
          },
        ])
        .select()
        .single()

      if (error) throw new BadRequestException(error.message)

      // Create initial wallet entry
      if (walletAddress) {
        await this.connectWallet(userId, {
          walletAddress,
          walletProvider: 'metamask',
          chainId: 1,
          networkName: 'ethereum',
          isPrimary: true,
        })
      }

      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async connectWallet(userId: string, walletData: {
    walletAddress: string
    walletProvider: string
    chainId: number
    networkName: string
    isPrimary?: boolean
    signature?: string
  }) {
    try {
      const supabase = this.supabaseService.getClient()

      // Get mindshare user
      const { data: mindshareUser } = await supabase
        .from("mindshare_users")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (!mindshareUser) {
        throw new BadRequestException("Mindshare user not found")
      }

      // If setting as primary, unset other primary wallets
      if (walletData.isPrimary) {
        await supabase
          .from("user_wallets")
          .update({ is_primary: false })
          .eq("user_id", userId)
      }

      const { data, error } = await supabase
        .from("user_wallets")
        .upsert([
          {
            user_id: userId,
            mindshare_user_id: mindshareUser.id,
            wallet_address: walletData.walletAddress,
            wallet_provider: walletData.walletProvider,
            chain_id: walletData.chainId,
            network_name: walletData.networkName,
            is_primary: walletData.isPrimary || false,
            is_verified: !!walletData.signature,
            verification_signature: walletData.signature,
            connected_at: new Date(),
            last_used_at: new Date(),
          },
        ])
        .select()
        .single()

      if (error) throw new BadRequestException(error.message)
      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async disconnectWallet(userId: string, walletAddress: string) {
    try {
      const supabase = this.supabaseService.getClient()

      const { error } = await supabase
        .from("user_wallets")
        .delete()
        .eq("user_id", userId)
        .eq("wallet_address", walletAddress)

      if (error) throw new BadRequestException(error.message)
      return { success: true }
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async getUserWallets(userId: string) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", userId)
        .order("is_primary", { ascending: false })
        .order("connected_at", { ascending: false })

      if (error) throw new BadRequestException(error.message)
      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async getAmbassadorProfile(userId: string) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data: mindshareUser } = await supabase
        .from("mindshare_users")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (!mindshareUser) {
        throw new BadRequestException("Mindshare user not found")
      }

      const { data, error } = await supabase
        .from("ambassador_program")
        .select(`
          *,
          ambassador_referrals(*),
          ambassador_activities(*),
          ambassador_rewards(*)
        `)
        .eq("mindshare_user_id", mindshareUser.id)
        .single()

      if (error) throw new BadRequestException(error.message)
      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async createAmbassadorActivity(userId: string, activityData: {
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
    try {
      const supabase = this.supabaseService.getClient()

      const { data: ambassador } = await supabase
        .from("ambassador_program")
        .select("id")
        .eq("mindshare_user_id", (
          await supabase
            .from("mindshare_users")
            .select("id")
            .eq("user_id", userId)
            .single()
        ).data?.id)
        .single()

      if (!ambassador) {
        throw new BadRequestException("Ambassador profile not found")
      }

      const { data, error } = await supabase
        .from("ambassador_activities")
        .insert([
          {
            ambassador_id: ambassador.id,
            wallet_address: activityData.walletAddress,
            activity_type: activityData.activityType,
            activity_description: activityData.description,
            points_earned: activityData.pointsEarned,
            transaction_hash: activityData.transactionHash,
            chain_id: activityData.chainId,
            contract_address: activityData.contractAddress,
            token_amount: activityData.tokenAmount,
            token_symbol: activityData.tokenSymbol,
            usd_value: activityData.usdValue,
            metadata: activityData.metadata,
            verified: true,
          },
        ])
        .select()
        .single()

      if (error) throw new BadRequestException(error.message)

      // Update mindshare score
      await this.updateMindshareScore(userId, activityData.pointsEarned)

      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  private generatePromoCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
}
