import { desc, eq } from 'drizzle-orm';
import { db } from '@/store/db';
import { subscriberHistory } from '@/store/schema';
import * as subscriptionRepo from './subscriptionRepo';

export const getSubscriberHistory = async () => {
	const subscription = await subscriptionRepo.getSubscription();
	return db.query.subscriberHistory.findMany({
		limit: 1_000,
		offset: 0,
		orderBy: [desc(subscriberHistory.date)],
		where: eq(subscriberHistory.subscriptionId, subscription.id)
	});
};
