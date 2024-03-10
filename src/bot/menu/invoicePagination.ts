import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import invoicesCommand from '@/bot/command/invoices';
import { MiddlewareFn } from 'grammy';

const invoiceMenu = new Menu<BotContext>('invoice-pagination').dynamic((dynamicCtx, range) => {
	const pagination = dynamicCtx.invoice?.pagination;
	if (!!pagination) {
		if (pagination.hasPrev) {
			pagination.page = pagination.page - 1;
			range.text('⬅️ Попередні', (ctx, next) =>
				invoicesCommand({ ...dynamicCtx, invoice: { ...dynamicCtx.invoice, pagination } } as BotContext, next)
			);
		}
		if (pagination.hasNext) {
			pagination.page = pagination.page + 1;
			range.text('Наступні ➡️', (ctx, next) =>
				invoicesCommand({ ...dynamicCtx, invoice: { ...dynamicCtx.invoice, pagination } } as BotContext, next)
			);
		}
	}
});

export default invoiceMenu;
