import { Menu } from '@grammyjs/menu';
import BotContext from '@/bot/BotContext';

const googleSpreadsheetLink = new Menu<BotContext>('debt-pagination').dynamic(async (ctx, range) => {
	range.url(
		ctx.t('google-sheets-link'),
		`https://docs.google.com/spreadsheets/d/${process.env.LOG_GOOGLE_SHEETSPREAD_ID}/edit?usp=sharing`
	);
});

export default googleSpreadsheetLink;
