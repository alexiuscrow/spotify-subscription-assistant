import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const file = await fs.readFile(process.cwd() + '/src/bot/locales/uk.ftl', 'utf8');

	return NextResponse.json({ file });
}
