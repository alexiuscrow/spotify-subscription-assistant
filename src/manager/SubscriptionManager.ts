import SubscriptionRepo, { GetSubscriptionOptions } from '@/store/repository/SubscriptionRepo';

class SubscriptionManager {
	// TODO: Implement cached
	static async getSubscription(options?: GetSubscriptionOptions) {
		return SubscriptionRepo.getSubscription(options);
	}
}

export default SubscriptionManager;
