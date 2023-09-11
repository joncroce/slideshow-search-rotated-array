import colors from '@lib/colors';

function printArray(
	array: Array<number>,
	highlightIndices: Array<number> = []
): string {
	const highlightColor = colors.highlight;

	return array.reduce((result: string, value: number, index: number) => {
		if (highlightIndices.includes(index)) {
			result += `<span style="color: ${highlightColor};">${value}</span>`;
		} else {
			result += value;
		}

		if (index < array.length - 1) {
			result += ', ';
		} else {
			result += ']';
		}

		return result;
	}, '[');
}

export default printArray;
