import { integer, serial } from 'drizzle-orm/pg-core';
import { user } from '@/store/schema/user';
import { subscription } from '@/store/schema/subscription';
import { relations } from 'drizzle-orm';
import { mySchema, unique } from '@/store/utils';

// noinspection TypeScriptValidateTypes
export const subscriber = mySchema.table(
	'subscriber',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => user.id),
		subscriptionId: integer('subscription_id')
			.notNull()
			.references(() => subscription.id),
		spreadsheetSubscriberIndex: integer('spreadsheet_subscriber_index').notNull()
	},
	table => ({
		unqUserSubscriptionPair: unique('unique_pair_userid_subscription_id').on(table.userId, table.subscriptionId)
	})
);

export const subscriberRelations = relations(subscriber, ({ one }) => ({
	subscription: one(subscription, {
		fields: [subscriber.subscriptionId],
		references: [subscription.id]
	}),
	user: one(user, {
		fields: [subscriber.userId],
		references: [user.id]
	})
}));
