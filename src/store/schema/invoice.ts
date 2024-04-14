import { decimal, integer, serial, timestamp } from 'drizzle-orm/pg-core';
import { subscription } from '@/store/schema/subscription';
import { relations } from 'drizzle-orm';
import { pgTable } from '@/store/utils';

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

export const invoiceRelations = relations(invoice, ({ one }) => ({
	subscription: one(subscription, {
		fields: [invoice.subscriptionId],
		references: [subscription.id]
	})
}));
