import { NextRequest, NextResponse } from 'next/server';
import { inspect } from 'util';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	const json = await request.json();
	console.log(inspect(json, { depth: null }));
	return new Response(null, { status: 200 });
}
