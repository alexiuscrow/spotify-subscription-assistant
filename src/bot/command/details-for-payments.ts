import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { markdownv2 } from 'telegram-format';

const detailsForPaymentsCommand: Middleware<BotContext> = async ctx => {
	const outputLines = [
		markdownv2.bold('Реквізити для платежів'),
		'',
		'💳 Номер банківської карти:',
		`${process.env.MONOBANK_PAYMENT_CREDIT_CARD} ${markdownv2.escape('(Monobank)')}`,
		'',
		'🔗 Якщо сума платежу більше ніж 100 грн, то можна скористатися посиланням:',
		markdownv2.escape(process.env.MONOBANK_PAYMENT_LINK as string)
	];

	await ctx.reply(outputLines.join('\n'), {
		parse_mode: 'MarkdownV2'
	});
};

export default detailsForPaymentsCommand;
