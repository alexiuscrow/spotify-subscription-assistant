import { db } from '@/store/db';
import { and, eq, exists, notExists, sql } from 'drizzle-orm';
import { allowedUserCriteria, user as userSchema } from '@/store/schema';
import { User as TelegramUser } from '@grammyjs/types';

class AllowedUserCriteriaRepo {
	static async getAllowedUserCriteriaId(telegramUser: TelegramUser) {
		const { rows } = await db.execute(
			sql<number | null>`select case when ${exists(
				db
					.select({ id: allowedUserCriteria.id })
					.from(allowedUserCriteria)
					.where(eq(allowedUserCriteria.telegramId, telegramUser.id))
			)} then ${db
				.select({ id: allowedUserCriteria.id })
				.from(allowedUserCriteria)
				.where(eq(allowedUserCriteria.telegramId, telegramUser.id))} when ${and(
				exists(
					db
						.select({ id: allowedUserCriteria.id })
						.from(allowedUserCriteria)
						.where(eq(allowedUserCriteria.firstName, telegramUser.first_name))
				),
				notExists(
					db.select({ id: userSchema.id }).from(userSchema).where(eq(userSchema.firstName, telegramUser.first_name))
				)
			)} then ${db
				.select({ id: allowedUserCriteria.id })
				.from(allowedUserCriteria)
				.where(eq(allowedUserCriteria.firstName, telegramUser.first_name))} end as result`
		);
		return rows[0].result as number | null;
	}
}

export default AllowedUserCriteriaRepo;
