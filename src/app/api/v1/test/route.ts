import { NextRequest, NextResponse } from 'next/server';
import SubscriberManager from '@/manager/SubscriberManager';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const withUser = searchParams.get('user') === 'true';
	const subscriber = await SubscriberManager.getAllSubscribers({ with: { user: withUser } });

	return NextResponse.json({ subscriber });
}
