import { eq } from 'drizzle-orm';
import { db } from '@/store/db';
import { subscription } from '@/store/schema';

export const getSubscription = async () => {
	return db.query.subscription.findFirst({
		where: eq(subscription.name, process.env.SUBSCRIPTION_NAME as string)
	});
};
