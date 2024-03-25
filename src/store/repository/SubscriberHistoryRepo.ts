import { desc, eq } from 'drizzle-orm';
import { db } from '@/store/db';
import { subscriberHistory } from '@/store/schema';
import SubscriptionRepo from './SubscriptionRepo';

class SubscriberHistoryRepo {
	static async getSubscriberHistory() {
		const subscription = await SubscriptionRepo.getSubscription();
		type SubscriberHistory = typeof subscriberHistory.$inferSelect;
		return (await db.query.subscriberHistory.findMany({
			limit: 1_000,
			offset: 0,
			orderBy: [desc(subscriberHistory.date)],
			where: eq(subscriberHistory.subscriptionId, subscription.id)
		})) as SubscriberHistory[];
	}
}

export default SubscriberHistoryRepo;
