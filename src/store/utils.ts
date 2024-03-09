import { PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';

export const withPagination = <T extends PgSelect>(
	qb: T,
	limit = 5,
	page = 1,
	orderByColumns: Array<PgColumn | SQL | SQL.Aliased>
) =>
	qb
		.orderBy(...orderByColumns)
		.limit(limit)
		.offset((page - 1) * limit);
