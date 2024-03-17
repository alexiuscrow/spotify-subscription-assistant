export enum Month {
	Jan,
	Feb,
	Mar,
	Apr,
	May,
	Jun,
	Jul,
	Aug,
	Sep,
	Oct,
	Nov,
	Dec
}

export type SubscriberPaymentPerMonthStatus = boolean | null;

export interface SpreadsheetSubscriber {
	[month: (typeof Month)[keyof Month]]: SubscriberPaymentPerMonthStatus;
}

export interface SpreadsheetPaymentsByYear {
	[year: number]: {
		[subscriberIndex: number]: SpreadsheetSubscriber;
	};
}
