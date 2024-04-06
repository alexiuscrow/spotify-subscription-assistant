import { SubscriberPaymentComment } from '@/@types/monobank';
import { stringify, Options as StringifyOptions } from 'csv-stringify/sync';
import { parse, Options as ParseOptions } from 'csv-parse/sync';

export const subscriptionPaymentHashTag = '#spotify_subscription';

export const generateStringComment = (comment: Omit<SubscriberPaymentComment, 'hashTag'>): string => {
	const finalComment: SubscriberPaymentComment = {
		hashTag: subscriptionPaymentHashTag,
		...comment
	};
	const options: StringifyOptions = { columns: Object.keys(finalComment), eof: false };
	return stringify([finalComment], options);
};

export const parseStringComment = (comment: string): SubscriberPaymentComment => {
	if (!comment.includes(subscriptionPaymentHashTag)) {
		throw new Error('It is not a subscription payment comment');
	}

	const columns: (keyof SubscriberPaymentComment)[] = ['hashTag', 'subscriberId', 'firstName'];
	const options: ParseOptions = {
		columns,
		cast: (value, context) => (context.column === 'userId' ? Number(value) : value)
	};
	const parsedObject = parse(comment, options) as SubscriberPaymentComment[];

	if (parsedObject.length !== 1) {
		throw new Error('Unexpected number of items in the comment');
	}
	const firstItemIndex = 0;
	return parsedObject[firstItemIndex];
};
