DO $$ BEGIN
 CREATE TYPE "ssa_prod"."user_role" AS ENUM('regular', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ssa_prod"."user_status" AS ENUM('active', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."user" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"username" text,
	"first_name" text NOT NULL,
	"last_name" text,
	"role" "ssa_prod"."user_role" DEFAULT 'regular' NOT NULL,
	"status" "ssa_prod"."user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."subscriber" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"spreadsheet_subscriber_index" integer NOT NULL,
	CONSTRAINT "ssa_prod_unique_pair_userid_subscription_id" UNIQUE("user_id","subscription_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."invoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"operation_amount" numeric NOT NULL,
	"currency_code" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."allowed_user_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint,
	"first_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."allowed_user_subscription_props" (
	"id" serial PRIMARY KEY NOT NULL,
	"allowed_user_criteria_id" integer NOT NULL,
	"spreadsheet_subscriber_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_prod"."subscriber_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"total" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_prod"."subscriber" ADD CONSTRAINT "subscriber_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "ssa_prod"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_prod"."subscriber" ADD CONSTRAINT "subscriber_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "ssa_prod"."subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_prod"."invoice" ADD CONSTRAINT "invoice_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "ssa_prod"."subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_prod"."payment" ADD CONSTRAINT "payment_subscriber_id_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "ssa_prod"."subscriber"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_prod"."allowed_user_subscription_props" ADD CONSTRAINT "allowed_user_subscription_props_allowed_user_criteria_id_allowed_user_criteria_id_fk" FOREIGN KEY ("allowed_user_criteria_id") REFERENCES "ssa_prod"."allowed_user_criteria"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_prod"."subscriber_history" ADD CONSTRAINT "subscriber_history_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "ssa_prod"."subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
