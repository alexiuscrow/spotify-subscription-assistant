import { Middleware } from 'grammy';

const startCommand: Middleware = async ctx => {
	await ctx.api.setMyCommands([
		{ command: 'invoices', description: 'Зписання за підписку' },
		{ command: 'help', description: 'Показати довідку' }
	]);

	return ctx.reply('Привіт! Напиши /help, щоб побачити список команд.');
};

export default startCommand;
