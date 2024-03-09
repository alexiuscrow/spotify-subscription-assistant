import { Middleware } from 'grammy';
import { db } from '@/store/db';
import { allowedUserCriteria, user } from '@/store/schema';
import { and, eq, exists, notExists, sql } from 'drizzle-orm';

const authenticator: Middleware = async (ctx, next) => {
	if (!ctx.from) {
		await ctx.reply('Вибачте, але я не можу знайти ваш профіль.');
		return;
	}

	const currentTelegramUser = ctx.from;
	const storedUser = await db.query.user.findFirst({ where: eq(user.telegramId, currentTelegramUser.id) });

	if (!storedUser) {
		const firstName = currentTelegramUser.first_name;
		const meetsCriteria = await sql<boolean>`select ${and(
			exists(
				db
					.select({ id: allowedUserCriteria.id })
					.from(allowedUserCriteria)
					.where(eq(allowedUserCriteria.firstName, firstName))
			),
			notExists(db.select({ id: user.id }).from(user).where(eq(user.firstName, firstName)))
		)}`;

		await ctx.reply(meetsCriteria.toString());
	}

	await next();
};

export default authenticator;
