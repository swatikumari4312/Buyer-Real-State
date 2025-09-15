import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers, buyerHistory, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { BuyerForm } from "@/components/forms/buyer-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface BuyerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  // Get buyer data
  const buyer = await db.select().from(buyers).where(eq(buyers.id, id)).limit(1)

  if (buyer.length === 0) {
    notFound()
  }

  // Check ownership
  if (buyer[0].ownerId !== user.id && user.role !== "admin") {
    redirect("/buyers")
  }

  // Get history
  const history = await db
    .select({
      id: buyerHistory.id,
      changedAt: buyerHistory.changedAt,
      diff: buyerHistory.diff,
      changedBy: users.name,
    })
    .from(buyerHistory)
    .leftJoin(users, eq(buyerHistory.changedBy, users.id))
    .where(eq(buyerHistory.buyerId, id))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Lead</h1>
        <p className="text-muted-foreground">Update buyer information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BuyerForm mode="edit" initialData={buyer[0]} />
        </div>

        <div className="space-y-6">
          {/* Lead Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1">{buyer[0].status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{formatDistanceToNow(new Date(buyer[0].createdAt), { addSuffix: true })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDistanceToNow(new Date(buyer[0].updatedAt), { addSuffix: true })}</p>
              </div>
              {buyer[0].tags && buyer[0].tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {buyer[0].tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
              <CardDescription>Last 5 changes to this lead</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((change) => (
                    <div key={change.id} className="border-l-2 border-muted pl-4">
                      <p className="text-sm font-medium">{change.changedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(change.changedAt), { addSuffix: true })}
                      </p>
                      <div className="mt-1 text-xs">
                        {Object.entries(change.diff as Record<string, any>).map(([field, { old, new: newVal }]) => (
                          <p key={field} className="text-muted-foreground">
                            {field}: {old || "empty"} → {newVal || "empty"}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No changes recorded yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
