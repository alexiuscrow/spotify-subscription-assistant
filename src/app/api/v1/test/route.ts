import { NextResponse } from 'next/server';
import { getPaymentsForAllYears } from '@/spreadsheet';

export async function POST() {
	let response = await getPaymentsForAllYears();

	return NextResponse.json({ response });
}
