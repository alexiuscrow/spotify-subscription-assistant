import { db } from '@/store/db';
import { and, eq } from 'drizzle-orm';
import { allowedUserSubscriptionProps, subscriber as subscriberSchema, user as userSchema, user } from '@/store/schema';
import { User as TelegramUser } from '@grammyjs/types';
import { PgUpdateSetSource } from 'drizzle-orm/pg-core';

export type User = typeof userSchema.$inferSelect;

class UserRepo {
	static async getUserByTelegramId(id: number): Promise<User | undefined> {
		return db.query.user.findFirst({ where: eq(user.telegramId, id) });
	}

	static async getActiveAdminUsers(): Promise<User[]> {
		return db.query.user.findMany({ where: and(eq(user.role, 'admin'), eq(user.status, 'active')) });
	}

	static async createUserAndSubscriberIfNeeded(
		telegramUser: TelegramUser,
		subscriptionId: number,
		allowedUserCriteriaId: number
	) {
		const isAdmin = telegramUser.id === Number(process.env.ADMIN_TELEGRAM_USER_ID);
		type NewUser = typeof userSchema.$inferInsert;
		type Subscriber = typeof subscriberSchema.$inferSelect;

		return db.transaction(async trx => {
			const user = (
				await trx
					.insert(userSchema)
					.values({
						telegramId: telegramUser.id,
						firstName: telegramUser.first_name,
						lastName: telegramUser.last_name,
						username: telegramUser.username,
						role: isAdmin ? 'admin' : 'regular'
					} as NewUser)
					.returning()
			)[0];

			let subscriber: Subscriber | null = null;

			if (!isAdmin) {
				const subscriberProps = await trx.query.allowedUserSubscriptionProps.findFirst({
					where: eq(allowedUserSubscriptionProps.allowedUserCriteriaId, allowedUserCriteriaId)
				});

				if (isNaN(<number>subscriberProps?.spreadsheetSubscriberIndex))
					throw new Error('Spreadsheet subscriber index not found');

				type NewSubscriber = typeof subscriberSchema.$inferInsert;
				subscriber = (
					await trx
						.insert(subscriberSchema)
						.values({
							userId: user.id,
							subscriptionId: subscriptionId,
							spreadsheetSubscriberIndex: subscriberProps?.spreadsheetSubscriberIndex
						} as NewSubscriber)
						.returning()
				)[0];
			}

			return { user: user as User, subscriber };
		});
	}

	static async updateUser(id: number, values: PgUpdateSetSource<typeof userSchema>) {
		return db.update(userSchema).set(values).where(eq(user.id, id)).returning();
	}
}

export default UserRepo;
