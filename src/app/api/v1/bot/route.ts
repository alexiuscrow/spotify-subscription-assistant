import { Bot, webhookCallback } from 'grammy';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot(token);

bot.command('start', ctx => ctx.reply('Ласкаво просимо! Бот запущений.'));

await bot.api.setMyCommands([
	{ command: 'start', description: 'Запустити бота' },
	{ command: 'help', description: 'Показати довідку' }
]);

bot.on('msg:text').filter(
	async ctx => ctx.senderChat === undefined, // Regular messages sent by `ctx.from`
	async ctx => {
		console.log('Message ->', ctx.msg);
		await ctx.reply(ctx.msg.text);
	}
);

bot.on(':file', async ctx => ctx.reply('Бот підтримує тільки текстові повідомлення.'));

export const POST = webhookCallback(bot, 'std/http');
