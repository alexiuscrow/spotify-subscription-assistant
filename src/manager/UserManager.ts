import UserRepo from '@/store/repository/UserRepo';
import AllowedUserCriteriaRepo from '@/store/repository/AllowedUserCriteriaRepo';
import { User as TelegramUser } from '@grammyjs/types';
import { PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { user as userSchema } from '@/store/schema/user';

class UserManager {
	static async getUserByTelegramId(id: number) {
		return UserRepo.getUserByTelegramId(id);
	}

	static async getAllowedUserCriteriaId(telegramUser: TelegramUser) {
		return AllowedUserCriteriaRepo.getAllowedUserCriteriaId(telegramUser);
	}

	static async getActiveAdminUsers() {
		return UserRepo.getActiveAdminUsers();
	}

	static async createUserAndSubscriberIfNeeded(
		telegramUser: TelegramUser,
		subscriptionId: number,
		allowedUserCriteriaId: number
	) {
		return UserRepo.createUserAndSubscriberIfNeeded(telegramUser, subscriptionId, allowedUserCriteriaId);
	}

	static async updateUser(id: number, values: PgUpdateSetSource<typeof userSchema>) {
		return UserRepo.updateUser(id, values);
	}
}

export default UserManager;
