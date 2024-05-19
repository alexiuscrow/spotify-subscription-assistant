import { serial, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { invoice } from '@/store/schema/invoice';
import { subscriber } from '@/store/schema/subscriber';
import { subscriberHistory } from '@/store/schema/subscriberHistory';
import { mySchema } from '@/store/utils';

// noinspection TypeScriptValidateTypes
export const subscription = mySchema.table('subscription', {
	id: serial('id').primaryKey(),
	name: text('name').notNull()
});

export const subscriptionRelations = relations(subscription, ({ many }) => ({
	subscribers: many(subscriber),
	invoices: many(invoice),
	subscriberHistory: many(subscriberHistory)
}));
