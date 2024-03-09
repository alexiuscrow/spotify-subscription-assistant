import { NextRequest, NextResponse } from 'next/server';
import { and, eq, exists, notExists, sql } from 'drizzle-orm';
import { allowedUserCriteria, user } from '@/store/schema';
import { db } from '@/store/db';
import { PgDialect } from 'drizzle-orm/pg-core';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	const firstName = (await request.json()).firstName || '';
	const pgDialect = new PgDialect();
	const data = pgDialect.sqlToQuery(
		sql<boolean>`select ${and(
			exists(
				db
					.select({ id: allowedUserCriteria.id })
					.from(allowedUserCriteria)
					.where(eq(allowedUserCriteria.firstName, firstName))
			),
			notExists(db.select({ id: user.id }).from(user).where(eq(user.firstName, firstName)))
		)}`
	).sql;
	return NextResponse.json({ data });
}
