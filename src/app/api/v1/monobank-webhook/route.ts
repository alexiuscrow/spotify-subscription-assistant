import { NextRequest, NextResponse } from 'next/server';
import { inspect } from 'util';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	const json = await request.json();
	console.log('Regular', json);
	console.log('Inspect', inspect(json, false, null, false));
	return new Response(null, { status: 200 });
}
