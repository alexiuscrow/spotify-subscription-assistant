import { integer, pgTable, serial, unique } from 'drizzle-orm/pg-core';
import { user } from '@/store/schema/user';
import { subscription } from '@/store/schema/subscription';

// noinspection TypeScriptValidateTypes
export const subscriber = pgTable(
	'subscriber',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => user.id),
		subscriptionId: integer('subscription_id')
			.notNull()
			.references(() => subscription.id)
	},
	table => ({
		unqUserSubscriptionPair: unique('unique_pair_userid_subscription_id').on(table.userId, table.subscriptionId)
	})
);
