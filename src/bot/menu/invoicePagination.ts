import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import invoicesCommand from '@/bot/command/invoices';

const invoicePagination = new Menu<BotContext>('invoice-pagination').dynamic(async (ctx, range) => {
	const pagination = ctx.session.invoice.pagination;
	const { hasNext, hasPrev } = await invoiceRepo.getAllowedInvoicePaginationOptions({
		limit: pagination.limit,
		page: pagination.page,
		pageDirection: pagination.pageDirection
	});

	if (hasPrev) {
		range.text('⬅️ Попередні', (ctx: BotContext, next) => {
			ctx.session.invoice.pagination.page--;
			return invoicesCommand(ctx, next);
		});
	}
	if (hasNext) {
		range.text('Наступні ➡️', (ctx: BotContext, next) => {
			ctx.session.invoice.pagination.page++;
			return invoicesCommand(ctx, next);
		});
	}
});

export default invoicePagination;
