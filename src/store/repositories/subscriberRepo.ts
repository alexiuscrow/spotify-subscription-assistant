import { db } from '@/store/db';
import { eq } from 'drizzle-orm';
import { subscriber } from '@/store/schema';

export const getSubscriberById = async (id: number) => {
	return db.query.user.findFirst({ where: eq(subscriber.id, id) });
};
