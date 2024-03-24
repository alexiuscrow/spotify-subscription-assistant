import { Composer } from 'grammy';
import startCommand from '@/bot/command/start';
import helpCommand from '@/bot/command/help';
import invoicesCommand from '@/bot/command/invoices';
import myStatusCommand from '@/bot/command/my-status';
import BotContext from '@/bot/BotContext';

const commandComposer = new Composer<BotContext>();

commandComposer.command('start', startCommand);
commandComposer.command('my_status', myStatusCommand);
commandComposer.command('invoices', invoicesCommand);
commandComposer.command('help', helpCommand);

export default commandComposer;
