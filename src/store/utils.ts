import { PgColumn, PgSelect, pgTableCreator, unique as drizzleUnique } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';

const projectPrefix = 'ssa';
const isProduction = process.env.NODE_ENV === 'production';
const env = isProduction ? 'prod' : 'dev';

export const pgTable = pgTableCreator(name => `${projectPrefix}_${env}_${name}`);
export const unique = (name: string) => drizzleUnique(`${projectPrefix}_${env}_${name}`);

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
