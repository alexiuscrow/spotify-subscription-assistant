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

export enum SpreadsheetMonthPaymentRawStatus {
	TRUE = 'TRUE',
	FALSE = 'FALSE'
}
export type SpreadsheetMonthPaymentStatus = boolean | null;

export interface SpreadsheetSubscriber {
	[month: number]: SpreadsheetMonthPaymentStatus;
}

export interface SpreadsheetAllPayments {
	[subscriberIndex: number]: SpreadsheetSubscriber;
}

export interface SpreadsheetAllPaymentsByYear {
	[year: number]: SpreadsheetAllPayments;
}

export interface SpreadsheetPaymentsByYear {
	[year: number]: SpreadsheetSubscriber;
}
