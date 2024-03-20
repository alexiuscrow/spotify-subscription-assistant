import { Composer } from 'grammy';
import startCommand from '@/bot/command/start';
import helpCommand from '@/bot/command/help';
import invoicesCommand from '@/bot/command/invoices';
import myPaymentsCommand from '@/bot/command/my-payments';
import BotContext from '@/bot/BotContext';

const commandComposer = new Composer<BotContext>();

commandComposer.command('start', startCommand);
commandComposer.command('my_payments', myPaymentsCommand);
commandComposer.command('invoices', invoicesCommand);
commandComposer.command('help', helpCommand);

export default commandComposer;
