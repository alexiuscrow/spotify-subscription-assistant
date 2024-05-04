import { Middleware } from 'grammy';
import BotContext, { Subscriber, UserSession } from '@/bot/BotContext';
import SubscriberManager from '@/manager/SubscriberManager';
import UserManagerCached from '@/manager/cached/UserManagerCached';
import SubscriptionManagerCached from '@/manager/cached/SubscriptionManagerCached';

const authenticatorMiddleware: Middleware<BotContext> = async (ctx, next) => {
	if (ctx.session.user) {
		return next();
	}

	if (!ctx.from || !ctx.msg) {
		return;
	}

	const currentTelegramUser = ctx.from;
	const storedUser = await UserManagerCached.getUserByTelegramId(currentTelegramUser.id);

	if (!storedUser) {
		const allowedUserCriteriaId = await UserManagerCached.getAllowedUserCriteriaId(currentTelegramUser);
		if (allowedUserCriteriaId === null) {
			await ctx.reply('Уявлення не маю хто ти. Якщо ти вважаєш, що це помилка, звернись до адміна.');
			return;
		} else {
			try {
				const subscription = await SubscriptionManagerCached.getSubscription();
				const { user, subscriber } = await UserManagerCached.createUserAndSubscriberIfNeeded(
					currentTelegramUser,
					subscription.id,
					allowedUserCriteriaId
				);
				ctx.session.user = user as UserSession;
				ctx.session.user.subscriber = subscriber as Subscriber;
			} catch (e) {
				await ctx.reply('Щось пішло не так. Звернись до адміна');
				if (typeof e === 'string') return ctx.reply('Помилка: ' + e);
				else if (e instanceof Error) return ctx.reply('Помилка: ' + e.toString());
			}

			await ctx.reply('Автентифікацію пройдено. Ласкаво просимо!');
		}
	} else {
		if (storedUser.status === 'canceled') {
			await UserManagerCached.updateUser(storedUser.id, { status: 'active' });
			await ctx.reply('Ви відновили свій статус. З поверненням!');
		}

		storedUser.status = 'active';
		ctx.session.user = storedUser as UserSession;

		if (storedUser.role !== 'admin') {
			const subscriber = await SubscriberManager.getSubscriberByUserId(storedUser.id);
			if (!subscriber) {
				await ctx.reply('Щось пішло не так. Звернись до адміна.');
				return;
			}

			ctx.session.user.subscriber = subscriber as Subscriber;
		}
	}

	await next();
};

export default authenticatorMiddleware;
