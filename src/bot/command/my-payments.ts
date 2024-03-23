import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { getPaymentsForAllYearsBySubscriber } from '@/spreadsheet';
import { markdownv2 } from 'telegram-format';
import { DateTime } from 'luxon';
import logger from '@/logger';

const myPaymentsCommand: Middleware<BotContext> = async ctx => {
	if (ctx.session.user?.role === 'admin') {
		return ctx.reply('Ця команда доступна тільки для звичайних користувачів.');
	} else if (!ctx.session.user?.subscriber) {
		return ctx.reply('Щось пішло не так. Звернись до адміна.');
	}

	const payments = await getPaymentsForAllYearsBySubscriber(ctx.session.user.subscriber.spreadsheetSubscriberIndex);
	let latestDate: DateTime | null = null;
	const outputLines = [];

	for (const year in payments) {
		const subscriber = payments[year];
		for (const month in subscriber) {
			const paymentStatus = subscriber[month];
			if (paymentStatus === true) {
				const currentDate = DateTime.fromObject({ year: parseInt(year), month: parseInt(month) });
				if (!latestDate || currentDate > latestDate) {
					// noinspection TypeScriptUnresolvedReference
					logger.info(`${currentDate.toFormat('LLLL yyyy')} > ${latestDate?.toFormat('LLLL yyyy')}`);
					latestDate = currentDate;
				}
			}
		}
	}

	if (latestDate) {
		outputLines.push(markdownv2.escape(`Останній платіж: ${latestDate.toFormat('LLLL yyyy')}`));
	} else {
		outputLines.push('Платежів не знайдено');
	}

	const responseMsg = outputLines.join('  \n');
	return ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default myPaymentsCommand;
