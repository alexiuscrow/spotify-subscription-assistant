import { NextResponse } from 'next/server';
import * as subscriptionRepo from '@/store/repositories/subscriptionRepo';

export const dynamic = 'force-dynamic';

export async function GET() {
	// const { searchParams } = new URL(request.url);
	// const pos = searchParams.has('pos') ? Number(searchParams.get('pos')) : 0;
	// let response = await getPaymentsForAllYearsBySubscriber(pos);
	const response = await subscriptionRepo.getSubscription({ with: { subscriberHistory: true } });

	return NextResponse.json({ response });
}
