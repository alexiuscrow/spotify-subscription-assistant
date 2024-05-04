import InvoiceManager from '@/manager/InvoiceManager';
import { SearchCriteria } from '@/store/interfaces';
import NodeCache from 'node-cache';
import {
	GetAllowedInvoicePaginationOptionsResponse,
	GetInvoicesResponse,
	Invoice
} from '@/store/repository/InvoiceRepo';

class InvoiceManagerCached extends InvoiceManager {
	static cache = new NodeCache({ stdTTL: 60 });

	static async getInvoices(criteria?: SearchCriteria) {
		const cacheKey = `invoices_${JSON.stringify(criteria)}`;
		const cachedInvoices = InvoiceManagerCached.cache.get<GetInvoicesResponse>(cacheKey);
		if (cachedInvoices) {
			return cachedInvoices;
		}
		const invoices = await InvoiceManager.getInvoices(criteria);
		InvoiceManagerCached.cache.set(cacheKey, invoices);
		return invoices;
	}

	static async getAllInvoices(criteria: Pick<SearchCriteria, 'orderByColumns' | 'pageDirection' | 'selection'>) {
		const cacheKey = `all_invoices_${JSON.stringify(criteria)}`;
		const cachedInvoices = InvoiceManagerCached.cache.get<Invoice[]>(cacheKey);
		if (cachedInvoices) {
			return cachedInvoices;
		}
		const invoices = await InvoiceManager.getAllInvoices(criteria);
		InvoiceManagerCached.cache.set(cacheKey, invoices);
		return invoices;
	}

	static async getAllowedInvoicePaginationOptions(criteria: Omit<SearchCriteria, 'orderByColumns'>) {
		const cacheKey = `allowed_invoice_pagination_options_${JSON.stringify(criteria)}`;
		const cachedInvoices = InvoiceManagerCached.cache.get<GetAllowedInvoicePaginationOptionsResponse>(cacheKey);
		if (cachedInvoices) {
			return cachedInvoices;
		}
		const invoices = await InvoiceManager.getAllowedInvoicePaginationOptions(criteria);
		InvoiceManagerCached.cache.set(cacheKey, invoices);
		return invoices;
	}
}

export default InvoiceManagerCached;
