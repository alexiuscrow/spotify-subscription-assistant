import { Context } from 'grammy';

interface InvoiceContext {
	pagination?: {
		limit: number;
		page: number;
		hasNext: boolean;
		hasPrev: boolean;
		total: number;
	};
}

type BotContext = Context & {
	invoice?: InvoiceContext;
};

export default BotContext;
