DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('regular', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_status" AS ENUM('active', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"username" text,
	"first_name" text NOT NULL,
	"last_name" text,
	"role" "user_role" DEFAULT 'regular' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ssa_dev_user_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_subscriber" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"spreadsheet_subscriber_index" integer NOT NULL,
	CONSTRAINT "ssa_dev_unique_pair_userid_subscription_id" UNIQUE("user_id","subscription_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_invoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"operation_amount" numeric NOT NULL,
	"currency_code" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_allowed_user_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint,
	"first_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_allowed_user_subscription_props" (
	"id" serial PRIMARY KEY NOT NULL,
	"allowed_user_criteria_id" integer NOT NULL,
	"spreadsheet_subscriber_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssa_dev_subscriber_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"total" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_dev_subscriber" ADD CONSTRAINT "ssa_dev_subscriber_user_id_ssa_dev_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "ssa_dev_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_dev_subscriber" ADD CONSTRAINT "ssa_dev_subscriber_subscription_id_ssa_dev_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "ssa_dev_subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_dev_invoice" ADD CONSTRAINT "ssa_dev_invoice_subscription_id_ssa_dev_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "ssa_dev_subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_dev_payment" ADD CONSTRAINT "ssa_dev_payment_subscriber_id_ssa_dev_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "ssa_dev_subscriber"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_dev_allowed_user_subscription_props" ADD CONSTRAINT "ssa_dev_allowed_user_subscription_props_allowed_user_criteria_id_ssa_dev_allowed_user_criteria_id_fk" FOREIGN KEY ("allowed_user_criteria_id") REFERENCES "ssa_dev_allowed_user_criteria"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssa_dev_subscriber_history" ADD CONSTRAINT "ssa_dev_subscriber_history_subscription_id_ssa_dev_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "ssa_dev_subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
