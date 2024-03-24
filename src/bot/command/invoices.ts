import { MiddlewareFn } from 'grammy';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { DateTime } from 'luxon';
import invoicePaginationMenu from '@/bot/menu/invoicePagination';
import BotContext from '@/bot/BotContext';
import generatePageLines from '@/bot/utils/page';

const invoicesCommand: MiddlewareFn<BotContext> = async ctx => {
	const sessionPagination = ctx.session.invoice.pagination;
	const { items, pagination } = await invoiceRepo.getInvoices({
		limit: sessionPagination.limit,
		page: sessionPagination.page,
		orderByColumns: sessionPagination.orderByColumns,
		pageDirection: sessionPagination.pageDirection
	});

	const isPaginationMenuNeeded = pagination.hasPrev || pagination.hasNext;

	const outputLines = generatePageLines({
		title: 'Платежі за підписку',
		generatePaginationInfo: () =>
			`Сторінка ${pagination.page} з ${pagination.totalPages}. Списання ${(items as Array<object>).length} з ${pagination.total}.`,
		items,
		generateItemInfo: ({ createdAt, amount }: (typeof items)[number]) => {
			const dateString = DateTime.fromJSDate(createdAt)
				.setZone(process.env.LUXON_ZONE_NAME as string)
				.toFormat('dd/LL/yy, HH:mm');
			return `${dateString} — ${amount} грн`;
		},
		showPaginationTips: isPaginationMenuNeeded
	});
	const responseMsg = outputLines.join('  \n');

	await ctx.reply(responseMsg, {
		parse_mode: 'MarkdownV2',
		reply_markup: isPaginationMenuNeeded ? invoicePaginationMenu : undefined
	});
};

export default invoicesCommand;
