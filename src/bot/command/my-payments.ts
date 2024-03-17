import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';

const myPaymentsCommand: Middleware<BotContext> = async ctx => {
	return ctx.reply('Test');
};

export default myPaymentsCommand;
