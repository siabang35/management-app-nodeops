import { Injectable, BadRequestException } from "@nestjs/common"
import type { SupabaseService } from "../supabase/supabase.service"

@Injectable()
export class MindshareService {
  constructor(private supabaseService: SupabaseService) {}

  async getLeaderboard(limit = 25) {
    try {
      const supabase = this.supabaseService.getClient()
      const { data, error } = await supabase
        .from("mindshare_users")
        .select("*")
        .order("mindshare_score", { ascending: false })
        .limit(limit)

      if (error) throw new BadRequestException(error.message)

      return data.map((user, index) => ({
        ...user,
        rank: index + 1,
      }))
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async getUserProfile(userId: string) {
    try {
      const supabase = this.supabaseService.getClient()
      const { data, error } = await supabase.from("mindshare_users").select("*").eq("user_id", userId).single()

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
            wallet_address: walletAddress,
            promo_code: promoCode,
            mindshare_score: 0,
            is_verified: false,
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

  private generatePromoCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
}
