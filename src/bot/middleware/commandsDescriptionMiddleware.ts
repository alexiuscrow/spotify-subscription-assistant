import { MiddlewareFn } from 'grammy';
import BotContext, { BotContextWithoutCommandsFlavor } from '@/bot/BotContext';
import { Commands } from '@grammyjs/commands';
import invoicesCommand from '@/bot/command/invoices2';

const commandsDescriptionMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
	const cmds = new Commands<BotContextWithoutCommandsFlavor>();

	// noinspection TypeScriptValidateTypes
	cmds
		.command('invoices', 'Списання за підписку!!!', invoicesCommand)
		.localize('en', 'invoices', 'Subscription charges!!!')
		.addToScope({ type: 'all_private_chats' }, invoicesCommand);

	await ctx.setMyCommands(cmds);
	await next();
};

export default commandsDescriptionMiddleware;
