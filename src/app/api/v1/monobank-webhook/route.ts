import { NextRequest } from 'next/server';
import { MonobankEvent, StatementItem, StatementItemWithAccount, SubscriberPaymentComment } from '@/@types/monobank';
import SubscriptionManager from '@/manager/SubscriptionManager';
import InvoiceManager from '@/manager/InvoiceManager';
import { parseStringComment, subscriptionPaymentHashTag } from '@/bot/utils/paymentComment';
import logger from '@/logger';
import SubscriberManager from '@/manager/SubscriberManager';
import SpreadsheetManager from '@/manager/SpreadsheetManager';
import { user as userSchema } from '@/store/schema/user';
import bot from '@/bot';
import { markdownv2 } from 'telegram-format';
import UserManager from '@/manager/UserManager';
import DebtManager from '@/manager/DebtManager';

export async function POST(request: NextRequest) {
	const json = await request.json();

	if (json?.type === 'StatementItem' && !!json.data?.statementItem) {
		const statementItemEvent = json as MonobankEvent<StatementItemWithAccount>;
		const invoiceStatement = statementItemEvent.data.statementItem;
		const expectedSpotifyPaymentDescription = process.env.SUBSCRIPTION_INVOICE_STATEMENT_DESCRIPTION;

		if (invoiceStatement.description === expectedSpotifyPaymentDescription) {
			const subscription = await SubscriptionManager.getSubscription();
			if (subscription) {
				const { amount } = await InvoiceManager.createInvoice(invoiceStatement, subscription.id);

				await logger.info(`New invoice created. Amount: ${amount}`);
			} else {
				await logger.error('Subscription not found');
			}
		} else if ((invoiceStatement.description || '').includes(subscriptionPaymentHashTag)) {
			let subscriberPaymentComment: SubscriberPaymentComment | null = null;
			try {
				subscriberPaymentComment = parseStringComment(invoiceStatement.description);
			} catch (error) {
				const errorMessage: string = error instanceof Error ? error.message : '';
				await logger.error(`Failed to parse subscriber payment comment. ${errorMessage}`);
			}

			if (subscriberPaymentComment) {
				let payedMonthNumber = 0;
				let overpayAmount = 0;

				try {
					const paymentMeta = await SubscriberManager.getNumberOfPayedMonthsInfo(
						subscriberPaymentComment.subscriberId,
						invoiceStatement.amount
					);
					payedMonthNumber = paymentMeta.payedMonths;
					overpayAmount = paymentMeta.overpayAmount;
				} catch (error) {
					const errorMessage: string = error instanceof Error ? error.message : '';
					await logger.error(`Failed to get number of payed months. ${errorMessage}`);
				}

				if (payedMonthNumber) {
					const subscriber = await SubscriberManager.getSubscriberById(subscriberPaymentComment.subscriberId, {
						with: { user: true }
					});
					if (subscriber) {
						const latestWrotePaymentDate = await SpreadsheetManager.writePayments(
							subscriber.spreadsheetSubscriberIndex,
							payedMonthNumber
						);
						const debtSum = await DebtManager.getDebtsSum({
							latestPayedDate: latestWrotePaymentDate
						});
						// noinspection TypeScriptUnresolvedReference
						const user = subscriber.user as typeof userSchema.$inferSelect;

						const subscriberMessageLines = [
							markdownv2.escape(`Дані про оплату за ${payedMonthNumber} місяці(в) успішно збережені.`)
						];
						const adminMessageLines = [
							`Користувач ${markdownv2.bold(`${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`)} ${markdownv2.escape(`(id ${user.id}) оплатив ${payedMonthNumber} місяці(в).`)}`
						];

						if (overpayAmount) {
							subscriberMessageLines.push('');
							subscriberMessageLines.push(
								`⚠️ ${markdownv2.bold(markdownv2.escape(`Ви переплатили ${overpayAmount} грн.`))} ${markdownv2.escape(`Такі кошти не можуть бути зараховані "на перед" і будуть проігноровані. Зверніться до адміністратора.`)}`
							);
							adminMessageLines.push('');
							adminMessageLines.push(
								`⚠️ ${markdownv2.bold(markdownv2.escape(`Платіж з переплатою ${overpayAmount} грн.`))}`
							);

							await logger.info(
								`Subscriber '${user.firstName}' (id ${subscriberPaymentComment.subscriberId}) overpayed for ${overpayAmount}`
							);
						}

						if (debtSum) {
							subscriberMessageLines.push('');
							subscriberMessageLines.push(markdownv2.escape(`До сплати залишилось: ${debtSum} грн.`));
							subscriberMessageLines.push(
								`Використовуй ${markdownv2.url(markdownv2.escape('/my_status'), '/my_status')} щоб дізнатись більше\\.`
							);

							adminMessageLines.push('');
							adminMessageLines.push(markdownv2.escape(`До сплати залишилось: ${debtSum} грн.`));
						}

						await bot.api.sendMessage(user.telegramId, subscriberMessageLines.join('\n'), {
							parse_mode: 'MarkdownV2'
						});

						const adminUsers = await UserManager.getActiveAdminUsers();
						for (const adminUser of adminUsers) {
							await bot.api.sendMessage(adminUser.telegramId, adminMessageLines.join('\n'), {
								parse_mode: 'MarkdownV2'
							});
						}
					} else {
						await logger.error(`Subscriber with id ${subscriberPaymentComment.subscriberId} not found`);
					}
				}
			}
		}
	}

	return new Response(null, { status: 200 });
}
