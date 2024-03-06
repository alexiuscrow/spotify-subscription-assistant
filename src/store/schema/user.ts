import { bigint, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { subscriber } from '@/store/schema/subscriber';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['regular', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'canceled']);

// noinspection TypeScriptValidateTypes
export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
	username: text('username'),
	firstName: text('first_name').notNull(),
	lastName: text('last_name'),
	role: userRoleEnum('role').default('regular').notNull(),
	status: userStatusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const userRelations = relations(user, ({ one }) => ({
	subscriber: one(subscriber, {
		fields: [user.id],
		references: [subscriber.userId]
	})
}));
