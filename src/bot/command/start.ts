import { Middleware } from 'grammy';
import BotContext from '@/bot/BotContext';
import { BotCommand } from '@grammyjs/types';

const startCommand: Middleware<BotContext> = async ctx => {
	const commands: BotCommand[] = [
		{ command: 'invoices', description: 'Списання за підписку' },
		{ command: 'details_for_payments', description: 'Реквізити для платежів' }
	];

	if (ctx.session.user?.role === 'admin') {
		commands.unshift({ command: 'debtors', description: 'Дебітори' });
	} else {
		commands.unshift({ command: 'my_status', description: 'Мої платежі' });
	}

	await ctx.api.setMyCommands(commands);
};

export default startCommand;
