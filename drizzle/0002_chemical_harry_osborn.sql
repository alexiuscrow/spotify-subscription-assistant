ALTER TABLE "user" DROP CONSTRAINT "user_chat_id_unique";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "chat_id";