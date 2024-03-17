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
	[month: number]: SubscriberPaymentPerMonthStatus;
}

export interface SpreadsheetPaymentsByYear {
	[year: number]: {
		[subscriberIndex: number]: SpreadsheetSubscriber;
	};
}
