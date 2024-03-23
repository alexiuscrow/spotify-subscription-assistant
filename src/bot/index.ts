import { Bot, session } from 'grammy';
import commands from '@/bot/command';
import authenticator from '@/bot/authenticator';
import menuComposer from '@/bot/menu';
import BotContext, { SessionData } from '@/bot/BotContext';
import { desc } from 'drizzle-orm';
import { SearchInvoicesPageDirection } from '@/store/repositories/invoiceRepo';
import { invoice as invoiceSchema } from '@/store/schema';
import logger from '@/bot/logger';

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
				pageDirection: SearchInvoicesPageDirection.REVERSE
			}
		}
	};
}
bot.use(session({ initial }));

bot.use(logger);
bot.use(authenticator);
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
