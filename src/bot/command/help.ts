import { Middleware } from 'grammy';

const helpCommand: Middleware = async ctx => {
	await ctx.reply('З приводу будь-якийх питань звертайтесь до адміна підписки.');
};

export default helpCommand;
