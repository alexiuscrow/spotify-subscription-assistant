ALTER TABLE "allowed_user_criteria" DROP CONSTRAINT "allowed_user_criteria_telegram_id_unique";--> statement-breakpoint
ALTER TABLE "allowed_user_criteria" ALTER COLUMN "telegram_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "allowed_user_criteria" ADD COLUMN "first_name" text;