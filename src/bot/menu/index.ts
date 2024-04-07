import { Composer } from 'grammy';
import invoicePagination from '@/bot/menu/invoicePagination';
import debtPagination from '@/bot/menu/debtPagination';
import googleSpreadsheetLink from '@/bot/menu/googleSpreadsheetLink';
import BotContext from '@/bot/BotContext';

const menuComposer = new Composer<BotContext>();

menuComposer.use(invoicePagination);
menuComposer.use(debtPagination);
menuComposer.use(googleSpreadsheetLink);

export default menuComposer;
