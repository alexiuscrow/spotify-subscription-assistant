CREATE TABLE IF NOT EXISTS "subscriber_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"total" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "total_subscribers";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriber_history" ADD CONSTRAINT "subscriber_history_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
