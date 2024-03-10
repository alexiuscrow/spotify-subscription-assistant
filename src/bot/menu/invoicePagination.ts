import { Menu } from '@grammyjs/menu';

const invoiceMenu = new Menu('invoice-pagination')
	.text('Попередні', ctx => ctx.reply('Left!'))
	.text('Наступні', ctx => ctx.reply('Right!'));

export default invoiceMenu;
