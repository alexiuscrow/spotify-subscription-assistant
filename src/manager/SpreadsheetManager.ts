import { google, sheets_v4 } from 'googleapis';
import {
	SpreadsheetMonthPaymentRawStatus,
	SpreadsheetAllPayments,
	SpreadsheetAllPaymentsByYear,
	SpreadsheetSubscriber,
	SpreadsheetPaymentsByYear
} from '@/@types/spreadsheets';
import { DateTime } from 'luxon';
import Schema$ValueRange = sheets_v4.Schema$ValueRange;

const auth = new google.auth.GoogleAuth({
	scopes: JSON.parse(process.env.GOOGLE_AUTH_SCOPES as string),
	credentials: {
		type: process.env.GOOGLE_AUTH_TYPE,
		project_id: process.env.GOOGLE_AUTH_PROJECT_ID,
		private_key_id: process.env.GOOGLE_AUTH_PRIVATE_KEY_ID,
		private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY,
		client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL,
		client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
		universe_domain: process.env.GOOGLE_AUTH_UNIVERSE_DOMAIN
	}
});

const sheetService = new sheets_v4.Sheets({ auth });

class SpreadsheetManager {
	static async getSheetTitles() {
		const availableSheetsResponse = await sheetService.spreadsheets.get({
			spreadsheetId: process.env.LOG_GOOGLE_SHEETSPREAD_ID,
			fields: 'sheets.properties.title'
		});
		return availableSheetsResponse.data.sheets?.map(sheet => sheet.properties?.title as string) ?? [];
	}

	static async getPaymentsFromSheets(sheetTitles: string[]): Promise<SpreadsheetAllPaymentsByYear> {
		const ranges = sheetTitles.map(title => `${title}!B3:M6`);
		const result = await sheetService.spreadsheets.values.batchGet({
			spreadsheetId: process.env.LOG_GOOGLE_SHEETSPREAD_ID,
			ranges
		});
		if (!result.data.valueRanges) throw new Error('The valueRanges are not defined');

		return result.data.valueRanges.reduce((yearsResult, valueRange) => {
			if (!valueRange.range) throw new Error('The range is not defined');
			if (!valueRange.values) throw new Error('The values are not defined');

			const year = Number(valueRange.range.split('!')[0].replace(/[^0-9]/g, ''));
			yearsResult[year] = valueRange.values.reduce(
				(subscriberResult, subscriberRow: SpreadsheetMonthPaymentRawStatus[], subscriberIndex) => {
					const expectedMonthNum = 12;
					const missingMonthNum = expectedMonthNum - subscriberRow.length;
					const missingMonths = Array.from({ length: missingMonthNum }, () => null);

					subscriberResult[subscriberIndex] = [...missingMonths, ...subscriberRow].reduce(
						(monthResult, monthValue, monthIndex) => {
							monthResult[monthIndex] =
								monthValue === null ? null : monthValue === SpreadsheetMonthPaymentRawStatus.TRUE;
							return monthResult;
						},
						{} as SpreadsheetSubscriber
					);
					return subscriberResult;
				},
				{} as SpreadsheetAllPayments
			);
			return yearsResult;
		}, {} as SpreadsheetAllPaymentsByYear);
	}

	static async getPaymentsForAllYears() {
		const sheetTitles = await SpreadsheetManager.getSheetTitles();
		return SpreadsheetManager.getPaymentsFromSheets(sheetTitles);
	}

