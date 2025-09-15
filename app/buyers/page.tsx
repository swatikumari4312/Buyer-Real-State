import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import { eq, and, or, ilike, desc, asc, count } from "drizzle-orm"
import { BuyersFilters } from "@/components/buyers/buyers-filters"
import { BuyersTable } from "@/components/buyers/buyers-table"
import { buyerFilterSchema } from "@/lib/validations/buyer"

interface BuyersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const params = await searchParams

  // Parse and validate search parameters
  const filters = buyerFilterSchema.parse({
    search: params.search || "",
    city: params.city || "",
    propertyType: params.propertyType || "",
    status: params.status || "",
    timeline: params.timeline || "",
    page: params.page ? Number.parseInt(params.page as string) : 1,
    sortBy: params.sortBy || "updatedAt",
    sortOrder: params.sortOrder || "desc",
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

  // Build order by
  const orderBy =
    filters.sortOrder === "desc"
      ? desc(buyers[filters.sortBy as keyof typeof buyers])
      : asc(buyers[filters.sortBy as keyof typeof buyers])

  // Get buyers
  const buyersResult = await db.select().from(buyers).where(whereClause).orderBy(orderBy).limit(limit).offset(offset)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Leads</h1>
        <p className="text-muted-foreground">Manage your buyer leads ({totalCount} total)</p>
      </div>

      <BuyersFilters />

      {buyersResult.length > 0 ? (
        <BuyersTable buyers={buyersResult} totalCount={totalCount} currentPage={filters.page} totalPages={totalPages} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.city || filters.propertyType || filters.status || filters.timeline
              ? "No leads found matching your filters"
              : "No leads found"}
          </p>
          {!filters.search && !filters.city && !filters.propertyType && !filters.status && !filters.timeline && (
            <p className="text-sm text-muted-foreground mb-4">Get started by adding your first lead</p>
          )}
        </div>
      )}
    </div>
  )
}
