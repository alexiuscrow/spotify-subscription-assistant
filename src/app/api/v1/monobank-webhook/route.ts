import { NextRequest } from 'next/server';
import { MonobankEvent, StatementItem } from '@/@types/monobank';
import { db } from '@/store/db';
import { invoice, subscription as subscriptionTable } from '@/store/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
	const json = await request.json();

	if (json?.type === 'StatementItem' && !!json.data?.statementItem) {
		const statementItemEvent = json as MonobankEvent<StatementItem>;
		const invoiceStatement = statementItemEvent.data.statementItem;
		const expectedDescription = process.env.SUBSCRIPTION_INVOICE_STATEMENT_DESCRIPTION;

		if (invoiceStatement.description === expectedDescription) {
			const subscription = await db.query.subscription.findFirst({
				where: eq(subscriptionTable.name, process.env.SUBSCRIPTION_NAME as string)
			});
			if (subscription) {
				type NewInvoice = typeof invoice.$inferSelect;
				const amountConvertor = -100;
				const dateConvertor = 1_000;

				await db.insert(invoice).values({
					amount: invoiceStatement.amount / amountConvertor,
					operationAmount: invoiceStatement.operationAmount / amountConvertor,
					currencyCode: invoiceStatement.currencyCode,
					subscriptionId: subscription.id,
					createdAt: new Date(invoiceStatement.time * dateConvertor)
				} as NewInvoice);

				console.log('New invoice created: ');
			} else {
				console.error('Subscription not found');
			}
		}
	}

	return new Response(null, { status: 200 });
}
