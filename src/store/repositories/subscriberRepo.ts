import { db } from '@/store/db';
import { eq } from 'drizzle-orm';
import { subscriber } from '@/store/schema';

export const getSubscriberById = async (id: number) => {
	return db.query.subscriber.findFirst({ where: eq(subscriber.id, id) });
};

export const getSubscriberByUserId = async (id: number) => {
	return db.query.subscriber.findFirst({ where: eq(subscriber.userId, id) });
};
