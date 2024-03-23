import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { inspect } from 'node:util';
import logger from '@/logger';

const loggerMiddleware: Middleware<BotContext> = async (ctx, next) => {
	logger.info('Got new request.');
	logger.info(inspect(ctx, { depth: null }));

	await next();
};

export default loggerMiddleware;
