import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { BuyerForm } from "@/components/forms/buyer-form";
import { Sidebar } from "@/components/layout/sidebar";

export default async function NewBuyerPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-6 shadow-md">
          <h1 className="text-3xl font-bold text-white">Add New Lead</h1>
          <p className="text-indigo-100 mt-2">
            Create and manage a new buyer lead with detailed information.
          </p>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Info Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Buyer Lead Information
              </h2>
              <BuyerForm mode="create" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
