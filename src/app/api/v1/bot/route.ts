import { Bot, webhookCallback } from 'grammy';
import commands from '@/bot/command';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot(token);

bot.on(':file', async ctx => ctx.reply('Бот підтримує тільки текстові повідомлення.'));

bot.use(commands);

bot.on('msg:text').filter(
	async ctx => ctx.senderChat === undefined, // Regular messages sent by `ctx.from`
	async ctx => {
		console.log('Message ->', ctx.msg);
		await ctx.reply(ctx.msg.text);
	}
);

export const POST = webhookCallback(bot, 'std/http');
