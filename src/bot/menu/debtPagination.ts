import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { invoice as invoiceSchema } from '@/store/schema/index';
import myStatusCommand from '@/bot/command/my-status';
import { SearchPageDirection } from '@/@types/db';
import { getLatestPayedDate } from '@/spreadsheet';
import { gt } from 'drizzle-orm';
import { DateTime } from 'luxon';

const debtPagination = new Menu<BotContext>('debt-pagination').dynamic(async (ctx, range) => {
	if (ctx.session.user?.role === 'admin' || !ctx.session.user?.subscriber) {
		return;
	}

	const latestPayedDate = await getLatestPayedDate(ctx.session.user.subscriber.spreadsheetSubscriberIndex);

	if (!latestPayedDate) {
		return;
	}

	const pagination = ctx.session.debt.pagination;
	const { hasNext, hasPrev } = await invoiceRepo.getAllowedInvoicePaginationOptions({
		limit: pagination.limit,
		page: pagination.page,
		pageDirection: pagination.pageDirection,
		selection: gt(
			invoiceSchema.createdAt,
			DateTime.fromISO(<string>latestPayedDate.toISODate())
				.plus({ month: 1 })
				.toJSDate()
		)
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
});

export default debtPagination;
