"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { MoreHorizontal, Trash2, Eye, Phone, Mail, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Buyer } from "@/lib/db/schema"

interface BuyersTableProps {
  buyers: Buyer[]
  totalCount: number
  currentPage: number
  totalPages: number
}

const statusColors = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Visited: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  Dropped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function BuyersTable({ buyers, totalCount, currentPage, totalPages }: BuyersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (buyers.length === 0) {
    const hasFilters = Array.from(searchParams.entries()).some(([key, value]) => key !== "page" && value)

    return (
      <EmptyState
        icon={Users}
        title={hasFilters ? "No leads found" : "No leads yet"}
        description={
          hasFilters
            ? "No leads match your current filters. Try adjusting your search criteria."
            : "Get started by adding your first buyer lead to the system."
        }
        action={
          !hasFilters
            ? {
                label: "Add First Lead",
                onClick: () => router.push("/buyers/new"),
              }
            : undefined
        }
      >
        {hasFilters && (
          <Button variant="outline" onClick={() => router.push("/buyers")}>
            Clear Filters
          </Button>
        )}
      </EmptyState>
    )
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/buyers/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
        setDeleteId(null)
      } else {
        console.error("Failed to delete buyer")
      }
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (buyerId: string, newStatus: string, currentBuyer: Buyer) => {
    try {
      const response = await fetch(`/api/buyers/${buyerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentBuyer,
          status: newStatus,
          updatedAt: currentBuyer.updatedAt,
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to update status")
      }
    } catch (error) {
      console.error("Status update error:", error)
    }
  }

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "-"
    if (min && max) {
      return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`
    }
    if (min) return `₹${(min / 100000).toFixed(1)}L+`
    if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`
    return "-"
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return `?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]" aria-label="Actions"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyers.map((buyer) => (
              <TableRow key={buyer.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{buyer.fullName}</p>
                    {buyer.tags && buyer.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {buyer.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {buyer.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{buyer.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Phone:</span>
                      {buyer.phone}
                    </div>
                    {buyer.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" aria-hidden="true" />
                        <span className="sr-only">Email:</span>
                        {buyer.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{buyer.city}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{buyer.propertyType}</p>
                    {buyer.bhk && <p className="text-xs text-muted-foreground">{buyer.bhk} BHK</p>}
                    <p className="text-xs text-muted-foreground">{buyer.purpose}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{buyer.timeline}</p>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0"
                        aria-label={`Change status for ${buyer.fullName}`}
                      >
                        <Badge className={statusColors[buyer.status]}>{buyer.status}</Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {Object.keys(statusColors).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleStatusChange(buyer.id, status, buyer)}
                          className={buyer.status === status ? "bg-muted" : ""}
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{formatDistanceToNow(new Date(buyer.updatedAt), { addSuffix: true })}</p>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={`Actions for ${buyer.fullName}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${buyer.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          View/Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(buyer.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} leads
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} asChild={currentPage > 1}>
              {currentPage > 1 ? <Link href={createPageUrl(currentPage - 1)}>Previous</Link> : <span>Previous</span>}
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
              {currentPage < totalPages ? <Link href={createPageUrl(currentPage + 1)}>Next</Link> : <span>Next</span>}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
