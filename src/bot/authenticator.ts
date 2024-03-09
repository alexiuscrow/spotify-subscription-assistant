import { Middleware } from 'grammy';
import * as userRepo from '@/store/repositories/userRepo';

const authenticator: Middleware = async (ctx, next) => {
	if (!ctx.from) {
		await ctx.reply('Вибачте, але я не можу знайти ваш профіль.');
		return;
	}

	const currentTelegramUser = ctx.from;
	const storedUser = await userRepo.getUserById(currentTelegramUser.id);

	if (!storedUser) {
		const isUserAllowed = await userRepo.checkIfTelegramUserAllowed(currentTelegramUser);
		if (!isUserAllowed) {
			await ctx.reply('Уявлення не маю хто ти. Якщо ти вважаєш, що це помилка, звернись до адміна.');
			return;
		} else {
			await userRepo.createUser(currentTelegramUser);

			await ctx.reply('Ти пройщов автентифікацію. Ласкаво просимо!');
		}
	} else if (storedUser.status === 'canceled') {
		await userRepo.updateUser(storedUser.id, { status: 'active' });
		await ctx.reply('Ви відновили свій статус. З поверненням!');
	}

	await next();
};

export default authenticator;
