import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import { invoice as invoiceSchema } from '@/store/schema/index';
import myStatusCommand from '@/bot/command/my-status';
import { SearchPageDirection } from '@/store/interfaces';
import { gt } from 'drizzle-orm';
import { DateTime } from 'luxon';
import DebtManager from '@/manager/DebtManager';
import detailsForPaymentsCommand from '@/bot/command/details-for-payments';
import { generateStringComment } from '@/bot/utils/paymentComment';
import SpreadsheetManagerCached from '@/manager/cached/SpreadsheetManagerCached';
import InvoiceManagerCached from '@/manager/cached/InvoiceManagerCached';

const debtPagination = new Menu<BotContext>('debt-pagination').dynamic(async (ctx, range) => {
	if (ctx.session.user?.role === 'admin' || !ctx.session.user?.subscriber) {
		return;
	}

	const latestPaidDate = await SpreadsheetManagerCached.getLatestPaidDate(
		ctx.session.user.subscriber.spreadsheetSubscriberIndex
	);

	const pagination = ctx.session.debt.pagination;
	const { hasNext, hasPrev } = await InvoiceManagerCached.getAllowedInvoicePaginationOptions({
		limit: pagination.limit,
		page: pagination.page,
		pageDirection: pagination.pageDirection,
		selection: latestPaidDate
			? gt(
					invoiceSchema.createdAt,
					DateTime.fromISO(<string>latestPaidDate.toISODate())
						.plus({ month: 1 })
						.toJSDate()
				)
			: undefined
	});

	if (hasPrev) {
		range.text('⬅️ Попередні', (ctx: BotContext, next) => {
			if (ctx.session.debt.pagination.pageDirection === SearchPageDirection.STRAIGHT)
				ctx.session.debt.pagination.page--;
			else ctx.session.debt.pagination.page++;

			return myStatusCommand(ctx, next);
		});
	}
	if (hasNext) {
		range.text('Наступні ➡️', (ctx: BotContext, next) => {
			if (ctx.session.debt.pagination.pageDirection === SearchPageDirection.STRAIGHT)
				ctx.session.debt.pagination.page++;
			else ctx.session.debt.pagination.page--;

			return myStatusCommand(ctx, next);
		});
	}

	range.row();

	const debtSum = await DebtManager.getDebtsSum({ latestPaidDate });

	if (debtSum) {
		if (debtSum >= 100) {
			const {
				subscriber: { id: subscriberId },
				firstName
			} = ctx.session.user;
			const paymentComment = encodeURIComponent(generateStringComment({ subscriberId, firstName }));
			range.url('💳 Сплатити все', `${process.env.MONOBANK_PAYMENT_LINK}?amount=${debtSum}&text=${paymentComment}`);
		} else {
			range.text('💳 Реквізити для оплати', detailsForPaymentsCommand);
		}
	}

	range.row();
	range.url(
		'👀 Платежі у Google таблиці',
		`https://docs.google.com/spreadsheets/d/${process.env.LOG_GOOGLE_SHEETSPREAD_ID}/edit?usp=sharing`
	);
});

export default debtPagination;
