import { CommandContext, MiddlewareFn } from 'grammy';
import { DateTime } from 'luxon';
import invoicePaginationMenu from '@/bot/menu/invoicePagination';
import { BotContextWithoutCommandsFlavor } from '@/bot/BotContext';
import generatePageLines from '@/bot/utils/page';
import { markdownv2 } from 'telegram-format';
import InvoiceManager from '@/manager/InvoiceManager';

const invoicesCommand: MiddlewareFn<CommandContext<BotContextWithoutCommandsFlavor>> = async ctx => {
	const sessionPagination = ctx.session.invoice.pagination;
	const { items, pagination } = await InvoiceManager.getInvoices({
		limit: sessionPagination.limit,
		page: sessionPagination.page,
		orderByColumns: sessionPagination.orderByColumns,
		pageDirection: sessionPagination.pageDirection
	});

	const isPaginationMenuNeeded = pagination.hasPrev || pagination.hasNext;

	const outputLines = generatePageLines(ctx, {
		title: ctx.t('payments-for-subscription'),
		generatePaginationInfo: () =>
			ctx.t('pagination-info-payments', {
				page: pagination.page,
				totalPages: pagination.totalPages,
				numOfItemsOnPage: (items as Array<object>).length,
				totalItems: pagination.total
			}),
		items,
		generateItemInfo: ({ createdAt, amount }: (typeof items)[number]) => {
			const dateString = DateTime.fromJSDate(createdAt)
				.setZone(process.env.LUXON_ZONE_NAME as string)
				.toFormat(ctx.t('short-datetime-format'));
			return markdownv2.escape(`${dateString} — ${amount} ${ctx.t('currency')}`);
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
