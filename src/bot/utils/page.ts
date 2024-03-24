import { markdownv2 } from 'telegram-format';

interface Page<T> {
	title: string;
	items: T[];
	generatePaginationInfo?: () => string;
	generateItemInfo: (item: T) => string;
	showPaginationTips?: boolean;
	textAfterItemList?: string;
}

const generatePageLines = <T>(page: Page<T>) => {
	const {
		title,
		generatePaginationInfo,
		items,
		generateItemInfo,
		showPaginationTips = false,
		textAfterItemList
	} = page;
	const output: string[] = [];

	output.push(markdownv2.bold(title));

	if (generatePaginationInfo) {
		output.push(markdownv2.italic(markdownv2.escape(generatePaginationInfo())));
	}

	output.push('');

	for (const item of items) {
		output.push(markdownv2.escape(generateItemInfo(item)));
	}

	if (textAfterItemList) {
		output.push('');
		output.push(markdownv2.escape(textAfterItemList));
	}

	if (showPaginationTips) {
		output.push('');
		output.push(markdownv2.italic('Для перегляду попередніх або наступних платежів використовуйте кнопки нижче'));
	}

	return output;
};

export default generatePageLines;
