import { db } from '@/store/db';
import { eq } from 'drizzle-orm';
import { allowedUserSubscriptionProps } from '@/store/schema';

export const getAllowedUserSubscriptionPropsById = async (id: number) => {
	return db.query.allowedUserSubscriptionProps.findFirst({ where: eq(allowedUserSubscriptionProps.id, id) });
};
