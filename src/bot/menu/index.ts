import { Composer, Context } from 'grammy';
import invoiceMenu from '@/bot/menu/invoicePagination';
import BotContext from '@/bot/BotContext';

const menuComposer = new Composer<BotContext>();

menuComposer.use(invoiceMenu);

export default menuComposer;
