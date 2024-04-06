import { NextRequest, NextResponse } from 'next/server';
import SubscriptionManager from '@/manager/SubscriptionManager';
import SpreadsheetManager from '@/manager/SpreadsheetManager';
import SubscriberManager from '@/manager/SubscriberManager';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const num = searchParams.has('num') ? Number(searchParams.get('num')) : 0;
	const subscriber = await SubscriberManager.getSubscriberById(num, {
		with: { user: true }
	});

	return NextResponse.json({ subscriber });
}
