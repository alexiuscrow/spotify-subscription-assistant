import SubscriberRepo, { GetSubscriberOptions } from '@/store/repository/SubscriberRepo';
import SpreadsheetManager from '@/manager/SpreadsheetManager';
import DebtManager from '@/manager/DebtManager';
import { SearchCriteria } from '@/@types/db';

class SubscriberManager {
	static async getSubscriberById(id: number, options?: GetSubscriberOptions) {
		return SubscriberRepo.getSubscriberById(id, options);
	}

	static async getSubscriberByUserId(id: number) {
		return SubscriberRepo.getSubscriberByUserId(id);
	}

	static async getSubscribers(criteria?: SearchCriteria & GetSubscriberOptions) {
		return SubscriberRepo.getSubscribers(criteria);
	}

	static async getAllSubscribers(
		criteria?: Pick<SearchCriteria, 'orderByColumns' | 'pageDirection' | 'selection'> & GetSubscriberOptions
	) {
		return SubscriberRepo.getAllSubscribers(criteria);
	}

	static async getNumberOfPaidMonthsInfo(subscriberId: number, paymentAmount: number) {
		const subscriber = await SubscriberManager.getSubscriberById(subscriberId);

		if (!subscriber) {
			throw new Error(`Subscriber with id ${subscriberId} not found`);
		}

		const latestPaidDate = await SpreadsheetManager.getLatestPaidDate(subscriber.spreadsheetSubscriberIndex);

		return await DebtManager.getPaidMonthNumber({ latestPaidDate, paymentAmount });
	}
}

export default SubscriberManager;
