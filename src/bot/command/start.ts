import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { BotCommand } from '@grammyjs/types';

const startCommand: Middleware<BotContext> = async ctx => {
	const commands: BotCommand[] = [
		{ command: 'invoices', description: 'Списання за підписку' },
		{ command: 'my_status', description: 'Мої платежі' },
		{ command: 'details_for_payments', description: 'Реквізити для платежів' }
	];

	// noinspection TypeScriptValidateTypes
	await ctx.api.setMyCommands(commands);
};

export default startCommand;
