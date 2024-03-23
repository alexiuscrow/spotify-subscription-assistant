interface Subscriber {
	id: number;
	userId: number;
	subscriptionId: number;
	spreadsheetSubscriberIndex: number;
}

interface UserSession {
	id: number;
	telegramId: number;
	username: string | null;
	firstName: string;
	lastName: string | null;
	role: 'regular' | 'admin';
	status: 'active' | 'canceled';
	createdAt: Date;
	subscriber?: Subscriber | null;
}
