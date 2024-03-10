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

enum SearchInvoicesPageDirection {
	STRAIGHT,
	REVERSE
}

interface SearchInvoicesCriteria {
	limit?: number;
	page?: number;
	orderByColumns?: Array<PgColumn | SQL | SQL.Aliased>;
	pageDirection?: SearchInvoicesPageDirection;
}

export const getInvoices = async (criteria: SearchInvoicesCriteria) => {
	const {
		limit = 5,
		page = 1,
		orderByColumns = [desc(invoiceSchema.createdAt)],
		pageDirection = SearchInvoicesPageDirection.REVERSE
	} = criteria;

	return db.transaction(async trx => {
		const query = trx.select().from(invoiceSchema);
		const dynamicQuery = query.$dynamic();
		const items = await withPagination(dynamicQuery as PgSelect, limit, page, orderByColumns);
		const firstIndex = 0;
		const total = (await trx.select({ value: count() }).from(invoiceSchema))[firstIndex].value;

		const totalPages = Math.ceil(total / limit);

		const straightDirection = {
			hasNext: totalPages > page,
			hasPrev: page > 1
		};

		const hasNext =
			pageDirection === SearchInvoicesPageDirection.STRAIGHT ? straightDirection.hasNext : straightDirection.hasPrev;
		const hasPrev =
			pageDirection === SearchInvoicesPageDirection.STRAIGHT ? straightDirection.hasPrev : straightDirection.hasNext;

		return { items, limit, page, total, hasNext, hasPrev };
	});
};
