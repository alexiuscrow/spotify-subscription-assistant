import { bigint, pgTable, serial, text } from 'drizzle-orm/pg-core';

// noinspection TypeScriptValidateTypes
export const allowedUserCriteria = pgTable('allowed_user_criteria', {
	id: serial('id').primaryKey(),
	telegramId: bigint('telegram_id', { mode: 'number' }),
	firstName: text('first_name')
});
