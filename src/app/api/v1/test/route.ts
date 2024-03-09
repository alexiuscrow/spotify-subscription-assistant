import { NextRequest, NextResponse } from 'next/server';
import { and, eq, exists, notExists, or, sql } from 'drizzle-orm';
import { allowedUserCriteria, user } from '@/store/schema';
import { db } from '@/store/db';
import { PgDialect } from 'drizzle-orm/pg-core';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	const id = 398922537;
	const firstName = 'Oleksii';
	const pgDialect = new PgDialect();
	const _sql = sql<boolean>`select ${or(
		exists(
			db.select({ id: allowedUserCriteria.id }).from(allowedUserCriteria).where(eq(allowedUserCriteria.telegramId, id))
		),
		and(
			exists(
				db
					.select({ id: allowedUserCriteria.id })
					.from(allowedUserCriteria)
					.where(eq(allowedUserCriteria.firstName, firstName))
			),
			notExists(db.select({ id: user.id }).from(user).where(eq(user.firstName, firstName)))
		)
	)} as result`;

	const __sql = sql<boolean>`select case when ${exists(
		db.select({ id: allowedUserCriteria.id }).from(allowedUserCriteria).where(eq(allowedUserCriteria.telegramId, id))
	)} then true when ${and(
		exists(
			db
				.select({ id: allowedUserCriteria.id })
				.from(allowedUserCriteria)
				.where(eq(allowedUserCriteria.firstName, firstName))
		),
		notExists(db.select({ id: user.id }).from(user).where(eq(user.firstName, firstName)))
	)} then true else false end as result`;
	console.log(pgDialect.sqlToQuery(__sql).sql);
	return NextResponse.json({});
}
