import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { allowedUserCriteria } from '@/store/schema/allowedUserCriteria';

// noinspection TypeScriptValidateTypes
export const allowedUserSubscriptionProps = pgTable('allowed_user_subscription_props', {
	id: serial('id').primaryKey(),
	allowedUserCriteriaId: integer('allowed_user_criteria_id')
		.notNull()
		.references(() => allowedUserCriteria.id),
	spreadsheetSubscriberIndex: integer('spreadsheet_subscriber_index').notNull()
});
