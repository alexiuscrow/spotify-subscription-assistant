import { Composer } from 'grammy';
import detailsForPaymentsCommand from '@/bot/command/details-for-payments';
import invoicesCommand from '@/bot/command/invoices';
import myStatusCommand from '@/bot/command/my-status';
import debtorsCommand from '@/bot/command/debtors';
import BotContext from '@/bot/BotContext';

const commandComposer = new Composer<BotContext>();

commandComposer.command('my_status', myStatusCommand);
commandComposer.command('details_for_payments', detailsForPaymentsCommand);
commandComposer.command('invoices', invoicesCommand);
commandComposer.command('debtors', debtorsCommand);

export default commandComposer;
