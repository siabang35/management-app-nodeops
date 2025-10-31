import { Injectable } from "@nestjs/common"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  getClient(): SupabaseClient {
    return this.supabase
  }

  async query(table: string) {
    return this.supabase.from(table)
  }
}
