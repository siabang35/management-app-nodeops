"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serverApiClient } from "@/lib/server-api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getMindshareLeaderboard(limit = 25) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/mindshare/leaderboard?limit=${limit}`)
    }
  } catch (error) {
    console.warn("[getMindshareLeaderboard] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase
      .from("mindshare_leaderboard")
      .select(
        `
        *,
        mindshare_users (
          id,
          user_id,
          wallet_address,
          email,
          x_handle,
          telegram_id,
          discord_id,
          discord_username,
          profile_avatar_url,
          mindshare_score,
          rank
        )
      `,
      )
      .order("current_rank", { ascending: true })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getMindshareUserProfile(userId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/mindshare/profile/${userId}`)
    }
  } catch (error) {
    console.warn("[getMindshareUserProfile] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase.from("mindshare_users").select("*").eq("user_id", userId).single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function updateMindshareScore(userId: string, pointsEarned: number) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.patch(`/mindshare/score/${userId}`, { points: pointsEarned })
    }
  } catch (error) {
    console.warn("[updateMindshareScore] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data: user, error: fetchError } = await supabase
      .from("mindshare_users")
      .select("mindshare_score")
      .eq("user_id", userId)
      .single()

    if (fetchError) throw fetchError

    const newScore = (user.mindshare_score || 0) + pointsEarned

    const { data, error } = await supabase
      .from("mindshare_users")
      .update({ mindshare_score: newScore, updated_at: new Date() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    await supabase.from("mindshare_activities").insert([
      {
        mindshare_user_id: data.id,
        activity_type: "score_update",
        points_earned: pointsEarned,
        activity_description: `Score updated by ${pointsEarned} points`,
      },
    ])

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Web3 Wallet Server Actions
export async function connectWallet(walletData: {
  userId: string
  walletAddress: string
  walletProvider: string
  chainId: number
  networkName: string
  isPrimary?: boolean
  signature?: string
}) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.post("/mindshare/wallet/connect", walletData)
    }
  } catch (error) {
    console.warn("[connectWallet] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase
      .from("web3_wallets")
      .insert([{
        user_id: walletData.userId,
        wallet_address: walletData.walletAddress,
        wallet_provider: walletData.walletProvider,
        chain_id: walletData.chainId,
        network_name: walletData.networkName,
        is_primary: walletData.isPrimary || false,
        signature: walletData.signature,
        connected_at: new Date(),
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function disconnectWallet(userId: string, walletAddress: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.delete(`/mindshare/wallet/${walletAddress}?userId=${userId}`)
    }
  } catch (error) {
    console.warn("[disconnectWallet] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase
      .from("web3_wallets")
      .delete()
      .eq("user_id", userId)
      .eq("wallet_address", walletAddress)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getUserWallets(userId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/mindshare/wallets/${userId}`)
    }
  } catch (error) {
    console.warn("[getUserWallets] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase
      .from("web3_wallets")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("connected_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getAmbassadorProfile(userId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/mindshare/ambassador/${userId}`)
    }
  } catch (error) {
    console.warn("[getAmbassadorProfile] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase
      .from("mindshare_users")
      .select(`
        *,
        web3_wallets (*),
        mindshare_activities (*)
      `)
      .eq("user_id", userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function createAmbassadorActivity(activityData: {
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
  try {
    if (API_BASE_URL) {
      return await serverApiClient.post("/mindshare/activity", activityData)
    }
  } catch (error) {
    console.warn("[createAmbassadorActivity] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    // First get the mindshare user ID
    const { data: user, error: userError } = await supabase
      .from("mindshare_users")
      .select("id")
      .eq("user_id", activityData.userId)
      .single()

    if (userError) throw userError

    const { data, error } = await supabase
      .from("mindshare_activities")
      .insert([{
        mindshare_user_id: user.id,
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
        created_at: new Date(),
      }])
      .select()
      .single()

    if (error) throw error

    // Update user's total score
    await supabase.rpc('increment_mindshare_score', {
      user_id: activityData.userId,
      points: activityData.pointsEarned
    })

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
