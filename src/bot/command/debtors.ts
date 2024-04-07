import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import SubscriberManager from '@/manager/SubscriberManager';
import SpreadsheetManager from '@/manager/SpreadsheetManager';
import DebtManager from '@/manager/DebtManager';
import { User } from '@/store/repository/UserRepo';
import generatePageLines from '@/bot/utils/page';
import { markdownv2 } from 'telegram-format';

const debtorsCommand: Middleware<BotContext> = async ctx => {
	const outputLines = [];

	if (ctx.session.user?.role !== 'admin') {
		outputLines.push('Ця команда доступна тільки для адміністраторів.');
		return ctx.reply(outputLines.join('\n'));
	}

	let debtsInfo: { user: User; sum: number; monthNumber: number }[] = [];

	const subscribers = await SubscriberManager.getAllSubscribers({ with: { user: true } });
	for (const subscriber of subscribers) {
		const latestPaidDate = await SpreadsheetManager.getLatestPaidDate(subscriber.spreadsheetSubscriberIndex);
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

	debtsInfo = debtsInfo.sort((a, b) => b.sum - a.sum);

	outputLines.push(
		...generatePageLines({
			title: 'Дебітори',
			items: debtsInfo,
			generateItemInfo: ({ user, sum, monthNumber }, index) => {
				const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
				const userLink = markdownv2.link(markdownv2.escape(fullName), `tg://user?id=${user.id}`);
				return `${index + 1}\\. ${userLink} ${markdownv2.escape(`- ${sum} грн (${monthNumber} міс.)`)}`;
			}
		})
	);

	await ctx.reply(outputLines.join('\n'), {
		parse_mode: 'MarkdownV2'
	});
};

export default debtorsCommand;
