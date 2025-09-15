import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers, buyerHistory } from "@/lib/db/schema"
import { buyerSchema } from "@/lib/validations/buyer"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { buyers: buyersData } = await request.json()

    if (!Array.isArray(buyersData) || buyersData.length === 0) {
      return NextResponse.json({ error: "No valid buyer data provided" }, { status: 400 })
    }

    if (buyersData.length > 200) {
      return NextResponse.json({ error: "Maximum 200 rows allowed per import" }, { status: 400 })
    }

    // Validate all buyers data
    const validatedBuyers = []
    for (const buyerData of buyersData) {
      try {
        const validated = buyerSchema.parse(buyerData)
        validatedBuyers.push({
          ...validated,
          ownerId: user.id,
        })
      } catch (error) {
        console.error("Validation error for buyer:", error)
        return NextResponse.json({ error: "Invalid buyer data in import" }, { status: 400 })
      }
    }

    // Import in transaction
    const importedBuyers = await db.transaction(async (tx) => {
      const inserted = await tx.insert(buyers).values(validatedBuyers).returning()

      // Create history entries for all imported buyers
      const historyEntries = inserted.map((buyer) => ({
        buyerId: buyer.id,
        changedBy: user.id,
        diff: { action: "imported", data: buyer },
      }))

      await tx.insert(buyerHistory).values(historyEntries)

      return inserted
    })

    return NextResponse.json({
      message: "Import successful",
      imported: importedBuyers.length,
      buyers: importedBuyers,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
