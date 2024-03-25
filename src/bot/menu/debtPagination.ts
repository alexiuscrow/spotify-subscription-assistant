import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import { invoice as invoiceSchema } from '@/store/schema/index';
import myStatusCommand from '@/bot/command/my-status';
import { SearchPageDirection } from '@/@types/db';
import { gt } from 'drizzle-orm';
import { DateTime } from 'luxon';
import InvoiceManager from '@/manager/InvoiceManager';
import DebtManager from '@/manager/DebtManager';
import SpreadsheetManager from '@/manager/SpreadsheetManager';
import detailsForPaymentsCommand from '@/bot/command/details-for-payments';

const debtPagination = new Menu<BotContext>('debt-pagination').dynamic(async (ctx, range) => {
	if (ctx.session.user?.role === 'admin' || !ctx.session.user?.subscriber) {
		return;
	}

	const latestPayedDate = await SpreadsheetManager.getLatestPayedDate(
		ctx.session.user.subscriber.spreadsheetSubscriberIndex
	);

	const pagination = ctx.session.debt.pagination;
	const { hasNext, hasPrev } = await InvoiceManager.getAllowedInvoicePaginationOptions({
		limit: pagination.limit,
		page: pagination.page,
		pageDirection: pagination.pageDirection,
		selection: latestPayedDate
			? gt(
					invoiceSchema.createdAt,
					DateTime.fromISO(<string>latestPayedDate.toISODate())
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

	const debtSum = await DebtManager.getDebtsSum({ latestPayedDate });

	if (debtSum >= 100) {
		const paymentComment = encodeURIComponent(
			`#spotify_subscription; u:${ctx.session.user.id} (${ctx.session.user.firstName})`
		);
		range.url('💳 Сплатити все', `${process.env.MONOBANK_PAYMENT_LINK}?amount=${debtSum}&text=${paymentComment}`);
	} else {
		range.text('💳 Реквізити для оплати', detailsForPaymentsCommand);
	}

	range.row();
	range.url(
		'📄 Платежі у Google таблиці',
		`https://docs.google.com/spreadsheets/d/${process.env.LOG_GOOGLE_SHEETSPREAD_ID}/edit?usp=sharing`
	);
});

export default debtPagination;
