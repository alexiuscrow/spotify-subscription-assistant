import { invoice as invoiceSchema } from '@/store/schema';
import { db } from '@/store/db';
import { StatementItem } from '@/@types/monobank';
import { withPagination } from '@/store/utils';

export const createInvoice = async (statementItem: StatementItem, subscriptionId: number) => {
	const amountConvertor = -100;
	const dateConvertor = 1_000;

	type NewInvoice = typeof invoiceSchema.$inferInsert;

	const insertedInvoices = await db
		.insert(invoiceSchema)
		.values({
			amount: String(statementItem.amount / amountConvertor),
			operationAmount: String(statementItem.operationAmount / amountConvertor),
			currencyCode: statementItem.currencyCode,
			subscriptionId: subscriptionId,
			createdAt: new Date(statementItem.time * dateConvertor)
		} as NewInvoice)
		.returning({ amount: invoiceSchema.amount });

	const firstItemIndex = 0;
	return insertedInvoices[firstItemIndex];
};

export const getInvoices = async (limit = 5, page = 1) => {
	const query = db.select().from(invoiceSchema);
	const dynamicQuery = query.$dynamic();
	return withPagination<typeof dynamicQuery>(dynamicQuery, limit, page, [invoiceSchema.createdAt]);
};
