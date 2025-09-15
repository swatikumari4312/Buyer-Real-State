CREATE TYPE "public"."bhk" AS ENUM('1', '2', '3', '4', 'Studio');--> statement-breakpoint
CREATE TYPE "public"."city" AS ENUM('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('Apartment', 'Villa', 'Plot', 'Office', 'Retail');--> statement-breakpoint
CREATE TYPE "public"."purpose" AS ENUM('Buy', 'Rent');--> statement-breakpoint
CREATE TYPE "public"."source" AS ENUM('Website', 'Referral', 'Walk-in', 'Call', 'Other');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');--> statement-breakpoint
CREATE TYPE "public"."timeline" AS ENUM('0-3m', '3-6m', '>6m', 'Exploring');--> statement-breakpoint
CREATE TABLE "buyer_history" (
	"id" uuid PRIMARY KEY DEFAULT 'dnrjgreibiojdyp5f54cbqfo' NOT NULL,
	"buyer_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"diff" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyers" (
	"id" uuid PRIMARY KEY DEFAULT 'p6tz3ksx1ey5htqob28d3rmq' NOT NULL,
	"full_name" varchar(80) NOT NULL,
	"email" varchar(255),
	"phone" varchar(15) NOT NULL,
	"city" "city" NOT NULL,
	"property_type" "property_type" NOT NULL,
	"bhk" "bhk",
	"purpose" "purpose" NOT NULL,
	"budget_min" integer,
	"budget_max" integer,
	"timeline" timeline NOT NULL,
	"source" "source" NOT NULL,
	"status" "status" DEFAULT 'New' NOT NULL,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT 'tcppy32umub6d598idxyphly' NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;