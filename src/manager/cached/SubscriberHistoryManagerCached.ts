import SubscriberHistoryManager from '@/manager/SubscriberHistoryManager';
import NodeCache from 'node-cache';
import { SubscriberHistory } from '@/store/repository/SubscriberHistoryRepo';
import { subscriberHistory } from '@/store/schema';

class SubscriberHistoryManagerCached extends SubscriberHistoryManager {
	static cache = new NodeCache({ stdTTL: 60 * 30 });

	static async getSubscriberHistory() {
		const cacheKey = 'subscriberHistory';
		const cachedSubscriberHistory = SubscriberHistoryManagerCached.cache.get<SubscriberHistory[]>(cacheKey);
		if (cachedSubscriberHistory) {
			return cachedSubscriberHistory;
		}
		const subscriberHistory = await SubscriberHistoryManager.getSubscriberHistory();
		SubscriberHistoryManagerCached.cache.set(cacheKey, subscriberHistory);
		return subscriberHistory;
	}
}

export default SubscriberHistoryManagerCached;
