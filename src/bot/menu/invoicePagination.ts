import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';
import invoicesCommand from '@/bot/command/invoices';

const invoiceMenu = new Menu<BotContext>('invoice-pagination').dynamic((ctx, range) => {
	const pagination = ctx.invoice?.pagination;
	if (!!pagination) {
		if (pagination.hasPrev) {
			range.text('⬅️ Попередні', ctx => invoicesCommand({ ...ctx, invoice: { ...ctx.invoice, pagination } }));
		}
		if (pagination.hasNext) {
			pagination.page = pagination.page + 1;
			range.text('Наступні ➡️', ctx => invoicesCommand({ ...ctx, invoice: { ...ctx.invoice, pagination } }));
		}
	}
});

export default invoiceMenu;
