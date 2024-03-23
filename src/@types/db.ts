import { PgColumn } from 'drizzle-orm/pg-core';
import { ColumnsSelection, SQL } from 'drizzle-orm';

export enum SearchPageDirection {
	STRAIGHT,
	REVERSE
}

export interface SearchCriteria {
	limit?: number;
	page?: number;
	orderByColumns?: Array<PgColumn | SQL | SQL.Aliased>;
	pageDirection?: SearchPageDirection;
	selection?: ((aliases: ColumnsSelection) => SQL | undefined) | SQL | undefined;
}
