import { Context, SessionFlavor } from 'grammy';
import { PgColumn } from 'drizzle-orm/pg-core';
import { ColumnsSelection, desc, SQL } from 'drizzle-orm';
import { SearchPageDirection } from '@/store/interfaces';
import { DateTime } from 'luxon';
import { I18nFlavor } from '@grammyjs/i18n';
import { invoice as invoiceSchema } from '@/store/schema';

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
		latestPaidDate?: DateTime | null | void;
		sum?: number;
		pagination: Pagination & {
			selection?: ((aliases: ColumnsSelection) => SQL | undefined) | SQL | undefined;
		};
	};
}

type BotContext = Context & I18nFlavor & SessionFlavor<SessionData>;

export const initiateSession = (): SessionData => ({
	invoice: {
		pagination: {
			limit: 12,
			page: 1,
			orderByColumns: [desc(invoiceSchema.createdAt)],
			pageDirection: SearchPageDirection.REVERSE
		}
	},
	debt: {
		pagination: {
			limit: 12,
			page: 1,
			orderByColumns: [desc(invoiceSchema.createdAt)],
			pageDirection: SearchPageDirection.REVERSE
		}
	}
});

export default BotContext;
