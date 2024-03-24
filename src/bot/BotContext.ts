import { Context, SessionFlavor } from 'grammy';
import { PgColumn } from 'drizzle-orm/pg-core';
import { ColumnsSelection, SQL } from 'drizzle-orm';
import { SearchPageDirection } from '@/@types/db';
import { DateTime } from 'luxon';

export interface Subscriber {
	id: number;
	userId: number;
	subscriptionId: number;
	spreadsheetSubscriberIndex: number;
}

export interface UserSession {
	id: number;
	telegramId: number;
	username: string | null;
	firstName: string;
	lastName: string | null;
	role: 'regular' | 'admin';
	status: 'active' | 'canceled';
	createdAt: Date;
	subscriber?: Subscriber | null;
}

interface Pagination {
	limit: number;
	page: number;
	orderByColumns: Array<PgColumn | SQL | SQL.Aliased>;
	pageDirection: SearchPageDirection;
}

export interface SessionData {
	user?: UserSession;
	invoice: {
		pagination: Pagination;
	};
	debt: {
		latestPayedDate?: DateTime | null | void;
		pagination: Pagination & {
			selection?: ((aliases: ColumnsSelection) => SQL | undefined) | SQL | undefined;
		};
	};
}

type BotContext = Context & SessionFlavor<SessionData>;

export default BotContext;
