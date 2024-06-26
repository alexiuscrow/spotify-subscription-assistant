import { invoice as invoiceSchema } from '@/store/schema';
import { db } from '@/store/db';
import { StatementItem } from '@/common-interfaces/monobank';
import { withPagination } from '@/store/utils';
import { count, desc, SQL } from 'drizzle-orm';
import { SearchCriteria, SearchPageDirection } from '@/store/interfaces';
import { PgColumn } from 'drizzle-orm/pg-core';

export type Invoice = typeof invoiceSchema.$inferSelect;

export interface GetInvoicesResponse {
	items: Invoice[];
	pagination: {
		limit: number;
		orderByColumns: Array<PgColumn | SQL | SQL.Aliased>;
		total: number;
		page: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface GetAllowedInvoicePaginationOptionsResponse {
	hasNext: boolean;
	hasPrev: boolean;
}

class InvoiceRepo {
	static async createInvoice(statementItem: StatementItem, subscriptionId: number) {
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
	}

	static async getInvoices(criteria?: SearchCriteria): Promise<GetInvoicesResponse> {
		const {
			limit = 5,
			page = 1,
			orderByColumns = [desc(invoiceSchema.createdAt)],
			pageDirection = SearchPageDirection.REVERSE,
			selection
		} = criteria || {};

		return db.transaction(async trx => {
			const query = trx.select().from(invoiceSchema).where(selection);
			const items = await withPagination(query.$dynamic(), limit, page, orderByColumns);
			const firstIndex = 0;
			const total = (await trx.select({ total: count() }).from(invoiceSchema).where(selection))[firstIndex].total;
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
	}

	static async getAllInvoices({
		selection,
		orderByColumns,
		pageDirection = SearchPageDirection.REVERSE
	}: Pick<SearchCriteria, 'orderByColumns' | 'pageDirection' | 'selection'>) {
		const limit = 1_000;
		let hasMore = true;
		let page = 1;
		const invoices: Invoice[] = [];

		while (hasMore) {
			const { items, pagination } = await InvoiceRepo.getInvoices({
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
	}

	static async getAllowedInvoicePaginationOptions({
		limit = 5,
		page = 1,
		pageDirection = SearchPageDirection.REVERSE,
		selection
	}: Omit<SearchCriteria, 'orderByColumns'>): Promise<GetAllowedInvoicePaginationOptionsResponse> {
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
	}
}

export default InvoiceRepo;
