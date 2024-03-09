import { Composer, Context } from 'grammy';
import startCommand from '@/bot/command/start';
import helpCommand from '@/bot/command/help';
import invoicesCommand from '@/bot/command/invoices';

const commandComposer = new Composer<Context>();

commandComposer.command('start', startCommand);
commandComposer.command('help', helpCommand);
commandComposer.command('invoices', invoicesCommand);

export default commandComposer;
