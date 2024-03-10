import { Composer } from 'grammy';
import invoicePagination from '@/bot/menu/invoicePagination';
import BotContext from '@/bot/BotContext';

const menuComposer = new Composer<BotContext>();

menuComposer.use(invoicePagination);

export default menuComposer;
