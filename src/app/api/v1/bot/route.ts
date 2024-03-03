// import { NextRequest } from 'next/server';
import { Bot, webhookCallback } from 'grammy';

export const POST = async (req: Request, ...args: any[]) => {
	const token = process.env.TELEGRAM_TOKEN;
	if (!token) throw new Error('TELEGRAM_TOKEN is unset');

	const bot = new Bot(token);

	bot.command('start', ctx => ctx.reply('Ласкаво просимо! Бот запущений.'));

	bot.on('message', ctx => ctx.reply('Отримав ще одне повідомлення!'));

	const handleUpdate = webhookCallback(bot, 'https');

	return handleUpdate(req, ...args);
};
