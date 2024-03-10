import { invoice as invoiceSchema } from '@/store/schema';
import { db } from '@/store/db';
import { StatementItem } from '@/@types/monobank';
import { withPagination } from '@/store/utils';
import { count, desc, SQL } from 'drizzle-orm';
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

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

// export const getInvoices = async (limit = 5, page = 1) => {
// 	const query = db.select().from(invoiceSchema);
// 	const dynamicQuery = query.$dynamic();
// 	return withPagination<typeof dynamicQuery>(dynamicQuery, limit, page, [desc(invoiceSchema.createdAt)]);
// };

export const getInvoices = async (
	limit = 5,
	page = 1,
	orderByColumns: Array<PgColumn | SQL | SQL.Aliased> = [desc(invoiceSchema.createdAt)]
) => {
	return db.transaction(async trx => {
		const query = trx.select().from(invoiceSchema);
		const dynamicQuery = query.$dynamic();
		const items = await withPagination(dynamicQuery as PgSelect, limit, page, orderByColumns);
		const total = await trx.select({ value: count() }).from(invoiceSchema);
		const firstIndex = 0;
		return { items, limit, page, total: total[firstIndex].value };
	});
};
