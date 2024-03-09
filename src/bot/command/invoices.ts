import { Middleware } from 'grammy';
import * as invoiceRepo from '@/store/repositories/invoiceRepo';
import { inspect } from 'node:util';

const invoicesCommand: Middleware = async ctx => {
	const invoices = await invoiceRepo.getInvoices();
	console.log(invoices);
	await ctx.reply(inspect(invoices));
};

export default invoicesCommand;
