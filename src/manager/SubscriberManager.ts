import SubscriberRepo from '@/store/repository/SubscriberRepo';

class SubscriberManager {
	static async getSubscriberByUserId(id: number) {
		return SubscriberRepo.getSubscriberByUserId(id);
	}
}

export default SubscriberManager;
