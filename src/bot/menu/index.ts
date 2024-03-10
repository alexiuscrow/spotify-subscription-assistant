import { Composer, Context } from 'grammy';
import invoiceMenu from '@/bot/menu/invoicePagination';

const menuComposer = new Composer<Context>();

menuComposer.use(invoiceMenu);

export default menuComposer;
