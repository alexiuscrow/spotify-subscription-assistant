import SubscriberHistoryRepo from '@/store/repository/SubscriberHistoryRepo';

class SubscriberHistoryManager {
	static async getSubscriberHistory() {
		return SubscriberHistoryRepo.getSubscriberHistory();
	}
}

export default SubscriberHistoryManager;
