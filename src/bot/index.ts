import { Bot, session } from 'grammy';
import authenticatorMiddleware from '@/bot/middleware/authenticatorMiddleware';
import menuComposer from '@/bot/menu';
import BotContext, { initiateSession } from '@/bot/BotContext';
import loggerMiddleware from '@/bot/middleware/logger';
import { I18n } from '@grammyjs/i18n';
import path from 'path';
import commandsDescriptionMiddleware from '@/bot/middleware/commandsDescriptionMiddleware';
import { commands } from '@grammyjs/commands';

let bot: Bot<BotContext> | null = null;

export const getBot = async (): Promise<Bot<BotContext>> => {
	if (bot) {
		return bot;
	}

	const token = process.env.TELEGRAM_TOKEN;
	if (!token) throw new Error('TELEGRAM_TOKEN is unset');

	bot = new Bot<BotContext>(token);

	const i18n = new I18n<BotContext>({
		defaultLocale: 'uk',
		directory: path.join(process.cwd(), '/src/bot/locales')
	});

	bot.use(i18n);
	bot.use(session({ initial: initiateSession }));
	bot.use(commands());
	bot.use(commandsDescriptionMiddleware);
	bot.use(loggerMiddleware);
	bot.use(authenticatorMiddleware);
	bot.use(menuComposer);

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

	return bot;
};
