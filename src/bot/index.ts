import { Bot, session } from 'grammy';
import commands from '@/bot/command';
import authenticatorMiddleware from '@/bot/middleware/authenticatorMiddleware';
import menuComposer from '@/bot/menu';
import BotContext, { SessionData } from '@/bot/BotContext';
import { desc } from 'drizzle-orm';
import { invoice as invoiceSchema } from '@/store/schema';
import loggerMiddleware from '@/bot/middleware/logger';
import { SearchPageDirection } from '@/@types/db';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot<BotContext>(token);

bot.on(':file', async ctx => ctx.reply('Бот підтримує тільки текстові повідомлення.'));

function initial(): SessionData {
	return {
		invoice: {
			pagination: {
				limit: 12,
				page: 1,
				orderByColumns: [desc(invoiceSchema.createdAt)],
				pageDirection: SearchPageDirection.REVERSE
			}
		}
	};
}
bot.use(session({ initial }));

bot.use(loggerMiddleware);
bot.use(authenticatorMiddleware);
bot.use(menuComposer);
bot.use(commands);

// TODO: add logger
// bot.on('msg:text').filter(
// 	async ctx => ctx.senderChat === undefined, // Regular messages sent by `ctx.from`
// 	async ctx => {
// 		console.log('Message ->', ctx.msg);
// 		await ctx.reply(ctx.msg.text);
// 	}
// );

export default bot;
