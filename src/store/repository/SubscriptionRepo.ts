import { eq } from 'drizzle-orm';
import { db } from '@/store/db';
import { subscription } from '@/store/schema';

export interface GetSubscriptionOptions {
	with?: {
		subscriberHistory?: boolean;
		subscribers?: boolean;
		invoices?: boolean;
	};
}

class SubscriptionRepo {
	static async getSubscription(options?: GetSubscriptionOptions) {
		const result = await db.query.subscription.findFirst({
			where: eq(subscription.name, process.env.SUBSCRIPTION_NAME as string),
			with: {
				subscriberHistory: options?.with?.subscriberHistory || undefined,
				subscribers: options?.with?.subscribers || undefined,
				invoices: options?.with?.invoices || undefined
			}
		});

		if (!result) throw new Error('Subscription not found');

		return result;
	}
}

export default SubscriptionRepo;
