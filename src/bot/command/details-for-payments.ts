import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { markdownv2 } from 'telegram-format';

const detailsForPaymentsCommand: Middleware<BotContext> = async ctx => {
	const outputLines = [
		markdownv2.bold(ctx.t('details-for-payments')),
		'',
		ctx.t('card-number-caption'),
		`${process.env.MONOBANK_PAYMENT_CREDIT_CARD} ${markdownv2.escape(`(${ctx.t('bank-name ')})`)}`,
		'',
		ctx.t('payment-link-caption'),
		markdownv2.escape(process.env.MONOBANK_PAYMENT_LINK as string)
	];

	await ctx.reply(outputLines.join('\n'), {
		parse_mode: 'MarkdownV2'
	});
};

export default detailsForPaymentsCommand;
