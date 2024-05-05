import { MiddlewareFn } from 'grammy';
import BotContext from '@/bot/BotContext';
import { markdownv2 } from 'telegram-format';
import debtPaginationMenu from '@/bot/menu/debtPagination';
import logger from '@/logger';
import generatePageLines from '@/bot/utils/page';
import DebtManager from '@/manager/DebtManager';
import SpreadsheetManagerCached from '@/manager/cached/SpreadsheetManagerCached';

const myStatusCommand: MiddlewareFn<BotContext> = async ctx => {
	if (ctx.session.user?.role === 'admin') {
		logger.debug(
			`myStatusCommand: This command is available only for regular users, userRole: ${ctx.session.user?.role}`
		);
		return ctx.reply(ctx.t('the-command-allowed-for-regular-users-only'));
	} else if (!ctx.session.user?.subscriber) {
		logger.debug(
			`myStatusCommand:This command is available only for regular users, subscriber: ${ctx.session.user?.subscriber}`
		);
		return ctx.reply(ctx.t('shit-happens'));
	}

	const outputLines = [];

	const latestPaidDate =
		ctx.session.debt.latestPaidDate !== undefined
			? ctx.session.debt.latestPaidDate
			: await SpreadsheetManagerCached.getLatestPaidDate(ctx.session.user.subscriber.spreadsheetSubscriberIndex);

	if (latestPaidDate) {
		outputLines.push(
			ctx.t('last-payment-was-for-period', { date: markdownv2.bold(latestPaidDate.toFormat('dd MMMM, yyyy')) })
		);
	} else {
		outputLines.push(ctx.t('payments-not-found'));
	}

	const debtSum = ctx.session.debt.sum || (await DebtManager.getDebtsSum({ latestPaidDate }));

	outputLines.push('');
	if (debtSum) {
		const sessionPagination = ctx.session.debt.pagination;
		const { items: debts, pagination } = await DebtManager.getDebts({
			limit: sessionPagination.limit,
			page: sessionPagination.page,
			orderByColumns: sessionPagination.orderByColumns,
			pageDirection: sessionPagination.pageDirection,
			latestPaidDate
		});

		const isPaginationMenuWillBeShowed = pagination.hasPrev || pagination.hasNext;

		outputLines.push(
			...generatePageLines(ctx, {
				title: ctx.t('not-payed-invoices'),
				generatePaginationInfo: () =>
					ctx.t('pagination-info-invoices', {
						page: pagination.page,
						totalPages: pagination.totalPages,
						numOfItemsOnPage: (debts as Array<object>).length,
						totalItems: pagination.total
					}),
				items: debts,
				generateItemInfo: ({ date, amount }: (typeof debts)[number]) => {
					const endDate = date.setZone(process.env.LUXON_ZONE_NAME as string);
					const formattedEndDate = endDate.toFormat(ctx.t('short-date-format'));
					const formattedStartDate = endDate.minus({ month: 1 }).toFormat(ctx.t('short-date-format'));
					return markdownv2.escape(
						`${formattedStartDate} - ${formattedEndDate} — ${String(amount)} ${ctx.t('currency')}`
					);
				},
				dataAfterItemList: [
					ctx.t('sum-of-not-payed-invoices', { debtSum }),
					'',
					markdownv2.italic(`${markdownv2.escape('*')} ${ctx.t('payment-rounded-to-1')}`)
				],
				showPaginationTips: isPaginationMenuWillBeShowed
			})
		);
	} else {
		outputLines.push(markdownv2.escape(ctx.t('all-invoices-payed')));
	}

	const responseMsg = outputLines.join('\n');
	await ctx.reply(responseMsg, {
		parse_mode: 'MarkdownV2',
		reply_markup: debtPaginationMenu
	});
	ctx.session.debt.latestPaidDate = undefined;
	ctx.session.debt.sum = undefined;
};

export default myStatusCommand;
