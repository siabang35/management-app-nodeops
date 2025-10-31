import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { SupabaseService } from "../supabase/supabase.service"
import type { SignUpDto } from "./dto/sign-up.dto"
import type { SignInDto } from "./dto/sign-in.dto"

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data, error } = await supabase.auth.signUp({
        email: dto.email,
        password: dto.password,
      })

      if (error) throw new BadRequestException(error.message)

      const { user } = data

      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          full_name: dto.fullName,
          role: "member",
          status: "offline",
        },
      ])

      if (insertError) throw new BadRequestException(insertError.message)

      return {
        user,
        message: "Sign up successful. Please check your email to confirm.",
      }
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async signIn(dto: SignInDto) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      })

      if (error) throw new UnauthorizedException("Invalid credentials")

      const { user, session } = data

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      })

      return {
        user,
        token,
        session,
      }
    } catch (error: any) {
      throw new UnauthorizedException(error.message)
    }
  }

  async getProfile(userId: string) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw new BadRequestException(error.message)

      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async updateProfile(userId: string, updates: any) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      if (error) throw new BadRequestException(error.message)

      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async getUser(userId: string) {
    return this.getProfile(userId)
  }
}
