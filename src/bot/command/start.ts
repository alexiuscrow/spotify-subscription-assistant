import { Middleware } from 'grammy';

const startCommand: Middleware = async ctx => {
	await ctx.api.setMyCommands([{ command: 'help', description: 'Показати довідку' }]);

	await ctx.reply('З приводу будь-якийх питань звертайтесь до адміна підписки.');
};

export default startCommand;
