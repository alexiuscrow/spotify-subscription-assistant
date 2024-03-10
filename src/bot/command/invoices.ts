import { MiddlewareFn } from 'grammy';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { DateTime } from 'luxon';
import { markdownv2 } from 'telegram-format';
import invoicePagination from '@/bot/menu/invoicePagination';
import BotContext from '@/bot/BotContext';

const invoicesCommand: MiddlewareFn<BotContext> = async ctx => {
	const sessionPagination = ctx.session.invoice.pagination;
	const { items, pagination } = await invoiceRepo.getInvoices({
		limit: sessionPagination.limit,
		page: sessionPagination.page,
		orderByColumns: sessionPagination.orderByColumns,
		pageDirection: sessionPagination.pageDirection
	});

	const lines: string[] = [
		markdownv2.bold(`Платежі за підписку`),
		markdownv2.italic(`${pagination.limit} з ${pagination.total}`),
		''
	];

	for (const invoice of items) {
		const dateString = DateTime.fromJSDate(invoice.createdAt)
			.setZone(process.env.LUXON_ZONE_NAME as string)
			.toFormat('dd/LL/yy, HH:mm');

		lines.push(`${markdownv2.escape(dateString)} — ${markdownv2.escape(invoice.amount)} грн`);
	}

	lines.push('');
	const isPaginationMenuNeeded = pagination.hasPrev || pagination.hasNext;
	if (isPaginationMenuNeeded) {
		lines.push(markdownv2.italic('Для перегляду попередніх або наступних платежів використовуйте кнопки нижче'));
	}
	const responseMsg = lines.join('  \n');

	await ctx.reply(responseMsg, {
		parse_mode: 'MarkdownV2',
		reply_markup: isPaginationMenuNeeded ? invoicePagination : undefined
	});
};

export default invoicesCommand;
