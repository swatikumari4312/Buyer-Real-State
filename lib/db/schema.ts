import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

// Enums
export const cityEnum = pgEnum("city", ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"])
export const propertyTypeEnum = pgEnum("property_type", ["Apartment", "Villa", "Plot", "Office", "Retail"])
export const bhkEnum = pgEnum("bhk", ["1", "2", "3", "4", "Studio"])
export const purposeEnum = pgEnum("purpose", ["Buy", "Rent"])
export const timelineEnum = pgEnum("timeline", ["0-3m", "3-6m", ">6m", "Exploring"])
export const sourceEnum = pgEnum("source", ["Website", "Referral", "Walk-in", "Call", "Other"])
export const statusEnum = pgEnum("status", [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
])

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Buyers table (leads)
export const buyers = pgTable("buyers", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  city: cityEnum("city").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  bhk: bhkEnum("bhk"),
  purpose: purposeEnum("purpose").notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  timeline: timelineEnum("timeline").notNull(),
  source: sourceEnum("source").notNull(),
  status: statusEnum("status").default("New").notNull(),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Buyer history table
export const buyerHistory = pgTable("buyer_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id")
    .references(() => buyers.id)
    .notNull(),
  changedBy: uuid("changed_by")
    .references(() => users.id)
    .notNull(),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  diff: jsonb("diff").notNull(), // JSON of changed fields
})

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Buyer = typeof buyers.$inferSelect
export type NewBuyer = typeof buyers.$inferInsert
export type BuyerHistory = typeof buyerHistory.$inferSelect
export type NewBuyerHistory = typeof buyerHistory.$inferInsert
