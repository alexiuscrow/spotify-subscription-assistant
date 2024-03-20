import { google, sheets_v4 } from 'googleapis';
import {
	SpreadsheetMonthPaymentRawStatus,
	SpreadsheetAllPayments,
	SpreadsheetAllPaymentsByYear,
	SpreadsheetSubscriber,
	SpreadsheetPaymentsByYear
} from '@/@types/spreadsheets';

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

export const getSheetTitles = async () => {
	const availableSheetsResponse = await sheetService.spreadsheets.get({
		spreadsheetId: process.env.LOG_GOOGLE_SHEETSPREAD_ID,
		fields: 'sheets.properties.title'
	});
	return availableSheetsResponse.data.sheets?.map(sheet => sheet.properties?.title as string) ?? [];
};

export const getPaymentsFromSheets = async (sheetTitles: string[]): Promise<SpreadsheetAllPaymentsByYear> => {
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
						monthResult[monthIndex] = monthValue === null ? null : monthValue === SpreadsheetMonthPaymentRawStatus.TRUE;
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
};

export const getPaymentsForAllYears = async () => {
	const sheetTitles = await getSheetTitles();
	return getPaymentsFromSheets(sheetTitles);
};

export const getPaymentsFromSheetsBySubscriber = async (
	sheetTitles: string[],
	subscriberSpreadsheetPosition: number
): Promise<SpreadsheetPaymentsByYear> => {
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
};

export const getPaymentsForAllYearsBySubscriber = async (subscriberSpreadsheetPosition: number) => {
	const sheetTitles = await getSheetTitles();
	return getPaymentsFromSheetsBySubscriber(sheetTitles, subscriberSpreadsheetPosition);
};
