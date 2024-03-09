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
			.setZone(process.env.LUXON_ZONE_NAME as string)
			.toFormat('dd/LL/yy, HH:mm' + ' ZZZZ');
		lines.push(`${markdownv2.italic(markdownv2.escape(dateString))} — ${markdownv2.escape(invoice.amount)} грн`);
	}
	const responseMsg = lines.join('  \n');

	await ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default invoicesCommand;
