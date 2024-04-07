import { db } from '@/store/db';
import { count, eq } from 'drizzle-orm';
import { subscriber, user } from '@/store/schema';
import { SearchCriteria, SearchPageDirection } from '@/@types/db';
import { withPagination } from '@/store/utils';
import { User } from '@/store/repository/UserRepo';

export interface GetSubscriberOptions {
	with?: {
		user?: boolean;
	};
}

export type Subscriber = typeof subscriber.$inferSelect & { user?: User };

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

	static async getSubscribers(criteria?: SearchCriteria & GetSubscriberOptions) {
		const {
			limit = 5,
			page = 1,
			orderByColumns = [subscriber.spreadsheetSubscriberIndex],
			pageDirection = SearchPageDirection.STRAIGHT,
			selection
		} = criteria || {};

		return db.transaction(async trx => {
			const query = criteria?.with?.user
				? trx.select().from(subscriber).where(selection).leftJoin(user, eq(subscriber.userId, user.id))
				: trx.select().from(subscriber).where(selection);
			const queryResult = await withPagination(query.$dynamic(), limit, page, orderByColumns);
			const items = criteria?.with?.user
				? (queryResult as { subscriber: Subscriber; user: User }[]).map(
						({ subscriber, user }): Subscriber => ({
							...subscriber,
							user
						})
					)
				: (queryResult as Subscriber[]);
			const firstIndex = 0;
			const total = (await trx.select({ total: count() }).from(subscriber).where(selection))[firstIndex].total;
			const totalPages = Math.ceil(total / limit);

			const straightDirection = {
				hasNext: totalPages > page,
				hasPrev: page > 1
			};

			const hasNext =
				pageDirection === SearchPageDirection.STRAIGHT ? straightDirection.hasNext : straightDirection.hasPrev;
			const hasPrev =
				pageDirection === SearchPageDirection.STRAIGHT ? straightDirection.hasPrev : straightDirection.hasNext;

			return {
				items: items as Subscriber[],
				pagination: {
					total,
					totalPages,
					page,
					hasNext,
					hasPrev
				}
			};
		});
	}

	static async getAllSubscribers(
		criteria?: Pick<SearchCriteria, 'orderByColumns' | 'pageDirection' | 'selection'> & GetSubscriberOptions
	) {
		const {
			selection,
			orderByColumns,
			pageDirection = SearchPageDirection.STRAIGHT,
			with: withOptions
		} = criteria || {};

		const limit = 1_000;
		let hasMore = true;
		let page = 1;
		const subscribers: Subscriber[] = [];

		while (hasMore) {
			const { items, pagination } = await SubscriberRepo.getSubscribers({
				limit,
				page,
				orderByColumns,
				pageDirection,
				selection,
				with: withOptions
			});
			subscribers.push(...items);
			hasMore = pageDirection === SearchPageDirection.STRAIGHT ? pagination.hasNext : pagination.hasPrev;
			page++;
		}

		return subscribers;
	}
}

export default SubscriberRepo;
