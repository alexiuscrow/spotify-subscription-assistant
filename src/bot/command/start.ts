import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';

const startCommand: Middleware<BotContext> = async ctx => {
	await ctx.api.setMyCommands([
		{ command: 'my_payments', description: 'Мої платежі' },
		{ command: 'invoices', description: 'Списання за підписку' },
		{ command: 'help', description: 'Показати довідку' }
	]);

	return ctx.reply('Привіт! Напиши /help, щоб побачити список команд.');
};

export default startCommand;
