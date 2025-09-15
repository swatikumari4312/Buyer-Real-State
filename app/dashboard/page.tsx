import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { buyers } from "@/lib/db/schema";
import { eq, desc, count, and, ne } from "drizzle-orm";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentLeads } from "@/components/dashboard/recent-leads";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Stats queries
  const totalLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(eq(buyers.ownerId, user.id));

  const newLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(and(eq(buyers.ownerId, user.id), eq(buyers.status, "New")));

  const contactedLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(
      and(
        eq(buyers.ownerId, user.id),
        ne(buyers.status, "New"),
        ne(buyers.status, "Dropped")
      )
    );

  const convertedLeads = await db
    .select({ count: count() })
    .from(buyers)
    .where(and(eq(buyers.ownerId, user.id), eq(buyers.status, "Converted")));

  const conversionRate =
    totalLeads[0].count > 0
      ? Math.round((convertedLeads[0].count / totalLeads[0].count) * 100)
      : 0;

  // Recent leads
  const recentLeads = await db
    .select()
    .from(buyers)
    .where(eq(buyers.ownerId, user.id))
    .orderBy(desc(buyers.updatedAt))
    .limit(5);

  const stats = {
    totalLeads: totalLeads[0].count,
    newLeads: newLeads[0].count,
    contactedLeads: contactedLeads[0].count,
    conversionRate,
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="rounded-xl border bg-gradient-to-r from-indigo-600 to-indigo-500 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-300">Dashboard</h1>
        <p className="text-white mt-2">Welcome back, {user.name}</p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Content Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-lg border bg-white shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Leads
          </h2>
          <RecentLeads leads={recentLeads} />
        </div>

        {/* Widgets */}
        <div className="space-y-6">
          <div className="h-64 rounded-lg border bg-white shadow-sm flex items-center justify-center hover:shadow-md transition">
            <p className="text-gray-500">Lead Status Chart (Coming Soon)</p>
          </div>
          <div className="h-64 rounded-lg border bg-white shadow-sm flex items-center justify-center hover:shadow-md transition">
            <p className="text-gray-500">Conversion Trends (Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
