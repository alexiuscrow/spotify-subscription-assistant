import { Middleware } from 'grammy';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { DateTime } from 'luxon';
import { markdownv2 } from 'telegram-format';

const invoicesCommand: Middleware = async ctx => {
	const limit = 5;
	const invoices = await invoiceRepo.getInvoices(limit, 1);
	const lines: string[] = [markdownv2.bold(`Останні ${limit} платежів:`), ''];
	for (const invoice of invoices) {
		const dateString = DateTime.fromJSDate(invoice.createdAt)
			.setLocale(process.env.LUXON_LOCALE as string)
			.toFormat('dd/LL/yyyy, HH:mm' + ' ZZZZ');
		lines.push(`${markdownv2.italic(dateString)} — ${markdownv2.escape(invoice.amount)} грн`);
	}
	const responseMsg = lines.join('  \n');

	await ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default invoicesCommand;
