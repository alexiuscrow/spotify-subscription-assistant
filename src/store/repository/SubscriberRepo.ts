import { db } from '@/store/db';
import { eq } from 'drizzle-orm';
import { subscriber } from '@/store/schema';

export interface GetSubscriberOptions {
	with?: {
		user?: boolean;
	};
}

class SubscriberRepo {
	static async getSubscriberById(id: number, options?: GetSubscriberOptions) {
		return db.query.subscriber.findFirst({
			where: eq(subscriber.id, id),
			with: { user: options?.with?.user || undefined }
		});
	}

	static async getSubscriberByUserId(id: number) {
		return db.query.subscriber.findFirst({ where: eq(subscriber.userId, id) });
	}
}

export default SubscriberRepo;
