import { Bot, webhookCallback } from 'grammy';
import { type ReactionTypeEmoji } from '@grammyjs/types';

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is unset');

const bot = new Bot(token);

bot.command('start', ctx => ctx.reply('Ласкаво просимо! Бот запущений.'));

bot.on('message', async ctx => {
	const emoji = emojis[Math.floor(Math.random() * emojis.length)];
	console.log('Message ->', ctx.message);
	// await ctx.react(emoji);
	return ctx.reply('Я відповів на ваше повідомлення з реакцією!');
});

export const POST = webhookCallback(bot, 'std/http');

const emojis: ReactionTypeEmoji['emoji'][] = [
	'👍',
	'👎',
	'❤',
	'🔥',
	'🥰',
	'👏',
	'😁',
	'🤔',
	'🤯',
	'😱',
	'🤬',
	'😢',
	'🎉',
	'🤩',
	'🤮',
	'💩',
	'🙏',
	'👌',
	'🕊',
	'🤡',
	'🥱',
	'🥴',
	'😍',
	'🐳',
	'❤‍🔥',
	'🌚',
	'🌭',
	'💯',
	'🤣',
	'⚡',
	'🍌',
	'🏆',
	'💔',
	'🤨',
	'😐',
	'🍓',
	'🍾',
	'💋',
	'🖕',
	'😈',
	'😴',
	'😭',
	'🤓',
	'👻',
	'👨‍💻',
	'👀',
	'🎃',
	'🙈',
	'😇',
	'😨',
	'🤝',
	'✍',
	'🤗',
	'🫡',
	'🎅',
	'🎄',
	'☃',
	'💅',
	'🤪',
	'🗿',
	'🆒',
	'💘',
	'🙉',
	'🦄',
	'😘',
	'💊',
	'🙊',
	'😎',
	'👾',
	'🤷‍♂',
	'🤷',
	'🤷‍♀',
	'😡'
];
