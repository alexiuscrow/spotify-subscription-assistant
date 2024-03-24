import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';

const startCommand: Middleware<BotContext> = async ctx => {
	await ctx.api.setMyCommands([
		{ command: 'my_status', description: 'Мої платежі' },
		{ command: 'invoices', description: 'Списання за підписку' },
		{ command: 'details_for_payments', description: 'Реквізити для платежів' }
	]);
};

export default startCommand;
