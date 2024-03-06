export interface MonobankEvent<T> {
	type: string;
	data: T;
}

export interface StatementItem {
	account: string;
	statementItem: {
		id: string;
		time: number;
		description: string;
		mcc: number;
		originalMcc: number;
		amount: number;
		operationAmount: number;
		currencyCode: number;
		commissionRate: number;
		cashbackAmount: number;
		balance: number;
		hold: boolean;
		receiptId: string;
	};
}
