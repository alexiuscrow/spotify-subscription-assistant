import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { Commands } from '@grammyjs/commands';
import invoicesCommand from '@/bot/command/invoices2';

const commandsDescriptionMiddleware: Middleware<BotContext> = async (ctx, next) => {
	const cmds = new Commands();

	cmds
		.command('invoices', 'Списання за підписку!!!', invoicesCommand)
		.localize('en', 'invoices', 'Subscription charges!!!');

	await ctx.setMyCommands(cmds);
	await next();
};

export default commandsDescriptionMiddleware;
