import { Middleware } from 'grammy';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { DateTime } from 'luxon';

const invoicesCommand: Middleware = async ctx => {
	const limit = 5;
	const invoices = await invoiceRepo.getInvoices(limit, 1);
	const lines: string[] = [`**Останні ${limit} платежів:**`, ''];
	for (const invoice of invoices) {
		const dateString = DateTime.fromJSDate(invoice.createdAt).toFormat('dd/LL/yyyy, HH:mm ZZZZ');
		lines.push(`*${dateString}* — ${invoice.amount.replace('.', '.')} грн`);
	}
	const responseMsg = lines.join('  \n');

	await ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default invoicesCommand;
