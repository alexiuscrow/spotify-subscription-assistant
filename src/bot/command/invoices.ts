import { Middleware } from 'grammy';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { DateTime } from 'luxon';
import { markdownv2 } from 'telegram-format';

const invoicesCommand: Middleware = async ctx => {
	console.log(ctx.match);
	const fetchLimit = 5;
	const { items, limit, page, total, hasPrev, hasNext } = await invoiceRepo.getInvoices({ limit: fetchLimit });
	console.log({ items, limit, page, total, hasPrev, hasNext });
	const lines: string[] = [markdownv2.bold(`Останні ${fetchLimit} платежів:`), ''];
	for (const invoice of items) {
		const dateString = DateTime.fromJSDate(invoice.createdAt)
			.setZone(process.env.LUXON_ZONE_NAME as string)
			.toFormat('dd/LL/yy, HH:mm');
		lines.push(`${markdownv2.italic(markdownv2.escape(dateString))} — ${markdownv2.escape(invoice.amount)} грн`);
	}
	const responseMsg = lines.join('  \n');

	await ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default invoicesCommand;
