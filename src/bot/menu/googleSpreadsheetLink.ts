import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';

const googleSpreadsheetLink = new Menu<BotContext>('google-spreadsheet-link').url(
	'👀 Платежі у Google таблиці',
	`https://docs.google.com/spreadsheets/d/${process.env.LOG_GOOGLE_SHEETSPREAD_ID}/edit?usp=sharing`
);

export default googleSpreadsheetLink;
