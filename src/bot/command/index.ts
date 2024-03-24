import { Composer } from 'grammy';
import startCommand from '@/bot/command/start';
import detailsForPaymentsCommand from '@/bot/command/details-for-payments';
import invoicesCommand from '@/bot/command/invoices';
import myStatusCommand from '@/bot/command/my-status';
import BotContext from '@/bot/BotContext';

const commandComposer = new Composer<BotContext>();

commandComposer.command('start', startCommand);
commandComposer.command('my_status', myStatusCommand);
commandComposer.command('details_for_payments', detailsForPaymentsCommand);
commandComposer.command('invoices', invoicesCommand);

export default commandComposer;
