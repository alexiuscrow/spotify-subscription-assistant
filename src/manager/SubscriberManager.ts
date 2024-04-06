import SubscriberRepo, { GetSubscriberOptions } from '@/store/repository/SubscriberRepo';
import SpreadsheetManager from '@/manager/SpreadsheetManager';
import DebtManager from '@/manager/DebtManager';

class SubscriberManager {
	static async getSubscriberById(id: number, options?: GetSubscriberOptions) {
		return SubscriberRepo.getSubscriberById(id, options);
	}

	static async getSubscriberByUserId(id: number) {
		return SubscriberRepo.getSubscriberByUserId(id);
	}

	static async getNumberOfPayedMonthsInfo(subscriberId: number, paymentAmount: number) {
		const subscriber = await SubscriberManager.getSubscriberById(subscriberId);

		if (!subscriber) {
			throw new Error(`Subscriber with id ${subscriberId} not found`);
		}

		const latestPayedDate = await SpreadsheetManager.getLatestPayedDate(subscriber.spreadsheetSubscriberIndex);

		return await DebtManager.getPayedMonthNumber({ latestPayedDate, paymentAmount });
	}
}

export default SubscriberManager;