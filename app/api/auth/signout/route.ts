import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // This route can be extended to blacklist tokens or clean up server-side sessions

    return NextResponse.json(
      {
        success: true,
        message: "Signed out successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[API] Sign out exception:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during sign out" },
      { status: 500 },
    )
  }
}
