import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import SubscriberManager from '@/manager/SubscriberManager';
import DebtManager from '@/manager/DebtManager';
import { User } from '@/store/repository/UserRepo';
import generatePageLines from '@/bot/utils/page';
import { markdownv2 } from 'telegram-format';
import googleSpreadsheetLinkMenu from '@/bot/menu/googleSpreadsheetLink';
import SpreadsheetManagerCached from '@/manager/cached/SpreadsheetManagerCached';

const debtorsCommand: Middleware<BotContext> = async ctx => {
	const outputLines = [];

	if (ctx.session.user?.role !== 'admin') {
		outputLines.push('Ця команда доступна тільки для адміністраторів.');
		return ctx.reply(outputLines.join('\n'));
	}

	let debtsInfo: { user: User; sum: number; monthNumber: number }[] = [];

	const subscribers = await SubscriberManager.getAllSubscribers({ with: { user: true } });
	for (const subscriber of subscribers) {
		const latestPaidDate = await SpreadsheetManagerCached.getLatestPaidDate(subscriber.spreadsheetSubscriberIndex);
		const subscriberDebts = await DebtManager.getAllDebts({ latestPaidDate });
		const subscriberDebtsSum = await DebtManager.getDebtsSum({ debts: subscriberDebts });

		if (subscriber.user) {
			debtsInfo.push({
				user: subscriber.user,
				sum: subscriberDebtsSum,
				monthNumber: subscriberDebts.length
			});
		}
	}

	debtsInfo = debtsInfo.filter(debtInfo => debtInfo.sum).sort((a, b) => b.sum - a.sum);

	if (debtsInfo.length) {
		outputLines.push(
			...generatePageLines({
				title: 'Дебітори',
				items: debtsInfo,
				generateItemInfo: ({ user, sum, monthNumber }, index) => {
					const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
					const userMention = markdownv2.userMention(markdownv2.escape(fullName), user.telegramId);
					return `${index + 1}\\. ${userMention} ${markdownv2.escape(`- ${sum} грн (${monthNumber} міс.)`)}`;
				}
			})
		);
	} else {
		outputLines.push(markdownv2.escape(`У всіх зареєстрованих підписників (${subscribers.length}) немає боргів.`));
	}

	await ctx.reply(outputLines.join('\n'), {
		parse_mode: 'MarkdownV2',
		reply_markup: googleSpreadsheetLinkMenu
	});
};

export default debtorsCommand;
