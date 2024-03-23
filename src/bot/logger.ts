import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { inspect } from 'node:util';

const logger: Middleware<BotContext> = async (ctx, next) => {
	console.log('Logger', inspect(ctx, { depth: null }));

	await next();
};

export default logger;
