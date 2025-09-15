import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { CSVImport } from "@/components/import-export/csv-import"
import { CSVExport } from "@/components/import-export/csv-export"

export default async function ImportExportPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import & Export</h1>
        <p className="text-muted-foreground">Manage your lead data with CSV import and export</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CSVImport />
        <CSVExport />
      </div>
    </div>
  )
}
