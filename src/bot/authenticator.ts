import { Middleware } from 'grammy';
import * as userRepo from '@/store/repositories/userRepo';
import * as subscriptionRepo from '@/store/repositories/subscriptionRepo';
import * as subscriberRepo from '@/store/repositories/subscriberRepo';
import * as allowedUserSubscriptionPropsRepo from '@/store/repositories/allowedUserSubscriptionPropsRepo';
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
			const subscription = await subscriptionRepo.getSubscription();
			if (!subscription) throw 'Subscription not found';

			const newUser = await userRepo.createUser(currentTelegramUser);
			if (!newUser) throw 'Failed to create user';

			const subscriptionProps =
				await allowedUserSubscriptionPropsRepo.getAllowedUserSubscriptionPropsById(allowedUserCriteriaId);
			if (!subscriptionProps?.spreadsheetSubscriberIndex) throw 'Spreadsheet subscriber index not found';

			// noinspection TypeScriptUnresolvedReference
			await subscriberRepo.createSubscriber({
				userId: newUser.id,
				subscriptionId: subscription.id,
				spreadsheetSubscriberIndex: subscriptionProps.spreadsheetSubscriberIndex
			});

			await ctx.reply('Ти пройщов автентифікацію. Ласкаво просимо!');
		}
	} else if (storedUser.status === 'canceled') {
		await userRepo.updateUser(storedUser.id, { status: 'active' });
		await ctx.reply('Ви відновили свій статус. З поверненням!');
	}

	await next();
};

export default authenticator;
