import { decimal, integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { subscription } from './subscription';

// noinspection TypeScriptValidateTypes
export const invoice = pgTable('invoice', {
	id: serial('id').primaryKey(),
	subscriptionId: integer('subscription_id')
		.notNull()
		.references(() => subscription.id),
	amount: decimal('amount').notNull(),
	operationAmount: decimal('operation_amount').notNull(),
	currencyCode: integer('currency_code').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});
