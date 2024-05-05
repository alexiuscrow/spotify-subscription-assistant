import { Bot, session } from 'grammy';
import commands from '@/bot/command';
import authenticatorMiddleware from '@/bot/middleware/authenticatorMiddleware';
import menuComposer from '@/bot/menu';
import BotContext, { SessionData } from '@/bot/BotContext';
import { desc } from 'drizzle-orm';
import { invoice as invoiceSchema } from '@/store/schema';
import loggerMiddleware from '@/bot/middleware/logger';
import { SearchPageDirection } from '@/store/interfaces';
import { I18n } from '@grammyjs/i18n';
import path from 'path';

let bot: Bot<BotContext> | null = null;

export const getBot = async (): Promise<Bot<BotContext>> => {
	if (bot) {
		return bot;
	}

	const token = process.env.TELEGRAM_TOKEN;
	if (!token) throw new Error('TELEGRAM_TOKEN is unset');

	bot = new Bot<BotContext>(token);

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

	const i18n = new I18n<BotContext>({
		defaultLocale: 'uk',
		directory: path.join(process.cwd(), '/src/bot/locales')
	});

	bot.use(i18n);
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
			'Автоматично фіксувати платежі за підписку у разі оплати за посиланням Monobank'
		]
			.map(item => `‣ ${item}`)
			.join('\n')
	);

	await bot.api.setMyShortDescription(
		'Бот, створений для управління сімейною підпискою Spotify. Він дозволяє переглядати статус платежів за ' +
			'підписку кожного користувача, розраховувати суму, яку необхідно сплатити, а також автоматично фіксує списання за ' +
			'підписку Spotify. '
	);

	return bot;
};