	static async getPaymentsFromSheetsBySubscriber(
		sheetTitles: string[],
		subscriberSpreadsheetPosition: number
	): Promise<SpreadsheetPaymentsByYear> {
		const rowOffset = 3;
		const row = subscriberSpreadsheetPosition + rowOffset;
		const ranges = sheetTitles.map(title => `${title}!B${row}:M${row}`);
		const result = await sheetService.spreadsheets.values.batchGet({
			spreadsheetId: process.env.LOG_GOOGLE_SHEETSPREAD_ID,
			ranges
		});
		if (!result.data.valueRanges) throw new Error('The valueRanges are not defined');

		return result.data.valueRanges.reduce((yearsResult, valueRange) => {
			if (!valueRange.range) throw new Error('The range is not defined');
			if (!valueRange.values) throw new Error('The values are not defined');

			const year = Number(valueRange.range.split('!')[0].replace(/[^0-9]/g, ''));
			const subscriberRow = valueRange.values[0];
			const expectedMonthNum = 12;
			const missingMonthNum = expectedMonthNum - subscriberRow.length;
			const missingMonths = Array.from({ length: missingMonthNum }, () => null);

			yearsResult[year] = [...missingMonths, ...subscriberRow].reduce((monthResult, monthValue, monthIndex) => {
				monthResult[monthIndex] = monthValue === null ? null : monthValue === SpreadsheetMonthPaymentRawStatus.TRUE;
				return monthResult;
			}, {} as SpreadsheetSubscriber);

			return yearsResult;
		}, {} as SpreadsheetPaymentsByYear);
	}

	static async getPaymentsForAllYearsBySubscriber(subscriberSpreadsheetPosition: number) {
		const sheetTitles = await SpreadsheetManager.getSheetTitles();
		return SpreadsheetManager.getPaymentsFromSheetsBySubscriber(sheetTitles, subscriberSpreadsheetPosition);
	}

	static async getLatestPayedDate(subscriberSpreadsheetPosition: number) {
		let latestPayedDate: DateTime | null = null;

		const payments = await SpreadsheetManager.getPaymentsForAllYearsBySubscriber(subscriberSpreadsheetPosition);

		for (const year in payments) {
			const subscriber = payments[year];
			for (const month in subscriber) {
				const paymentStatus = subscriber[month];
				if (paymentStatus === true) {
					const pointerDate = DateTime.fromObject(
						{
							year: parseInt(year),
							month: parseInt(month) + 1,
							day: Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string)
						},
						{ locale: process.env.DATETIME_LOCALE as string }
					);
					if (!latestPayedDate || pointerDate > latestPayedDate) {
						latestPayedDate = pointerDate;
					}
				}
			}
		}

		return latestPayedDate;
	}

	static async writePayments(subscriberSpreadsheetPosition: number, numberOfPayments: number) {
		const sheetTitles = await SpreadsheetManager.getSheetTitles();
		const existedPayments = await SpreadsheetManager.getPaymentsFromSheetsBySubscriber(
			sheetTitles,
			subscriberSpreadsheetPosition
		);
		const rowOffset = 3;
		const ranges: string[] = [];
		const now = DateTime.now();
		let latestPayedDate: DateTime | null = null;

		for (const year in existedPayments) {
			if (ranges.length >= numberOfPayments) break;

			const subscriber = existedPayments[year];
			for (const month in subscriber) {
				if (ranges.length >= numberOfPayments) break;
				const pointerDate = DateTime.fromObject(
					{
						year: parseInt(year),
						month: parseInt(month) + 1,
						day: Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string)
					},
					{ locale: process.env.DATETIME_LOCALE as string }
				);
				if (
					pointerDate.startOf('month') < now.startOf('month') ||
					(pointerDate.startOf('month') === now.startOf('month') &&
						pointerDate.day >= Number(process.env.DEFAULT_CHARGE_DAY_OF_MONTH as string))
				) {
					const paymentStatus = subscriber[month];
					if (paymentStatus === false) {
						ranges.push(
							`${year}!${String.fromCharCode(66 + parseInt(month))}${subscriberSpreadsheetPosition + rowOffset}`
						);
						latestPayedDate = pointerDate;
					}
				} else {
					break;
				}
			}
		}

		const dataToUpdate: Schema$ValueRange[] = ranges.map(range => ({
			range,
			values: [[true]]
		}));

		await sheetService.spreadsheets.values.batchUpdate({
			spreadsheetId: process.env.LOG_GOOGLE_SHEETSPREAD_ID,
			requestBody: {
				data: dataToUpdate,
				valueInputOption: 'RAW'
			}
		});

		return latestPayedDate;
	}
}

export default SpreadsheetManager;
