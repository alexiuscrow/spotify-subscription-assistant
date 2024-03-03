// import { drizzle } from 'drizzle-orm/vercel-postgres';
// import { sql } from '@vercel/postgres';
// import * as schema from './schema';
// import { subscriber } from './schema';
//
// export const db = drizzle(sql, { schema });
//
// export const getSubscribers = async () => {
// 	const selectResult = await db.select().from(subscriber);
// 	console.log('Select result:', selectResult);
// 	return selectResult;
// };
//
// export const getSubscribers2 = async () => {
// 	return db.query.subscriber.findMany();
// };
//
// export type NewSubscription = typeof subscriber.$inferInsert;
//
// export const insertSubscription = async (subscription: NewSubscription) => {
// 	return db.insert(subscriber).values(subscription).returning();
// };
