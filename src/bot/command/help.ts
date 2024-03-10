import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';

const helpCommand: Middleware<BotContext> = async ctx => {
	await ctx.reply('З приводу будь-якийх питань звертайтесь до адміна підписки.');
};

export default helpCommand;
