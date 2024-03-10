import { Composer } from 'grammy';
import startCommand from '@/bot/command/start';
import helpCommand from '@/bot/command/help';
import invoicesCommand from '@/bot/command/invoices';
import BotContext from '@/bot/BotContext';

const commandComposer = new Composer<BotContext>();

commandComposer.command('start', startCommand);
commandComposer.command('help', helpCommand);
commandComposer.command('invoices', invoicesCommand);

export default commandComposer;
