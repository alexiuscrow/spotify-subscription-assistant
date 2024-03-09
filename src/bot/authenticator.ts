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
		const { rows } = await db.execute(
			sql<boolean>`select ${and(
				exists(
					db
						.select({ id: allowedUserCriteria.id })
						.from(allowedUserCriteria)
						.where(eq(allowedUserCriteria.firstName, firstName))
				),
				notExists(db.select({ id: user.id }).from(user).where(eq(user.firstName, firstName)))
			)} as result`
		);
		const meetsCriteria = rows[0].result as boolean;

		if (!meetsCriteria) {
			await ctx.reply('Уявлення не маю хто ти. Якщо ти вважаєш, що це помилка, звернись до адміна.');
			return;
		} else {
			const isAdmin = currentTelegramUser.id === Number(process.env.ADMIN_TELEGRAM_USER_ID);
			type NewUser = typeof user.$inferInsert;
			await db.insert(user).values({
				telegramId: currentTelegramUser.id,
				firstName: currentTelegramUser.first_name,
				lastName: currentTelegramUser.last_name,
				username: currentTelegramUser.username,
				role: isAdmin ? 'admin' : 'regular'
			} as NewUser);

			await ctx.reply('Ти пройщов автентифікацію. Ласкаво просимо!');
		}
	} else if (storedUser.status === 'canceled') {
		await db.update(user).set({ status: 'active' }).where(eq(user.id, storedUser.id));
		await ctx.reply('Ви відновили свій статус. З поверненням!');
	}

	await next();
};

export default authenticator;
