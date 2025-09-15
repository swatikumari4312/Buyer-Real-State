"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Loader2 } from "lucide-react"
import { exportBuyersToCSV } from "@/lib/utils/csv"

export function CSVExport() {
  const searchParams = useSearchParams()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFiltered, setExportFiltered] = useState(true)

  const hasFilters = Array.from(searchParams.entries()).some(([key, value]) => key !== "page" && value)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (exportFiltered) {
        // Include current filters
        searchParams.forEach((value, key) => {
          if (key !== "page") {
            params.set(key, value)
          }
        })
      }

      const response = await fetch(`/api/buyers/export?${params.toString()}`)

      if (response.ok) {
        const buyers = await response.json()
        const csvContent = exportBuyersToCSV(buyers)

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `buyer-leads-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        alert("Export failed. Please try again.")
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Leads to CSV
        </CardTitle>
        <CardDescription>Download your buyer leads data as a CSV file for analysis or backup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasFilters && (
          <div className="flex items-center space-x-2">
            <Checkbox id="exportFiltered" checked={exportFiltered} onCheckedChange={setExportFiltered} />
            <label
              htmlFor="exportFiltered"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Export only filtered results
            </label>
          </div>
        )}

        {hasFilters && exportFiltered && (
          <Alert>
            <AlertDescription>
              <strong>Current filters will be applied:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                {Array.from(searchParams.entries()).map(([key, value]) => {
                  if (key === "page") return null
                  return (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  )
                })}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>

        <Alert>
          <AlertDescription>
            <strong>Export includes:</strong> All lead information including name, contact details, property
            requirements, budget, timeline, status, notes, and tags.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
