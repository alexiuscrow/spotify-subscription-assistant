import { integer, serial } from 'drizzle-orm/pg-core';
import { allowedUserCriteria } from '@/store/schema/allowedUserCriteria';
import { mySchema } from '@/store/utils';

// noinspection TypeScriptValidateTypes
export const allowedUserSubscriptionProps = mySchema.table('allowed_user_subscription_props', {
	id: serial('id').primaryKey(),
	allowedUserCriteriaId: integer('allowed_user_criteria_id')
		.notNull()
		.references(() => allowedUserCriteria.id),
	spreadsheetSubscriberIndex: integer('spreadsheet_subscriber_index').notNull()
});
