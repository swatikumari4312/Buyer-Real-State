import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers, buyerHistory } from "@/lib/db/schema"
import { buyerSchema } from "@/lib/validations/buyer"
import { rateLimit } from "@/lib/utils/rate-limit"

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute per user
  const rateLimitResult = rateLimit(request, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => req.headers.get("authorization") || req.ip || "anonymous",
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      },
    )
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = buyerSchema.parse(body)

    // Create buyer
    const newBuyer = await db
      .insert(buyers)
      .values({
        ...validatedData,
        ownerId: user.id,
      })
      .returning()

    // Create history entry
    await db.insert(buyerHistory).values({
      buyerId: newBuyer[0].id,
      changedBy: user.id,
      diff: { action: "created", data: validatedData },
    })

    return NextResponse.json(
      { buyer: newBuyer[0] },
      {
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      },
    )
  } catch (error: any) {
    console.error("Create buyer error:", error)

    if (error.errors) {
      const fieldErrors: Record<string, string> = {}
      error.errors.forEach((err: any) => {
        fieldErrors[err.path[0]] = err.message
      })
      return NextResponse.json({ errors: fieldErrors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create buyer" }, { status: 500 })
  }
}
