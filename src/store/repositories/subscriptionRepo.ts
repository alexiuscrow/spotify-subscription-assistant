import { eq } from 'drizzle-orm';
import { db } from '@/store/db';
import { subscription } from '@/store/schema';

export const getSubscription = async () => {
	const result = await db.query.subscription.findFirst({
		where: eq(subscription.name, process.env.SUBSCRIPTION_NAME as string)
	});

	if (!result) throw 'Subscription not found';

	return result;
};
