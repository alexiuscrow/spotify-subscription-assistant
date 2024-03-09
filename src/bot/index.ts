import { Bot } from 'grammy';
import commands from '@/bot/command';
import authenticator from '@/bot/authenticator';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot(token);

bot.on(':file', async ctx => ctx.reply('Бот підтримує тільки текстові повідомлення.'));

bot.use(authenticator);
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