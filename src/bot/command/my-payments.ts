import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { getPaymentsForAllYearsBySubscriber } from '@/spreadsheet';
import { markdownv2 } from 'telegram-format';
import { DateTime } from 'luxon';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { desc, gt } from 'drizzle-orm';
import { invoice as invoiceSchema } from '@/store/schema';
import logger from '@/logger';

const myPaymentsCommand: Middleware<BotContext> = async ctx => {
	if (ctx.session.user?.role === 'admin') {
		return ctx.reply('Ця команда доступна тільки для звичайних користувачів.');
	} else if (!ctx.session.user?.subscriber) {
		return ctx.reply('Щось пішло не так. Звернись до адміна.');
	}

	const payments = await getPaymentsForAllYearsBySubscriber(ctx.session.user.subscriber.spreadsheetSubscriberIndex);
	let latestPayedDate: DateTime | null = null;
	const outputLines = [];

	for (const year in payments) {
		const subscriber = payments[year];
		for (const month in subscriber) {
			const paymentStatus = subscriber[month];
			if (paymentStatus === true) {
				const currentDate = DateTime.fromObject(
					{
						year: parseInt(year),
						month: parseInt(month) + 1,
						day: Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string)
					},
					{ locale: process.env.DATETIME_LOCALE as string }
				);
				if (!latestPayedDate || currentDate > latestPayedDate) {
					latestPayedDate = currentDate;
				}
			}
		}
	}

	if (!latestPayedDate) {
		outputLines.push('Платежів не знайдено');
	} else {
		outputLines.push(
			`Останній платіж було здійснено за період до ${markdownv2.bold(latestPayedDate.toFormat('dd MMMM, yyyy'))}`
		);

		const notPayedInvoices = await invoiceRepo.getInvoices({
			limit: 1,
			page: 1,
			orderByColumns: [desc(invoiceSchema.createdAt)],
			selection: gt(invoiceSchema.createdAt, latestPayedDate.toJSDate())
		});

		logger.info('notPayedInvoices', notPayedInvoices);
	}

	const responseMsg = outputLines.join('\n');
	return ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default myPaymentsCommand;
