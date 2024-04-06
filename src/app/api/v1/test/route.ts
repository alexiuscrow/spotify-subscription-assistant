import { NextResponse } from 'next/server';
import SubscriptionManager from '@/manager/SubscriptionManager';

export const dynamic = 'force-dynamic';

export async function GET() {
	// const { searchParams } = new URL(request.url);
	// const pos = searchParams.has('pos') ? Number(searchParams.get('pos')) : 0;
	// let response = await getPaymentsForAllYearsBySubscriber(pos);
	const response = await SubscriptionManager.getSubscription({ with: { subscriberHistory: true } });

	return NextResponse.json({ response });
}
