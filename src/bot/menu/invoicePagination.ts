import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import invoicesCommand from '@/bot/command/invoices';

const invoiceMenu = new Menu<BotContext>('invoice-pagination').dynamic((ctx, range) => {
	const pagination = ctx.invoice?.pagination;
	if (!!pagination) {
		if (pagination.hasPrev) {
			pagination.page = pagination.page - 1;
			range.text('⬅️ Попередні', (ctx: BotContext, next) =>
				invoicesCommand({ ...ctx, invoice: { ...ctx.invoice, pagination } } as BotContext, next)
			);
		}
		if (pagination.hasNext) {
			pagination.page = pagination.page + 1;
			range.text('Наступні ➡️', (ctx: BotContext, next) =>
				invoicesCommand({ ...ctx, invoice: { ...ctx.invoice, pagination } } as BotContext, next)
			);
		}
	}
});

export default invoiceMenu;
