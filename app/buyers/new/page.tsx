import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { BuyerForm } from "@/components/forms/buyer-form"

export default async function NewBuyerPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Lead</h1>
        <p className="text-muted-foreground">Create a new buyer lead</p>
      </div>
      <BuyerForm mode="create" />
    </div>
  )
}
