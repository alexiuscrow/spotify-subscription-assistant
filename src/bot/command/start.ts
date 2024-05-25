import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { markdownv2 } from 'telegram-format';

const startCommand: Middleware<BotContext> = async ctx => {
	const outputLines = [
		markdownv2.bold('Вам наступні наступні команди:'),
		'',
		'/my_status \\— Стан ваших платежів та заборгованності',
		'',
		'/invoices \\— Списання за підписку Spotify Premium',
		'',
		'/details_for_payments \\— Можливі способи оплати'
	];

	await ctx.reply(outputLines.join('\n'), {
		parse_mode: 'MarkdownV2'
	});
};

export default startCommand;
