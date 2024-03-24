import { invoice as invoiceSchema } from '@/store/schema';
import { db } from '@/store/db';
import { StatementItem } from '@/@types/monobank';
import { withPagination } from '@/store/utils';
import { count, desc, gt } from 'drizzle-orm';
import { SearchCriteria, SearchPageDirection } from '@/@types/db';
import { DateTime } from 'luxon';
import * as subscriberHistoryRepo from '@/store/repositories/subscriberHistoryRepo';

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

export const getInvoices = async (criteria?: SearchCriteria) => {
	const {
		limit = 5,
		page = 1,
		orderByColumns = [desc(invoiceSchema.createdAt)],
		pageDirection = SearchPageDirection.REVERSE,
		selection
	} = criteria || {};

	type Invoice = typeof invoiceSchema.$inferSelect;

	return db.transaction(async trx => {
		const query = trx.select().from(invoiceSchema).where(selection);
		const items = await withPagination(query.$dynamic(), limit, page, orderByColumns);
		const firstIndex = 0;
		const totalSelect = trx.select({ total: count() }).from(invoiceSchema);
		const total = (await (selection ? totalSelect : totalSelect.where(selection)))[firstIndex].total;

		const totalPages = Math.ceil(total / limit);

		const straightDirection = {
			hasNext: totalPages > page,
			hasPrev: page > 1
		};

		const hasNext =
			pageDirection === SearchPageDirection.STRAIGHT ? straightDirection.hasNext : straightDirection.hasPrev;
		const hasPrev =
			pageDirection === SearchPageDirection.STRAIGHT ? straightDirection.hasPrev : straightDirection.hasNext;

		return {
			items: items as Invoice[],
			pagination: {
				limit,
				orderByColumns,
				total,
				page,
				totalPages,
				hasNext,
				hasPrev
			}
		};
	});
};

export const getAllInvoices = async ({
	selection,
	orderByColumns,
	pageDirection = SearchPageDirection.REVERSE
}: Pick<SearchCriteria, 'orderByColumns' | 'pageDirection' | 'selection'>) => {
	const limit = 1_000;
	let hasMore = true;
	let page = 1;
	const invoices = [];

	while (hasMore) {
		const { items, pagination } = await getInvoices({
			limit,
			page,
			orderByColumns,
			pageDirection,
			selection
		});
		invoices.push(...items);
		hasMore = pageDirection === SearchPageDirection.STRAIGHT ? pagination.hasNext : pagination.hasPrev;
		page++;
	}

	return invoices;
};

interface GetDebtsCriteria extends Omit<SearchCriteria, 'selection'> {
	latestPayedDate: DateTime | null | void;
}

interface Debt {
	date: DateTime;
	amount: number;
}

export const getDebts = async (criteria: GetDebtsCriteria) => {
	const { items: invoices, pagination } = await getInvoices({
		limit: criteria.limit,
		page: criteria.page,
		orderByColumns: criteria.orderByColumns,
		pageDirection: criteria.pageDirection,
		selection: criteria.latestPayedDate
			? gt(
					invoiceSchema.createdAt,
					DateTime.fromISO(<string>criteria.latestPayedDate.toISODate())
						.plus({ month: 1 })
						.toJSDate()
				)
			: undefined
	});

	const subscriberHistory = await subscriberHistoryRepo.getSubscriberHistory();
	const firstItemIndex = 0;
	const datesAndAmountsPerSubscriber = invoices.map(invoice => {
		const invoiceDate = DateTime.fromJSDate(invoice.createdAt).set({
			day: Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string)
		});
		const historyPoint = subscriberHistory.filter(h => DateTime.fromJSDate(h.date) <= invoiceDate)[firstItemIndex];
		const amountPerSubscriber = Number(invoice.amount) / Number(historyPoint.total);
		const amount = Math.ceil(amountPerSubscriber);
		return {
			date: invoiceDate,
			amount
		};
	});

	return { items: datesAndAmountsPerSubscriber as Debt[], pagination };
};

export const getAllDebts = async ({
	orderByColumns,
	pageDirection = SearchPageDirection.REVERSE,
	latestPayedDate
}: Omit<GetDebtsCriteria, 'limit' | 'page'>) => {
	const limit = 1_000;
	let hasMore = true;
	let page = 1;
	const debts: Debt[] = [];

	while (hasMore) {
		const { items, pagination } = await getDebts({
			limit,
			page,
			orderByColumns,
			pageDirection,
			latestPayedDate
		});
		debts.push(...items);
		hasMore = pageDirection === SearchPageDirection.STRAIGHT ? pagination.hasNext : pagination.hasPrev;
		page++;
	}

	return debts;
};

export const getDebtsSum = async ({ latestPayedDate }: Pick<GetDebtsCriteria, 'latestPayedDate'>) => {
	const debts = await getAllDebts({
		latestPayedDate
	});

	return debts.reduce((sum, debt) => sum + debt.amount, 0);
};

export const getAllowedInvoicePaginationOptions = async ({
	limit = 5,
	page = 1,
	pageDirection = SearchPageDirection.REVERSE,
	selection
}: Omit<SearchCriteria, 'orderByColumns'>) => {
	const firstIndex = 0;
	const total = (await db.select({ total: count() }).from(invoiceSchema).where(selection))[firstIndex].total;

	const totalPages = Math.ceil(total / limit);

	const straightDirection = {
		hasNext: totalPages > page,
		hasPrev: page > 1
	};

	const hasNext =
		pageDirection === SearchPageDirection.STRAIGHT ? straightDirection.hasNext : straightDirection.hasPrev;
	const hasPrev =
		pageDirection === SearchPageDirection.STRAIGHT ? straightDirection.hasPrev : straightDirection.hasNext;

	return { hasNext, hasPrev };
};
