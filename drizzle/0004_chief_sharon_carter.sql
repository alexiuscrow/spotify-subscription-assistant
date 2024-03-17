CREATE TABLE IF NOT EXISTS "allowed_user_subscription_props" (
	"id" serial PRIMARY KEY NOT NULL,
	"allowed_user_criteria_id" integer NOT NULL,
	"spreadsheet_subscriber_index" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriber" RENAME COLUMN "spreadsheet_subscriber_id" TO "spreadsheet_subscriber_index";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "allowed_user_subscription_props" ADD CONSTRAINT "allowed_user_subscription_props_allowed_user_criteria_id_allowed_user_criteria_id_fk" FOREIGN KEY ("allowed_user_criteria_id") REFERENCES "allowed_user_criteria"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
