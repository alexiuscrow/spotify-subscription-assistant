import { bigint, serial, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { allowedUserSubscriptionProps } from '@/store/schema/allowedUserSubscriptionProps';
import { mySchema } from '@/store/utils';

// noinspection TypeScriptValidateTypes
export const allowedUserCriteria = mySchema.table('allowed_user_criteria', {
	id: serial('id').primaryKey(),
	telegramId: bigint('telegram_id', { mode: 'number' }),
	firstName: text('first_name')
});

export const allowedUserCriteriaRelations = relations(allowedUserCriteria, ({ one }) => ({
	allowedUserSubscriptionProps: one(allowedUserSubscriptionProps, {
		fields: [allowedUserCriteria.id],
		references: [allowedUserSubscriptionProps.allowedUserCriteriaId]
	})
}));
