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
		},
		debt: {
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

await bot.api.setMyDescription(
	[
		'Відображати інформацію щодо стану платежів за підписку для кожного учасника сімейної підписки',
		'Визначати суму, необхідну до сплати',
		'Відображати всі списання сервісом Spotify плати за підписку та автоматично фіксувати їх',
		'Надати актуальні реквізити для сплати',
		'Автоматично фіксувати платеджі за підписку у разі оплати за посиланням Monobank'
	]
		.map(item => `‣ ${item}`)
		.join('\n')
);

export default bot;
