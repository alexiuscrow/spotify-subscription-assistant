import { Middleware } from 'grammy';

const startCommand: Middleware = async ctx => {
	await ctx.api.setMyCommands([{ command: 'help', description: 'Показати довідку' }]);

	await ctx.reply('Привіт! Напиши /help, щоб побачити список команд.');
};

export default startCommand;
