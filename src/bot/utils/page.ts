import { markdownv2 } from 'telegram-format';

interface Page<T> {
	title: string;
	items: T[];
	generatePaginationInfo?: () => string;
	generateItemInfo: (item: T, index: number) => string;
	showPaginationTips?: boolean;
	dataAfterItemList?: string | string[];
}

const generatePageLines = <T>(page: Page<T>) => {
	const {
		title,
		generatePaginationInfo,
		items,
		generateItemInfo,
		showPaginationTips = false,
		dataAfterItemList
	} = page;
	const output: string[] = [];

	output.push(markdownv2.bold(title));

	if (generatePaginationInfo && showPaginationTips) {
		output.push(markdownv2.italic(markdownv2.escape(generatePaginationInfo())));
	}

	output.push('');

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		output.push(generateItemInfo(item, i));
	}

	if (dataAfterItemList) {
		output.push('');

		if (Array.isArray(dataAfterItemList)) {
			output.push(dataAfterItemList.join('\n'));
		} else {
			output.push(dataAfterItemList);
		}
	}

	if (showPaginationTips) {
		output.push('');
		output.push(
			markdownv2.italic(
				markdownv2.escape('*') + ' Для перегляду попередніх або наступних платежів використовуйте кнопки нижче'
			)
		);
	}

	return output;
};

export default generatePageLines;
