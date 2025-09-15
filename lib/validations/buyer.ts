import { z } from "zod"

export const citySchema = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"])
export const propertyTypeSchema = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"])
export const bhkSchema = z.enum(["1", "2", "3", "4", "Studio"])
export const purposeSchema = z.enum(["Buy", "Rent"])
export const timelineSchema = z.enum(["0-3m", "3-6m", ">6m", "Exploring"])
export const sourceSchema = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"])
export const statusSchema = z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"])

const buyerBaseSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: citySchema,
  propertyType: propertyTypeSchema,
  bhk: bhkSchema.optional(),
  purpose: purposeSchema,
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: timelineSchema,
  source: sourceSchema,
  status: statusSchema.default("New"),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
})

// Step 2: Add custom rules with superRefine
export const buyerSchema = buyerBaseSchema.superRefine((data, ctx) => {
  if (["Apartment", "Villa"].includes(data.propertyType) && !data.bhk) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "BHK is required for Apartment and Villa property types",
      path: ["bhk"],
    })
  }

  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budgetMax"],
    })
  }
})

export const buyerUpdateSchema = buyerBaseSchema.extend({
  id: z.string().uuid(),
  updatedAt: z.date(),
})

export const buyerFilterSchema = z.object({
  search: z.string().optional(),
  city: citySchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  status: statusSchema.optional(),
  timeline: timelineSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(["updatedAt", "createdAt", "fullName"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type BuyerFormData = z.infer<typeof buyerSchema>
export type BuyerUpdateData = z.infer<typeof buyerUpdateSchema>
export type BuyerFilterData = z.infer<typeof buyerFilterSchema>
