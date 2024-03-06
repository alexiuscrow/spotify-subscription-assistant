import { Bot, webhookCallback } from 'grammy';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot(token);

bot.command('start', ctx => ctx.reply('Ласкаво просимо! Бот запущений.'));

bot.on('msg:text', async ctx => {
	console.log('Message ->', ctx.msg);
	await ctx.react(ctx.msg.text);
	// return ctx.reply('Я відповів на ваше повідомлення з реакцією!');
});

bot.on(':file', async ctx => ctx.reply('Бот підтримує тільки текстові повідомлення.'));

export const POST = webhookCallback(bot, 'std/http');
