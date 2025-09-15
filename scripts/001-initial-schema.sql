-- Create enums
CREATE TYPE "city" AS ENUM('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');
CREATE TYPE "property_type" AS ENUM('Apartment', 'Villa', 'Plot', 'Office', 'Retail');
CREATE TYPE "bhk" AS ENUM('1', '2', '3', '4', 'Studio');
CREATE TYPE "purpose" AS ENUM('Buy', 'Rent');
CREATE TYPE "timeline" AS ENUM('0-3m', '3-6m', '>6m', 'Exploring');
CREATE TYPE "source" AS ENUM('Website', 'Referral', 'Walk-in', 'Call', 'Other');
CREATE TYPE "status" AS ENUM('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create buyers table
CREATE TABLE IF NOT EXISTS "buyers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" varchar(80) NOT NULL,
	"email" varchar(255),
	"phone" varchar(15) NOT NULL,
	"city" "city" NOT NULL,
	"property_type" "property_type" NOT NULL,
	"bhk" "bhk",
	"purpose" "purpose" NOT NULL,
	"budget_min" integer,
	"budget_max" integer,
	"timeline" "timeline" NOT NULL,
	"source" "source" NOT NULL,
	"status" "status" DEFAULT 'New' NOT NULL,
	"notes" text,
	"tags" jsonb DEFAULT '[]',
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create buyer_history table
CREATE TABLE IF NOT EXISTS "buyer_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"buyer_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"diff" jsonb NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "buyers" ADD CONSTRAINT "buyers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "buyers_owner_id_idx" ON "buyers" ("owner_id");
CREATE INDEX IF NOT EXISTS "buyers_status_idx" ON "buyers" ("status");
CREATE INDEX IF NOT EXISTS "buyers_city_idx" ON "buyers" ("city");
CREATE INDEX IF NOT EXISTS "buyers_property_type_idx" ON "buyers" ("property_type");
CREATE INDEX IF NOT EXISTS "buyers_updated_at_idx" ON "buyers" ("updated_at");
CREATE INDEX IF NOT EXISTS "buyer_history_buyer_id_idx" ON "buyer_history" ("buyer_id");
