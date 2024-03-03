import { Bot, webhookCallback } from 'grammy';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot(token);

bot.command('start', ctx => ctx.reply('Ласкаво просимо! Бот запущений.'));

bot.on('message', ctx => ctx.reply('Отримав ще одне повідомлення!'));

export default webhookCallback(bot, 'next-js');
