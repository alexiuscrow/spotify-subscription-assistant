import { NextRequest } from 'next/server';
import { Bot, webhookCallback } from 'grammy';
import { ReactionTypeEmoji as RTE } from '@grammyjs/types';

export const POST = async (req: NextRequest, ...args: any[]) => {
	const token = process.env.TELEGRAM_TOKEN;
	if (!token) throw new Error('TELEGRAM_TOKEN is unset');

	const bot = new Bot(token);

	bot.command('start', ctx => ctx.reply('Ласкаво просимо! Бот запущений.'));

	bot.on('message', async ctx => {
		const emojis = RTE['emoji'];
		const emoji = emojis[Math.floor(Math.random() * emojis.length)];
		await ctx.react(emoji);
		return ctx.reply('Отримав ще одне повідомлення!');
	});

	const handleUpdate = webhookCallback(bot, 'std/http', 'throw', 10000);

	return handleUpdate(req, ...args);
};
