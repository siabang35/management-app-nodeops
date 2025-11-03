import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { SupabaseService } from "../supabase/supabase.service"
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
        options: {
          data: {
            full_name: dto.fullName,
            role: dto.role,
          }
        }
      })

      if (error) throw new BadRequestException(error.message)

      const { user } = data

      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          full_name: dto.fullName,
          role: dto.role,
          status: "offline",
        },
      ])

      if (insertError) throw new BadRequestException(insertError.message)

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: dto.role,
        fullName: dto.fullName,
      })

      return {
        user: {
          ...user,
          role: dto.role,
          full_name: dto.fullName,
          user_metadata: {
            ...user.user_metadata,
            role: dto.role,
            fullName: dto.fullName,
          }
        },
        token,
        message: "Sign up successful.",
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

      // Get complete user data including role
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (userError) throw new BadRequestException(userError.message)

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: userData.role,
        fullName: userData.full_name,
      })

      return {
        user: {
          ...user,
          role: userData.role,
          full_name: userData.full_name,
          user_metadata: {
            ...user.user_metadata,
            role: userData.role,
            fullName: userData.full_name,
          }
        },
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

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) throw new BadRequestException(error.message)

      return data
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async updateProfile(userId: string, updates: any) {
    try {
      const supabase = this.supabaseService.getClient()

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single()

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
