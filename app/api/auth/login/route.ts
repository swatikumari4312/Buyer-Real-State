import { type NextRequest, NextResponse } from "next/server"
import { login } from "@/lib/auth/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await login(email, password)

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
}
