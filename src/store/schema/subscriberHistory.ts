import { integer, serial, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { subscription } from '@/store/schema/subscription';
import { mySchema } from '@/store/utils';

// noinspection TypeScriptValidateTypes
export const subscriberHistory = mySchema.table('subscriber_history', {
	id: serial('id').primaryKey(),
	subscriptionId: integer('subscription_id')
		.notNull()
		.references(() => subscription.id),
	date: timestamp('date').notNull().defaultNow(),
	total: integer('total').notNull()
});

export const subscriberHistoryRelations = relations(subscriberHistory, ({ one }) => ({
	subscription: one(subscription, {
		fields: [subscriberHistory.subscriptionId],
		references: [subscription.id]
	})
}));
