import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import type { Buyer } from "@/lib/db/schema"

interface RecentLeadsProps {
  leads: Buyer[]
}

const statusColors = {
  New: "bg-blue-100 text-blue-800",
  Qualified: "bg-green-100 text-green-800",
  Contacted: "bg-yellow-100 text-yellow-800",
  Visited: "bg-purple-100 text-purple-800",
  Negotiation: "bg-orange-100 text-orange-800",
  Converted: "bg-emerald-100 text-emerald-800",
  Dropped: "bg-red-100 text-red-800",
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest buyer inquiries</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/buyers">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{lead.fullName}</h4>
                  <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lead.propertyType} in {lead.city}
                  {lead.bhk && ` • ${lead.bhk} BHK`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{lead.phone}</p>
                {lead.budgetMin && lead.budgetMax && (
                  <p className="text-xs text-muted-foreground">
                    ₹{(lead.budgetMin / 100000).toFixed(1)}L - ₹{(lead.budgetMax / 100000).toFixed(1)}L
                  </p>
                )}
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent leads found</p>
              <Button variant="outline" className="mt-2 bg-transparent" asChild>
                <Link href="/buyers/new">Add Your First Lead</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
