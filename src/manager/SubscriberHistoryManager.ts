import SubscriberHistoryRepo from '@/store/repository/SubscriberHistoryRepo';

class SubscriberHistoryManager {
	// TODO: Add cache
	static async getSubscriberHistory() {
		return SubscriberHistoryRepo.getSubscriberHistory();
	}
}

export default SubscriberHistoryManager;
