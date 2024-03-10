import { Context, SessionFlavor } from 'grammy';
import { PgColumn } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';
import { SearchInvoicesPageDirection } from '@/store/repositories/invoiceRepo';

interface InvoiceContext {
	pagination: {
		limit: number;
		page: number;
		orderByColumns: Array<PgColumn | SQL | SQL.Aliased>;
		pageDirection: SearchInvoicesPageDirection;
	};
}

export interface SessionData {
	invoice: InvoiceContext;
}

type BotContext = Context & SessionFlavor<SessionData>;

export default BotContext;
