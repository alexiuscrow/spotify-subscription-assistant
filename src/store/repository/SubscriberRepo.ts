import { db } from '@/store/db';
import { eq } from 'drizzle-orm';
import { subscriber } from '@/store/schema';

class SubscriberRepo {
	static async getSubscriberByUserId(id: number) {
		return db.query.subscriber.findFirst({ where: eq(subscriber.userId, id) });
	}
}

export default SubscriberRepo;
