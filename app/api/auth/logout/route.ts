import { NextResponse } from "next/server"
import { logout } from "@/lib/auth/auth"

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
