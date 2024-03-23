import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { getPaymentsForAllYearsBySubscriber } from '@/spreadsheet';
import { markdownv2 } from 'telegram-format';
import { DateTime } from 'luxon';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import * as subscriberHistoryRepo from '@/store/repositories/subscriberHistoryRepo';
import { desc, gt } from 'drizzle-orm';
import { invoice as invoiceSchema } from '@/store/schema';

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

		const notPayedInvoices = await invoiceRepo.getAllInvoices({
			orderByColumns: [desc(invoiceSchema.createdAt)],
			selection: gt(
				invoiceSchema.createdAt,
				DateTime.fromISO(<string>latestPayedDate.toISODate())
					.plus({ month: 1 })
					.toJSDate()
			)
		});

		const subscriberHistory = await subscriberHistoryRepo.getSubscriberHistory();

		const firstItemIndex = 0;
		const datesAndAmountsPerSubscriber = notPayedInvoices.map(invoice => {
			const invoiceDate = DateTime.fromJSDate(invoice.createdAt);
			const historyPoint = subscriberHistory.filter(h => DateTime.fromJSDate(h.date) <= invoiceDate)[firstItemIndex];
			const amountPerSubscriber = Number(invoice.amount) / Number(historyPoint.total);
			const amount = Math.ceil(amountPerSubscriber * 100) / 100;
			return {
				date: invoiceDate,
				amount
			};
		});

		for (const { date, amount } of datesAndAmountsPerSubscriber) {
			const dateString = date.setZone(process.env.LUXON_ZONE_NAME as string).toFormat('dd/LL/yy, HH:mm');
			outputLines.push(`${markdownv2.escape(dateString)} — ${markdownv2.escape(String(amount))} грн`);
		}
	}

	const responseMsg = outputLines.join('\n');
	return ctx.reply(responseMsg, { parse_mode: 'MarkdownV2' });
};

export default myPaymentsCommand;
