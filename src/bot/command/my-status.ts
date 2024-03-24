import { MiddlewareFn } from 'grammy';
import BotContext from '@/bot/BotContext';
import { getLatestPayedDate } from '@/spreadsheet';
import { markdownv2 } from 'telegram-format';
import { DateTime } from 'luxon';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import * as subscriberHistoryRepo from '@/store/repositories/subscriberHistoryRepo';
import { gt } from 'drizzle-orm';
import { invoice as invoiceSchema } from '@/store/schema';
import debtPaginationMenu from '@/bot/menu/debtPagination';
import logger from '@/logger';
import generatePageLines from '@/bot/utils/page';

const myStatusCommand: MiddlewareFn<BotContext> = async ctx => {
	await logger.debug(`myStatusCommand`);

	if (ctx.session.user?.role === 'admin') {
		await logger.debug(
			`myStatusCommand: Ця команда доступна тільки для звичайних користувачів, userRole: ${ctx.session.user?.role}`
		);
		return ctx.reply('Ця команда доступна тільки для звичайних користувачів.');
	} else if (!ctx.session.user?.subscriber) {
		await logger.debug(
			`myStatusCommand: Ця команда доступна тільки для звичайних користувачів, subscriber: ${ctx.session.user?.subscriber}`
		);
		return ctx.reply('Щось пішло не так. Звернись до адміна.');
	}

	const outputLines = [];

	const latestPayedDate =
		ctx.session.debt.latestPayedDate !== undefined
			? ctx.session.debt.latestPayedDate
			: await getLatestPayedDate(ctx.session.user.subscriber.spreadsheetSubscriberIndex);

	if (!latestPayedDate) {
		outputLines.push('Платежів не знайдено');
	} else {
		outputLines.push(
			`Останній платіж було здійснено за період до ${markdownv2.bold(latestPayedDate.toFormat('dd MMMM, yyyy'))}`
		);
		const sessionPagination = ctx.session.debt.pagination;
		const { items, pagination } = await invoiceRepo.getInvoices({
			limit: sessionPagination.limit,
			page: sessionPagination.page,
			orderByColumns: sessionPagination.orderByColumns,
			pageDirection: sessionPagination.pageDirection,
			selection: gt(
				invoiceSchema.createdAt,
				DateTime.fromISO(<string>latestPayedDate.toISODate())
					.plus({ month: 1 })
					.toJSDate()
			)
		});

		const isPaginationMenuNeeded = pagination.hasPrev || pagination.hasNext;

		const subscriberHistory = await subscriberHistoryRepo.getSubscriberHistory();

		const firstItemIndex = 0;
		const datesAndAmountsPerSubscriber = items.map(invoice => {
			const invoiceDate = DateTime.fromJSDate(invoice.createdAt).set({
				day: Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string)
			});
			const historyPoint = subscriberHistory.filter(h => DateTime.fromJSDate(h.date) <= invoiceDate)[firstItemIndex];
			const amountPerSubscriber = Number(invoice.amount) / Number(historyPoint.total);
			const amount = Math.ceil(amountPerSubscriber);
			return {
				date: invoiceDate,
				amount
			};
		});

		outputLines.push('');
		outputLines.push(
			...generatePageLines({
				title: 'Несплачені рахунки',
				generatePaginationInfo: () =>
					`Сторінка ${pagination.page} з ${pagination.totalPages}. Рахунки ${(items as Array<object>).length} з ${pagination.total}.`,
				items: datesAndAmountsPerSubscriber,
				generateItemInfo: ({ date, amount }: (typeof datesAndAmountsPerSubscriber)[number]) => {
					const endDate = date.setZone(process.env.LUXON_ZONE_NAME as string);
					const formattedEndDate = endDate.toFormat('dd/LL/yy');
					const formattedStartDate = endDate.minus({ month: 1 }).toFormat('dd/LL/yy');
					return `${formattedStartDate} - ${formattedEndDate} — ${String(amount)} грн`;
				},
				textAfterItemList: markdownv2.italic('Всі суми округлені до 1 гривні'),
				showPaginationTips: isPaginationMenuNeeded
			})
		);

		const responseMsg = outputLines.join('\n');
		await ctx.reply(responseMsg, {
			parse_mode: 'MarkdownV2',
			reply_markup: isPaginationMenuNeeded ? debtPaginationMenu : undefined
		});
		ctx.session.debt.latestPayedDate = undefined;
	}
};

export default myStatusCommand;
