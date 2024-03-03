import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

// noinspection TypeScriptValidateTypes
export const subscription = pgTable('subscription', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	total: integer('total_subscribers').notNull()
});
