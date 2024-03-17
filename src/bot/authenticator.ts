import { Middleware } from 'grammy';
import * as userRepo from '@/store/repositories/userRepo';
import BotContext from '@/bot/BotContext';
import { inspect } from 'node:util';

const authenticator: Middleware<BotContext> = async (ctx, next) => {
	if (!ctx.from) {
		await ctx.reply('Вибачте, але я не можу знайти ваш профіль.');
		return;
	}

	console.log(inspect(ctx.msg, { depth: 20 }));

	const currentTelegramUser = ctx.from;
	const storedUser = await userRepo.getUserById(currentTelegramUser.id);

	if (!storedUser) {
		const isUserAllowed = await userRepo.checkIfTelegramUserAllowed(currentTelegramUser);
		console.log('isUserAllowed', isUserAllowed);
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
