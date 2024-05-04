import SpreadsheetManager from '@/manager/SpreadsheetManager';
import NodeCache from 'node-cache';
import { SpreadsheetAllPaymentsByYear, SpreadsheetPaymentsByYear } from '@/common-interfaces/spreadsheets';
import { DateTime } from 'luxon';

class SpreadsheetManagerCached extends SpreadsheetManager {
	static cache = new NodeCache({ stdTTL: 60 * 5 });

	static async getSheetTitles() {
		const cacheKey = 'sheetTitles';
		const cachedSheetTitles = SpreadsheetManagerCached.cache.get<string[]>(cacheKey);

		if (cachedSheetTitles) {
			return cachedSheetTitles;
		}

		const sheetTitles = await SpreadsheetManager.getSheetTitles();
		SpreadsheetManagerCached.cache.set(cacheKey, sheetTitles, 60 * 30); // TTL is 30 min

		return sheetTitles;
	}

	static async getPaymentsFromSheets(sheetTitles: string[]): Promise<SpreadsheetAllPaymentsByYear> {
		const cacheKey = `payments_${sheetTitles.join('+')}`;
		const cachedPayments = SpreadsheetManagerCached.cache.get<SpreadsheetAllPaymentsByYear>(cacheKey);

		if (cachedPayments) {
			return cachedPayments;
		}

		const paymentsData = await SpreadsheetManager.getPaymentsFromSheets(sheetTitles);
		SpreadsheetManagerCached.cache.set(cacheKey, paymentsData, 60); // TTL is 1 min

		return paymentsData;
	}

	static async getPaymentsForAllYears() {
		const sheetTitles = await SpreadsheetManagerCached.getSheetTitles();
		return SpreadsheetManagerCached.getPaymentsFromSheets(sheetTitles);
	}

	static async getPaymentsFromSheetsBySubscriber(
		sheetTitles: string[],
		subscriberSpreadsheetPosition: number
	): Promise<SpreadsheetPaymentsByYear> {
		const cacheKey = `payments_${sheetTitles.join('+')}_subscriber_${subscriberSpreadsheetPosition}`;
		const cachedPayments = SpreadsheetManagerCached.cache.get<SpreadsheetPaymentsByYear>(cacheKey);

		if (cachedPayments) {
			return cachedPayments;
		}

		const paymentsData = await SpreadsheetManager.getPaymentsFromSheetsBySubscriber(
			sheetTitles,
			subscriberSpreadsheetPosition
		);
		SpreadsheetManagerCached.cache.set(cacheKey, paymentsData, 60); // TTL is 1 min

		return paymentsData;
	}

	static async getPaymentsForAllYearsBySubscriber(subscriberSpreadsheetPosition: number) {
		const sheetTitles = await SpreadsheetManagerCached.getSheetTitles();
		return SpreadsheetManagerCached.getPaymentsFromSheetsBySubscriber(sheetTitles, subscriberSpreadsheetPosition);
	}

	static async getLatestPaidDate(subscriberSpreadsheetPosition: number): Promise<DateTime | null> {
		const cacheKey = `latestPaidDate_${subscriberSpreadsheetPosition}`;
		const cachedLatestPaidDate = SpreadsheetManagerCached.cache.get<DateTime | null>(cacheKey);

		if (cachedLatestPaidDate) {
			return cachedLatestPaidDate;
		}

		const latestPaidDate = await SpreadsheetManager.getLatestPaidDate(subscriberSpreadsheetPosition);
		SpreadsheetManagerCached.cache.set(cacheKey, latestPaidDate, 60); // TTL is 1 min

		return latestPaidDate;
	}
}

export default SpreadsheetManagerCached;
