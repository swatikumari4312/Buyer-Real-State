import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { buyers, buyerHistory } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { buyerUpdateSchema } from "@/lib/validations/buyer"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = buyerUpdateSchema.parse({ ...body, id })

    // Get current buyer data
    const currentBuyer = await db
      .select()
      .from(buyers)
      .where(and(eq(buyers.id, id), eq(buyers.ownerId, user.id)))
      .limit(1)

    if (currentBuyer.length === 0) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    }

    // Check for concurrent updates
    if (new Date(currentBuyer[0].updatedAt).getTime() !== new Date(validatedData.updatedAt).getTime()) {
      return NextResponse.json(
        { error: "Record has been modified by another user. Please refresh and try again." },
        { status: 409 },
      )
    }

    // Calculate diff
    const diff: Record<string, { old: any; new: any }> = {}
    Object.keys(validatedData).forEach((key) => {
      if (key !== "id" && key !== "updatedAt") {
        const oldValue = (currentBuyer[0] as any)[key]
        const newValue = (validatedData as any)[key]
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = { old: oldValue, new: newValue }
        }
      }
    })

    // Update buyer
    const updatedBuyer = await db
      .update(buyers)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(buyers.id, id))
      .returning()

    // Create history entry if there are changes
    if (Object.keys(diff).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId: id,
        changedBy: user.id,
        diff,
      })
    }

    return NextResponse.json({ buyer: updatedBuyer[0] })
  } catch (error: any) {
    console.error("Update buyer error:", error)

    if (error.errors) {
      const fieldErrors: Record<string, string> = {}
      error.errors.forEach((err: any) => {
        fieldErrors[err.path[0]] = err.message
      })
      return NextResponse.json({ errors: fieldErrors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update buyer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete buyer (only owner can delete)
    const deletedBuyer = await db
      .delete(buyers)
      .where(and(eq(buyers.id, id), eq(buyers.ownerId, user.id)))
      .returning()

    if (deletedBuyer.length === 0) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Buyer deleted successfully" })
  } catch (error) {
    console.error("Delete buyer error:", error)
    return NextResponse.json({ error: "Failed to delete buyer" }, { status: 500 })
  }
}
