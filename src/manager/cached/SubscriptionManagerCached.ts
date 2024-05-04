import SubscriptionManager from '@/manager/SubscriptionManager';
import { GetSubscriptionOptions, Subscription } from '@/store/repository/SubscriptionRepo';
import NodeCache from 'node-cache';

class SubscriptionManagerCached extends SubscriptionManager {
	static cache = new NodeCache({ stdTTL: 60 * 30 });

	static async getSubscription(options?: GetSubscriptionOptions) {
		const cacheKey = `subscription_${!!options}_${options?.with?.subscriberHistory}_${options?.with?.subscribers}_${options?.with?.invoices}`;
		const cachedSubscription = SubscriptionManagerCached.cache.get<Subscription>(cacheKey);
		if (cachedSubscription) {
			return cachedSubscription;
		}
		const subscription = await SubscriptionManager.getSubscription(options);

		let ttl = 60 * 60;

		if (options && options.with) {
			if (options.with.subscriberHistory) {
				ttl = 60 * 30;
			} else {
				ttl = 60;
			}
		}

		SubscriptionManagerCached.cache.set(cacheKey, subscription, ttl);
		return subscription;
	}
}

export default SubscriptionManagerCached;
