import { NextRequest } from 'next/server';
import { MonobankEvent, StatementItem, StatementItemWithAccount } from '@/common-interfaces/monobank';
import SubscriptionManager from '@/manager/SubscriptionManager';
import InvoiceManager from '@/manager/InvoiceManager';
import { parseStringComment, subscriptionPaymentHashTag } from '@/bot/utils/paymentComment';
import logger from '@/logger';
import SubscriberManager from '@/manager/SubscriberManager';
import { getBot } from '@/bot';
import { markdownv2 } from 'telegram-format';
import DebtManager from '@/manager/DebtManager';
import SpreadsheetManagerCached from '@/manager/cached/SpreadsheetManagerCached';
import UserManagerCached from '@/manager/cached/UserManagerCached';

export const POST = async (request: NextRequest) => {
	const json = await request.json();

	if (json?.type === 'StatementItem' && !!json.data?.statementItem) {
		const statementItemEvent = json as MonobankEvent<StatementItemWithAccount>;
		const invoiceStatement = statementItemEvent.data.statementItem;
		const expectedSpotifyPaymentDescription = process.env.SUBSCRIPTION_INVOICE_STATEMENT_DESCRIPTION;

		if (invoiceStatement.description === expectedSpotifyPaymentDescription) {
			await handleSpotifySubscriptionPayment(invoiceStatement);
		} else if ((invoiceStatement.description || '').includes(subscriptionPaymentHashTag)) {
			await handleSubscriberPayment(invoiceStatement);
		}
	}

	return new Response(null, { status: 200 });
};

const handleSpotifySubscriptionPayment = async (invoiceStatement: StatementItem) => {
	const subscription = await SubscriptionManager.getSubscription();
	if (subscription) {
		const { amount } = await InvoiceManager.createInvoice(invoiceStatement, subscription.id);

		logger.info(`New invoice created. Amount: ${amount}`);
	} else {
		logger.error('Subscription not found');
	}
};

const handleSubscriberPayment = async (invoiceStatement: StatementItem) => {
	try {
		const subscriberPaymentComment = parseStringComment(invoiceStatement.description);

		if (!subscriberPaymentComment) {
			logger.error('Failed to parse subscriber payment comment');
			return;
		}

		const { paidMonths, overpayAmount } = await SubscriberManager.getNumberOfPaidMonthsInfo(
			subscriberPaymentComment.subscriberId,
			invoiceStatement.amount
		);

		if (paidMonths) {
			const subscriber = await SubscriberManager.getSubscriberById(subscriberPaymentComment.subscriberId, {
				with: { user: true }
			});

			if (!subscriber) {
				logger.error(`Subscriber with id ${subscriberPaymentComment.subscriberId} not found`);
				return;
			}

			const { user } = subscriber;

			const latestWrotePaymentDate = await SpreadsheetManagerCached.writePayments(
				subscriber.spreadsheetSubscriberIndex,
				paidMonths
			);

			const subscriberMessageLines = [
				markdownv2.escape(`Дані про оплату за ${paidMonths} місяці(в) успішно збережені.`)
			];
			const adminMessageLines = [
				`Користувач ${markdownv2.bold(`${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`)} ${markdownv2.escape(`(id ${user.id}) оплатив ${paidMonths} місяці(в).`)}`
			];

			if (overpayAmount) {
				subscriberMessageLines.push('');
				subscriberMessageLines.push(
					`⚠️ ${markdownv2.bold(markdownv2.escape(`Ви переплатили ${overpayAmount} грн.`))}${markdownv2.escape(` Такі кошти не можуть бути зараховані "на перед" і будуть проігноровані. Зверніться до адміністратора.`)}`
				);
				adminMessageLines.push('');
				adminMessageLines.push(`⚠️ ${markdownv2.bold(markdownv2.escape(`Платіж з переплатою ${overpayAmount} грн.`))}`);

				logger.info(
					`Subscriber '${user.firstName}' (id ${subscriberPaymentComment.subscriberId}) overpaid for ${overpayAmount}`
				);
			}

			const debtSum = await DebtManager.getDebtsSum({
				latestPaidDate: latestWrotePaymentDate
			});

			if (debtSum) {
				subscriberMessageLines.push('');
				subscriberMessageLines.push(markdownv2.escape(`До повної сплати залишилось: ${debtSum} грн.`));
				subscriberMessageLines.push(
					`Використовуй ${markdownv2.url(markdownv2.escape('/my_status'), '/my_status')} щоб дізнатись більше\\.`
				);

				adminMessageLines.push('');
				adminMessageLines.push(markdownv2.escape(`До повної сплати залишилось: ${debtSum} грн.`));
			}

			const bot = await getBot();

			await bot.api.sendMessage(user.telegramId, subscriberMessageLines.join('\n'), {
				parse_mode: 'MarkdownV2'
			});

			const adminUsers = await UserManagerCached.getActiveAdminUsers();

			for (const adminUser of adminUsers) {
				await bot.api.sendMessage(adminUser.telegramId, adminMessageLines.join('\n'), {
					parse_mode: 'MarkdownV2'
				});
			}
		} else {
			logger.info('No paid months found');
		}
	} catch (error) {
		const errorMessage: string = error instanceof Error ? error.message : '';
		logger.error(`Failed to parse subscriber payment comment. ${errorMessage}`);
	}
};
