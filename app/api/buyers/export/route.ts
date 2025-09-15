import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import { eq, and, or, ilike, desc, asc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse filters (same as search endpoint but without pagination)
    const filters = {
      search: searchParams.get("search") || "",
      city: searchParams.get("city") || "",
      propertyType: searchParams.get("propertyType") || "",
      status: searchParams.get("status") || "",
      timeline: searchParams.get("timeline") || "",
      sortBy: searchParams.get("sortBy") || "updatedAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    }

    // Build where conditions
    const whereConditions = [eq(buyers.ownerId, user.id)]

    if (filters.search) {
      whereConditions.push(
        or(
          ilike(buyers.fullName, `%${filters.search}%`),
          ilike(buyers.phone, `%${filters.search}%`),
          ilike(buyers.email, `%${filters.search}%`),
        )!,
      )
    }

    if (filters.city) {
      whereConditions.push(eq(buyers.city, filters.city as any))
    }

    if (filters.propertyType) {
      whereConditions.push(eq(buyers.propertyType, filters.propertyType as any))
    }

    if (filters.status) {
      whereConditions.push(eq(buyers.status, filters.status as any))
    }

    if (filters.timeline) {
      whereConditions.push(eq(buyers.timeline, filters.timeline as any))
    }

    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]

    // Build order by
    const orderBy =
      filters.sortOrder === "desc"
        ? desc(buyers[filters.sortBy as keyof typeof buyers])
        : asc(buyers[filters.sortBy as keyof typeof buyers])

    // Get all matching buyers (no pagination for export)
    const buyersResult = await db.select().from(buyers).where(whereClause).orderBy(orderBy)

    return NextResponse.json(buyersResult)
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
