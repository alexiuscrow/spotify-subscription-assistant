import { NextRequest } from 'next/server';
import { MonobankEvent, StatementItem, StatementItemWithAccount } from '@/@types/monobank';
import SubscriptionManager from '@/manager/SubscriptionManager';
import InvoiceManager from '@/manager/InvoiceManager';

export async function POST(request: NextRequest) {
	const json = await request.json();

	if (json?.type === 'StatementItem' && !!json.data?.statementItem) {
		const statementItemEvent = json as MonobankEvent<StatementItemWithAccount>;
		const invoiceStatement = statementItemEvent.data.statementItem;
		const expectedDescription = process.env.SUBSCRIPTION_INVOICE_STATEMENT_DESCRIPTION;

		if (invoiceStatement.description === expectedDescription) {
			const subscription = await SubscriptionManager.getSubscription();
			if (subscription) {
				const { amount } = await InvoiceManager.createInvoice(invoiceStatement, subscription.id);

				console.log('New invoice created. Amount:', amount);
			} else {
				console.error('Subscription not found');
			}
		}
	}

	return new Response(null, { status: 200 });
}
