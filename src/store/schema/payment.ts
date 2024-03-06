import { decimal, integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { subscriber } from '@/store/schema/subscriber';
import { relations } from 'drizzle-orm';

// noinspection TypeScriptValidateTypes
export const payment = pgTable('payment', {
	id: serial('id').primaryKey(),
	subscriberId: integer('subscriber_id')
		.notNull()
		.references(() => subscriber.id),
	amount: decimal('amount').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const paymentRelations = relations(payment, ({ one }) => ({
	subscriber: one(subscriber, {
		fields: [payment.id],
		references: [subscriber.userId]
	})
}));
