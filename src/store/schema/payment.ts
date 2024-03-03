import { decimal, integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { subscriber } from '@/store/schema/subscriber';

// noinspection TypeScriptValidateTypes
export const payment = pgTable('payment', {
	id: serial('id').primaryKey(),
	subscriberId: integer('subscriber_id')
		.notNull()
		.references(() => subscriber.id),
	amount: decimal('amount').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});
