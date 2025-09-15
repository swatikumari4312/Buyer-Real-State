import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import { eq, and, or, ilike, desc, count } from "drizzle-orm"
import { buyerFilterSchema } from "@/lib/validations/buyer"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = buyerFilterSchema.parse({
      search: searchParams.get("search") || "",
      city: searchParams.get("city") || "",
      propertyType: searchParams.get("propertyType") || "",
      status: searchParams.get("status") || "",
      timeline: searchParams.get("timeline") || "",
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
      sortBy: searchParams.get("sortBy") || "updatedAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

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

    // Get total count
    const totalCountResult = await db.select({ count: count() }).from(buyers).where(whereClause)

    const totalCount = totalCountResult[0].count

    // Calculate pagination
    const limit = filters.limit
    const offset = (filters.page - 1) * limit
    const totalPages = Math.ceil(totalCount / limit)

    // Get buyers
    const buyersResult = await db
      .select()
      .from(buyers)
      .where(whereClause)
      .orderBy(filters.sortOrder === "desc" ? desc(buyers.updatedAt) : buyers.updatedAt)
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      buyers: buyersResult,
      pagination: {
        currentPage: filters.page,
        totalPages,
        totalCount,
        limit,
      },
    })
  } catch (error) {
    console.error("Search buyers error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
