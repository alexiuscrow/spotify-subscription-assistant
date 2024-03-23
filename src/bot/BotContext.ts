import { Context, SessionFlavor } from 'grammy';
import { PgColumn } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';
import { SearchPageDirection } from '@/@types/db';

interface InvoiceContext {
	pagination: {
		limit: number;
		page: number;
		orderByColumns: Array<PgColumn | SQL | SQL.Aliased>;
		pageDirection: SearchPageDirection;
	};
}

export interface SessionData {
	invoice: InvoiceContext;
	user?: UserSession;
}

type BotContext = Context & SessionFlavor<SessionData>;

export default BotContext;
