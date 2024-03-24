import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { markdownv2 } from 'telegram-format';

const detailsForPaymentsCommand: Middleware<BotContext> = async ctx => {
	const outputLines = [
		`${markdownv2.bold('Реквізити для платежів')} `,
		'',
		'💳 Номер банківської карти:',
		process.env.MONOBANK_PAYMENT_CREDIT_CARD,
		'',
		'🔗 Якщо сума платежу більше ніж 100 грн, то можна скористатися посиланням:',
		process.env.MONOBANK_PAYMENT_LINK
	];

	await ctx.reply(outputLines.join('\n'));
};

export default detailsForPaymentsCommand;
