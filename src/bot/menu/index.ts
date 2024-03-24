import { Composer } from 'grammy';
import invoicePagination from '@/bot/menu/invoicePagination';
import debtPagination from '@/bot/menu/debtPagination';
import BotContext from '@/bot/BotContext';

const menuComposer = new Composer<BotContext>();

menuComposer.use(invoicePagination);
menuComposer.use(debtPagination);

export default menuComposer;
