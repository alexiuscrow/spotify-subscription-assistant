import { PgColumn, pgSchema, PgSelect, unique as drizzleUnique } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';

const projectPrefix = 'ssa';
export const isProductionFn = () => process.env.VERCEL_ENV === 'production';
const env = isProductionFn() ? 'prod' : 'dev';

export const mySchema = pgSchema(`${projectPrefix}_${env}`);
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
