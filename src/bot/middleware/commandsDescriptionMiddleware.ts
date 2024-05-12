// noinspection TypeScriptValidateTypes

import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { Commands } from '@grammyjs/commands';

const commandsDescriptionMiddleware: Middleware<BotContext> = async (ctx, next) => {
	const cmds = new Commands();

	cmds
		.command('invoices', 'Списання за підписку')
		.localize('en', 'invoices', 'Subscription charges')
		.addToScope({ type: 'all_private_chats' }, ctx => ctx.reply('ok'));

	await ctx.setMyCommands(cmds);
	await next();
};

export default commandsDescriptionMiddleware;
