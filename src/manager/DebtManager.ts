import { SearchCriteria, SearchPageDirection } from '@/@types/db';
import { DateTime } from 'luxon';
import InvoiceManager from '@/manager/InvoiceManager';
import { invoice as invoiceSchema } from '@/store/schema/invoice';
import { gt } from 'drizzle-orm';
import SubscriberHistoryManager from '@/manager/SubscriberHistoryManager';

export interface Debt {
	date: DateTime;
	amount: number;
}

interface GetDebtsCriteria extends Omit<SearchCriteria, 'selection'> {
	latestPayedDate: DateTime | null | void;
}

class DebtManager {
	static async getDebts(criteria: GetDebtsCriteria) {
		const { items: invoices, pagination } = await InvoiceManager.getInvoices({
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

		const subscriberHistory = await SubscriberHistoryManager.getSubscriberHistory();
		const firstItemIndex = 0;
		const datesAndAmountsPerSubscriber = invoices.map(invoice => {
			const invoiceDate = DateTime.fromJSDate(invoice.createdAt).set({
				day: Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string)
			});
			let historyPoint = subscriberHistory.filter(h => DateTime.fromJSDate(h.date) <= invoiceDate)[firstItemIndex];
			if (!historyPoint) {
				historyPoint = subscriberHistory[subscriberHistory.length - 1];

				if (!historyPoint) {
					throw new Error('Subscriber history is empty');
				}
			}
			const amountPerSubscriber = Number(invoice.amount) / Number(historyPoint.total);
			const amount = Math.ceil(amountPerSubscriber);
			return {
				date: invoiceDate,
				amount
			};
		});

		return { items: datesAndAmountsPerSubscriber as Debt[], pagination };
	}

	static async getAllDebts({
		orderByColumns,
		pageDirection = SearchPageDirection.REVERSE,
		latestPayedDate
	}: Omit<GetDebtsCriteria, 'limit' | 'page'>) {
		const limit = 1_000;
		let hasMore = true;
		let page = 1;
		const debts: Debt[] = [];

		while (hasMore) {
			const { items, pagination } = await DebtManager.getDebts({
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
	}

	static async getDebtsSum({ latestPayedDate }: Pick<GetDebtsCriteria, 'latestPayedDate'>) {
		const debts = await DebtManager.getAllDebts({
			latestPayedDate
		});

		return debts.reduce((sum, debt) => sum + debt.amount, 0);
	}

	static async getPayedMonthNumber({
		latestPayedDate,
		paymentAmount
	}: Pick<GetDebtsCriteria, 'latestPayedDate'> & { paymentAmount: number }) {
		const debts = await DebtManager.getAllDebts({
			latestPayedDate,
			pageDirection: SearchPageDirection.STRAIGHT,
			orderByColumns: [invoiceSchema.createdAt]
		});

		let tempPaymentAmount = paymentAmount;
		let payedMonths = 0;

		for (const debt of debts) {
			if (tempPaymentAmount >= debt.amount) {
				tempPaymentAmount -= debt.amount;
				payedMonths++;
			} else {
				break;
			}
		}

		return {
			payedMonths,
			overpayAmount: tempPaymentAmount
		};
	}
}

export default DebtManager;