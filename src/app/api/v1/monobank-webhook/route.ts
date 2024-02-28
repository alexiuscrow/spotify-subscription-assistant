import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	console.log(await request.json());
	return new Response(null, {status: 200});
}
