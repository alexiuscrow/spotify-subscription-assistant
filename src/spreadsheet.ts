import { google, sheets_v4 } from 'googleapis';
import {
	SpreadsheetMonthPaymentRawStatus,
	SpreadsheetPayments,
	SpreadsheetPaymentsByYear,
	SpreadsheetSubscriber
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

export const getPaymentsFromSheets = async (sheetTitles: string[]): Promise<SpreadsheetPaymentsByYear> => {
	const ranges = sheetTitles.map(title => `${title}!B3:M6`);
	const result = await sheetService.spreadsheets.values.batchGet({
		spreadsheetId: process.env.LOG_GOOGLE_SHEETSPREAD_ID,
		ranges
	});
	if (!result.data.valueRanges) throw 'The valueRanges are not defined';

	return result.data.valueRanges.reduce((yearsResult, valueRange) => {
		if (!valueRange.range) throw 'The range is not defined';
		if (!valueRange.values) throw 'The values are not defined';

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
			{} as SpreadsheetPayments
		);
		return yearsResult;
	}, {} as SpreadsheetPaymentsByYear);
};

export const getPaymentsForAllYears = async () => {
	const sheetTitles = await getSheetTitles();
	return getPaymentsFromSheets(sheetTitles);
};
