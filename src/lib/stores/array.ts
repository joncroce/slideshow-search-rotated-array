import { derived, writable } from 'svelte/store';

export const array = writable<Array<number>>(
	createRandomAscendingArrayOfDistinctValues(20, 0, 60)
);

export const arrayWithDuplicates = derived([array], ([$array]) =>
	modifyArrayToContainDuplicateValues($array, 0.3)
);

function createRandomAscendingArrayOfDistinctValues(
	size: number = 20,
	min: number = 0,
	max: number = 60
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

function modifyArrayToContainDuplicateValues(
	array: Array<number> = [],
	minDuplicateRatio: number = 0.3
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
