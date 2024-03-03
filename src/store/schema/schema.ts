import {
	PgColumnBuilder,
	pgTable,
	serial,
	text,
	pgEnum,
	bigint
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['regular', 'admin']);
export const user = pgTable('user', <Record<string, PgColumnBuilder>>{
	id: serial('id').primaryKey(),
	telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
	username: text('username'),
	firstName: text('first_name').notNull(),
	lastName: text('last_name'),
	chatId: bigint('chat_id', { mode: 'number' }).notNull().unique(),
	role: roleEnum('role').default('regular').notNull()
});
