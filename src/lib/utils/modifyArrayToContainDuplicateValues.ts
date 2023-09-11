import { MIN_DUPLICATE_RATIO } from '@constants';

function modifyArrayToContainDuplicateValues(
	array: Array<number> = [],
	minDuplicateRatio: number = MIN_DUPLICATE_RATIO
) {
	if (array.length === 0) {
		return [];
	}

	const arraySize = array.length;
	const valuesToDuplicate = Array.from(
		{ length: Math.ceil((arraySize * minDuplicateRatio) / 2) },
		() => array[Math.floor(Math.random() * arraySize)]
	);
	const result: Array<number> = valuesToDuplicate.concat(valuesToDuplicate);

	for (let i = result.length; i < arraySize; i++) {
		const value = array[Math.floor(Math.random() * arraySize)];

		result[i] = value;
	}

	result.sort((a, b) => a - b);

	return result;
}

export default modifyArrayToContainDuplicateValues;
