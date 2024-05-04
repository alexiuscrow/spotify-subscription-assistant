import { StatementItem } from '@/common-interfaces/monobank';
import InvoiceRepo from '@/store/repository/InvoiceRepo';
import { SearchCriteria, SearchPageDirection } from '@/store/interfaces';

class InvoiceManager {
	static async createInvoice(statementItem: StatementItem, subscriptionId: number) {
		return InvoiceRepo.createInvoice(statementItem, subscriptionId);
	}

	static async getInvoices(criteria?: SearchCriteria) {
		return InvoiceRepo.getInvoices(criteria);
	}

	static async getAllInvoices(criteria: Pick<SearchCriteria, 'orderByColumns' | 'pageDirection' | 'selection'>) {
		return InvoiceRepo.getAllInvoices(criteria);
	}

	static async getAllowedInvoicePaginationOptions({
		limit = 5,
		page = 1,
		pageDirection = SearchPageDirection.REVERSE,
		selection
	}: Omit<SearchCriteria, 'orderByColumns'>) {
		return InvoiceRepo.getAllowedInvoicePaginationOptions({ limit, page, pageDirection, selection });
	}
}

export default InvoiceManager;
