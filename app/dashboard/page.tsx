import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import { eq, desc, count, and } from "drizzle-orm"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentLeads } from "@/components/dashboard/recent-leads"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  // Get stats
  const totalLeads = await db.select({ count: count() }).from(buyers).where(eq(buyers.ownerId, user.id))

  const newLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(and(eq(buyers.ownerId, user.id), eq(buyers.status, "New")))

  const contactedLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(
      and(
        eq(buyers.ownerId, user.id),
        and(
          // Not new or dropped
          buyers.status !== "New",
          buyers.status !== "Dropped",
        ),
      ),
    )

  const convertedLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(and(eq(buyers.ownerId, user.id), eq(buyers.status, "Converted")))

  // Calculate conversion rate
  const conversionRate = totalLeads[0].count > 0 ? Math.round((convertedLeads[0].count / totalLeads[0].count) * 100) : 0

  // Get recent leads
  const recentLeads = await db
    .select()
    .from(buyers)
    .where(eq(buyers.ownerId, user.id))
    .orderBy(desc(buyers.updatedAt))
    .limit(5)

  const stats = {
    totalLeads: totalLeads[0].count,
    newLeads: newLeads[0].count,
    contactedLeads: contactedLeads[0].count,
    conversionRate,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentLeads leads={recentLeads} />
        <div className="space-y-6">
          {/* Placeholder for charts or additional widgets */}
          <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Lead Status Chart (Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
