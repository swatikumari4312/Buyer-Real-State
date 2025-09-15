import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { CSVImport } from "@/components/import-export/csv-import";
import { CSVExport } from "@/components/import-export/csv-export";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ImportExportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar /> {/* ✅ No onLogout prop */}
      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 p-6 shadow-sm flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            📂
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Import & Export
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your lead data effortlessly with CSV import and export.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CSVImport />
          <CSVExport />
        </div>
      </main>
    </div>
  );
}
