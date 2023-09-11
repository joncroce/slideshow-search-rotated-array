import { ARRAY_MAX_VALUE, ARRAY_MIN_VALUE, ARRAY_SIZE } from '@constants';

function createRandomAscendingArrayOfDistinctValues(
	size: number = ARRAY_SIZE,
	min: number = ARRAY_MIN_VALUE,
	max: number = ARRAY_MAX_VALUE
) {
	if (min > max) {
		throw new Error("Minimum can't be greater than maximum.");
	}

	if (max - min + 1 < size) {
		throw new Error(
			'Insufficient values in range to create an array of that size.'
		);
	}

	const set = new Set(Array.from({ length: max - min + 1 }, (_, i) => i + min));
	const result: Array<number> = [];

	while (result.length < size) {
		const setSize = set.size;
		const randomIndex = Math.floor(Math.random() * setSize);
		const value = Array.from(set.values()).at(randomIndex);

		result.push(value);
		set.delete(value);
	}

	return result.sort((a, b) => a - b);
}

export default createRandomAscendingArrayOfDistinctValues;
