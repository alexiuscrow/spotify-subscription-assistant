import UserManager from '@/manager/UserManager';
import NodeCache from 'node-cache';
import { User } from '@/store/repository/UserRepo';
import { User as TelegramUser } from '@grammyjs/types';

class UserManagerCached extends UserManager {
	static cache = new NodeCache({ stdTTL: 60 * 5 });

	static async getUserByTelegramId(id: number) {
		const cacheKey = `user_${id}`;
		let user = UserManagerCached.cache.get<User>(cacheKey);
		if (!user) {
			user = await UserManager.getUserByTelegramId(id);
			UserManagerCached.cache.set(cacheKey, user);
		}
		return user;
	}

	static async getAllowedUserCriteriaId(telegramUser: TelegramUser) {
		const cacheKey = `allowedUserCriteria_${telegramUser.id}`;
		let allowedUserCriteriaId = UserManagerCached.cache.get<number | null>(cacheKey);
		if (!allowedUserCriteriaId) {
			allowedUserCriteriaId = await UserManager.getAllowedUserCriteriaId(telegramUser);
			UserManagerCached.cache.set(cacheKey, allowedUserCriteriaId);
		}
		return allowedUserCriteriaId;
	}

	static async getActiveAdminUsers() {
		const cacheKey = 'activeAdminUsers';
		let activeAdminUsers = UserManagerCached.cache.get<User[]>(cacheKey);
		if (!activeAdminUsers) {
			activeAdminUsers = await UserManager.getActiveAdminUsers();
			UserManagerCached.cache.set(cacheKey, activeAdminUsers);
		}
		return activeAdminUsers;
	}
}

export default UserManagerCached;
