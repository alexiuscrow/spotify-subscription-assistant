import { MiddlewareFn } from 'grammy';
import BotContext from '@/bot/BotContext';
import { markdownv2 } from 'telegram-format';
import debtPaginationMenu from '@/bot/menu/debtPagination';
import logger from '@/logger';
import generatePageLines from '@/bot/utils/page';
import DebtManager from '@/manager/DebtManager';
import SpreadsheetManager from '@/manager/SpreadsheetManager';

const myStatusCommand: MiddlewareFn<BotContext> = async ctx => {
	if (ctx.session.user?.role === 'admin') {
		logger.debug(
			`myStatusCommand: Ця команда доступна тільки для звичайних користувачів, userRole: ${ctx.session.user?.role}`
		);
		return ctx.reply('Ця команда доступна тільки для звичайних користувачів.');
	} else if (!ctx.session.user?.subscriber) {
		logger.debug(
			`myStatusCommand: Ця команда доступна тільки для звичайних користувачів, subscriber: ${ctx.session.user?.subscriber}`
		);
		return ctx.reply('Щось пішло не так. Звернись до адміна.');
	}

	const outputLines = [];

	const latestPayedDate =
		ctx.session.debt.latestPayedDate !== undefined
			? ctx.session.debt.latestPayedDate
			: await SpreadsheetManager.getLatestPayedDate(ctx.session.user.subscriber.spreadsheetSubscriberIndex);

	if (latestPayedDate) {
		outputLines.push(
			`Останній платіж було здійснено за період до ${markdownv2.bold(latestPayedDate.toFormat('dd MMMM, yyyy'))}`
		);
	} else {
		outputLines.push('Платежі не знайдені');
	}

	const sessionPagination = ctx.session.debt.pagination;
	const { items: debts, pagination } = await DebtManager.getDebts({
		limit: sessionPagination.limit,
		page: sessionPagination.page,
		orderByColumns: sessionPagination.orderByColumns,
		pageDirection: sessionPagination.pageDirection,
		latestPayedDate
	});

	const isPaginationMenuWillBeShowed = pagination.hasPrev || pagination.hasNext;
	const debtSum = ctx.session.debt.sum || (await DebtManager.getDebtsSum({ latestPayedDate }));

	outputLines.push('');
	outputLines.push(
		...generatePageLines({
			title: 'Несплачені рахунки',
			generatePaginationInfo: () =>
				`Сторінка ${pagination.page} з ${pagination.totalPages}. Нарахування ${(debts as Array<object>).length} з ${pagination.total}.`,
			items: debts,
			generateItemInfo: ({ date, amount }: (typeof debts)[number]) => {
				const endDate = date.setZone(process.env.LUXON_ZONE_NAME as string);
				const formattedEndDate = endDate.toFormat('dd/LL/yy');
				const formattedStartDate = endDate.minus({ month: 1 }).toFormat('dd/LL/yy');
				return `${formattedStartDate} - ${formattedEndDate} — ${String(amount)} грн`;
			},
			dataAfterItemList: [
				`Сума несплачених нарахувань: ${debtSum} грн`,
				'',
				markdownv2.italic(`${markdownv2.escape('*')} Всі нарахування округлені до 1 гривні`)
			],
			showPaginationTips: isPaginationMenuWillBeShowed
		})
	);

	const responseMsg = outputLines.join('\n');
	await ctx.reply(responseMsg, {
		parse_mode: 'MarkdownV2',
		reply_markup: debtPaginationMenu
	});
	ctx.session.debt.latestPayedDate = undefined;
	ctx.session.debt.sum = undefined;
};

export default myStatusCommand;
