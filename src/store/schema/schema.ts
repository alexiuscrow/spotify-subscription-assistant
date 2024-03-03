import {
	PgColumnBuilder,
	pgTable,
	serial,
	text,
	pgEnum,
	bigint
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['regular', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'canceled']);
export const user = pgTable('user', <Record<string, PgColumnBuilder>>{
	id: serial('id').primaryKey(),
	telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
	username: text('username'),
	firstName: text('first_name').notNull(),
	lastName: text('last_name'),
	chatId: bigint('chat_id', { mode: 'number' }).notNull().unique(),
	role: userRoleEnum('role').default('regular').notNull(),
	status: userStatusEnum('status').default('active').notNull()
});
