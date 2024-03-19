import { db } from '@/store/db';
import { and, eq, exists, notExists, sql } from 'drizzle-orm';
import {
	allowedUserCriteria,
	allowedUserSubscriptionProps,
	subscriber as subscriberSchema,
	user as userSchema,
	user
} from '@/store/schema';
import { User } from '@grammyjs/types';
import { PgUpdateSetSource } from 'drizzle-orm/pg-core';

export const getUserById = async (id: number) => {
	return db.query.user.findFirst({ where: eq(user.telegramId, id) });
};

export const getAllowedUserCriteriaId = async (user: User) => {
	const { rows } = await db.execute(
		sql<number | null>`select case when ${exists(
			db
				.select({ id: allowedUserCriteria.id })
				.from(allowedUserCriteria)
				.where(eq(allowedUserCriteria.telegramId, user.id))
		)} then ${db
			.select({ id: allowedUserCriteria.id })
			.from(allowedUserCriteria)
			.where(eq(allowedUserCriteria.telegramId, user.id))} when ${and(
			exists(
				db
					.select({ id: allowedUserCriteria.id })
					.from(allowedUserCriteria)
					.where(eq(allowedUserCriteria.firstName, user.first_name))
			),
			notExists(db.select({ id: userSchema.id }).from(userSchema).where(eq(userSchema.firstName, user.first_name)))
		)} then ${db
			.select({ id: allowedUserCriteria.id })
			.from(allowedUserCriteria)
			.where(eq(allowedUserCriteria.firstName, user.first_name))} end as result`
	);
	return rows[0].result as number | null;
};

export const createUser = async (telegramUser: User) => {
	const isAdmin = telegramUser.id === Number(process.env.ADMIN_TELEGRAM_USER_ID);
	type NewUser = typeof userSchema.$inferInsert;
	type InferUser = typeof userSchema.$inferSelect;
	return db
		.insert(userSchema)
		.values({
			telegramId: telegramUser.id,
			firstName: telegramUser.first_name,
			lastName: telegramUser.last_name,
			username: telegramUser.username,
			role: isAdmin ? 'admin' : 'regular'
		} as NewUser)
		.returning() as unknown as InferUser;
};

export const createUserAndSubscribersIfNeeded = async (
	telegramUser: User,
	subscriptionId: number,
	allowedUserCriteriaId: number
) => {
	const isAdmin = telegramUser.id === Number(process.env.ADMIN_TELEGRAM_USER_ID);
	type NewUser = typeof userSchema.$inferInsert;
	type InferUser = typeof userSchema.$inferSelect;
	type Subscriber = typeof subscriberSchema.$inferSelect;

	return db.transaction(async trx => {
		const user = (await trx
			.insert(userSchema)
			.values({
				telegramId: telegramUser.id,
				firstName: telegramUser.first_name,
				lastName: telegramUser.last_name,
				username: telegramUser.username,
				role: isAdmin ? 'admin' : 'regular'
			} as NewUser)
			.returning()) as unknown as InferUser;

		let subscriber: Subscriber | null = null;

		if (!isAdmin) {
			const subscriberProps = await trx.query.allowedUserSubscriptionProps.findFirst({
				where: eq(allowedUserSubscriptionProps.allowedUserCriteriaId, allowedUserCriteriaId)
			});

			if (!subscriberProps?.spreadsheetSubscriberIndex) throw new Error('Spreadsheet subscriber index not found');

			type NewSubscriber = typeof subscriberSchema.$inferInsert;
			subscriber = (await trx
				.insert(subscriberSchema)
				.values({
					userId: user.id,
					subscriptionId: subscriptionId,
					spreadsheetSubscriberIndex: subscriberProps.spreadsheetSubscriberIndex
				} as NewSubscriber)
				.returning()) as unknown as Subscriber;
		}

		return { user, subscriber };
	});
};

export const updateUser = async (id: number, values: PgUpdateSetSource<typeof userSchema>) => {
	return db.update(userSchema).set(values).where(eq(user.id, id));
};
