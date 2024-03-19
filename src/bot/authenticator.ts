import { Middleware } from 'grammy';
import * as userRepo from '@/store/repositories/userRepo';
import * as subscriptionRepo from '@/store/repositories/subscriptionRepo';
import BotContext from '@/bot/BotContext';

const authenticator: Middleware<BotContext> = async (ctx, next) => {
	if (!ctx.from) {
		await ctx.reply('Вибачте, але я не можу знайти ваш профіль.');
		return;
	}

	const currentTelegramUser = ctx.from;
	const storedUser = await userRepo.getUserById(currentTelegramUser.id);

	if (!storedUser) {
		const allowedUserCriteriaId = await userRepo.getAllowedUserCriteriaId(currentTelegramUser);
		if (allowedUserCriteriaId === null) {
			await ctx.reply('Уявлення не маю хто ти. Якщо ти вважаєш, що це помилка, звернись до адміна.');
			return;
		} else {
			try {
				const subscription = await subscriptionRepo.getSubscription();
				await userRepo.createUserAndSubscribersIfNeeded(currentTelegramUser, subscription.id, allowedUserCriteriaId);
			} catch (e) {
				await ctx.reply('Щось пішло не так. Звернись до адміна');
				return ctx.reply('Помилка: ' + e.message);
			}

			await ctx.reply('Ти пройщов автентифікацію. Ласкаво просимо!');
		}
	} else if (storedUser.status === 'canceled') {
		await userRepo.updateUser(storedUser.id, { status: 'active' });
		await ctx.reply('Ви відновили свій статус. З поверненням!');
	}

	await next();
};

export default authenticator;
