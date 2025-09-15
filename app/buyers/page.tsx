import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { buyers } from "@/lib/db/schema";
import { eq, and, or, ilike, desc, asc, count } from "drizzle-orm";
import { BuyersFilters } from "@/components/buyers/buyers-filters";
import { BuyersTable } from "@/components/buyers/buyers-table";
import { buyerFilterSchema } from "@/lib/validations/buyer";
import { Sidebar } from "@/components/layout/sidebar";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface BuyersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const filters = buyerFilterSchema.parse({
    search: params.search,
    city: params.city,
    propertyType: params.propertyType,
    status: params.status,
    timeline: params.timeline,
    page: params.page ? Number(params.page as string) : undefined,
    limit: params.limit ? Number(params.limit as string) : undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const whereConditions = [eq(buyers.ownerId, user.id)];

  if (filters.search) {
    whereConditions.push(
      or(
        ilike(buyers.fullName, `%${filters.search}%`),
        ilike(buyers.phone, `%${filters.search}%`),
        ilike(buyers.email, `%${filters.search}%`)
      )!
    );
  }

  if (filters.city) whereConditions.push(eq(buyers.city, filters.city as any));
  if (filters.propertyType) whereConditions.push(eq(buyers.propertyType, filters.propertyType as any));
  if (filters.status) whereConditions.push(eq(buyers.status, filters.status as any));
  if (filters.timeline) whereConditions.push(eq(buyers.timeline, filters.timeline as any));

  const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

  const totalCountResult = await db
    .select({ count: count() })
    .from(buyers)
    .where(whereClause);

  const totalCount = totalCountResult[0].count;
  const limit = filters.limit;
  const offset = (filters.page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);

  const orderBy =
    filters.sortOrder === "desc"
      ? desc(buyers[filters.sortBy as keyof typeof buyers])
      : asc(buyers[filters.sortBy as keyof typeof buyers]);

  const buyersResult = await db
    .select()
    .from(buyers)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">All Leads</h1>
              <p className="text-indigo-100 mt-2">
                Manage and track your buyer leads{" "}
                <span className="font-semibold text-white">
                  ({totalCount} total)
                </span>
              </p>
            </div>
            <Link
              href="/buyers/new"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow hover:bg-indigo-50 transition"
            >
              <PlusCircle size={18} /> Add New Lead
            </Link>
          </div>
        </div>

        {/* Filters + Table */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <BuyersFilters />
            </div>

            {/* Table */}
            {buyersResult.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <BuyersTable
                  buyers={buyersResult}
                  totalCount={totalCount}
                  currentPage={filters.page}
                  totalPages={totalPages}
                />
              </div>
            ) : (
              <div className="text-center py-16 bg-white border rounded-xl shadow-sm">
                <p className="text-gray-500 mb-4 text-lg">
                  {filters.search ||
                  filters.city ||
                  filters.propertyType ||
                  filters.status ||
                  filters.timeline
                    ? "No leads found matching your filters"
                    : "No leads found"}
                </p>
                {!filters.search &&
                  !filters.city &&
                  !filters.propertyType &&
                  !filters.status &&
                  !filters.timeline && (
                    <Link
                      href="/buyers/new"
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
                    >
                      <PlusCircle size={18} /> Add Your First Lead
                    </Link>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
