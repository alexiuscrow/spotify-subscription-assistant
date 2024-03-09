import { db } from '@/store/db';
import { and, eq, exists, notExists, sql } from 'drizzle-orm';
import { allowedUserCriteria, user } from '@/store/schema';
import { User } from '@grammyjs/types';
import { user as userSchema } from '@/store/schema';
import { PgUpdateSetSource } from 'drizzle-orm/pg-core';

export const getUserById = async (id: number) => {
	return db.query.user.findFirst({ where: eq(user.telegramId, id) });
};

export const checkIfTelegramUserAllowed = async (user: User) => {
	const { rows } = await db.execute(
		sql<boolean>`select case when ${exists(
			db
				.select({ id: allowedUserCriteria.id })
				.from(allowedUserCriteria)
				.where(eq(allowedUserCriteria.telegramId, user.id))
		)} then true when ${and(
			exists(
				db
					.select({ id: allowedUserCriteria.id })
					.from(allowedUserCriteria)
					.where(eq(allowedUserCriteria.firstName, user.first_name))
			),
			notExists(db.select({ id: userSchema.id }).from(userSchema).where(eq(userSchema.firstName, user.first_name)))
		)} then true else false end as result`
	);
	return rows[0].result as boolean;
};

export const createUser = async (user: User) => {
	const isAdmin = user.id === Number(process.env.ADMIN_TELEGRAM_USER_ID);
	type NewUser = typeof userSchema.$inferInsert;
	return db.insert(userSchema).values({
		telegramId: user.id,
		firstName: user.first_name,
		lastName: user.last_name,
		username: user.username,
		role: isAdmin ? 'admin' : 'regular'
	} as NewUser);
};

export const updateUser = async (id: number, values: PgUpdateSetSource<typeof userSchema>) => {
	return db.update(userSchema).set(values).where(eq(user.id, id));
};
