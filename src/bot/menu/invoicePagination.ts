import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import invoicesCommand from '@/bot/command/invoices';
import { SearchPageDirection } from '@/store/interfaces';
import InvoiceManager from '@/manager/InvoiceManager';

const invoicePagination = new Menu<BotContext>('invoice-pagination').dynamic(async (ctx, range) => {
	const pagination = ctx.session.invoice.pagination;
	const { hasNext, hasPrev } = await InvoiceManager.getAllowedInvoicePaginationOptions({
		limit: pagination.limit,
		page: pagination.page,
		pageDirection: pagination.pageDirection
	});

	if (hasPrev) {
		range.text(ctx.t('previous-nav-button'), (ctx: BotContext, next) => {
			if (ctx.session.invoice.pagination.pageDirection === SearchPageDirection.STRAIGHT)
				ctx.session.invoice.pagination.page--;
			else ctx.session.invoice.pagination.page++;

			return invoicesCommand(ctx, next);
		});
	}
	if (hasNext) {
		range.text(ctx.t('next-nav-button'), (ctx: BotContext, next) => {
			if (ctx.session.invoice.pagination.pageDirection === SearchPageDirection.STRAIGHT)
				ctx.session.invoice.pagination.page++;
			else ctx.session.invoice.pagination.page--;

			return invoicesCommand(ctx, next);
		});
	}
});

export default invoicePagination;
