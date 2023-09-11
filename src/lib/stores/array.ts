import { writable, derived } from 'svelte/store';
import {
	createRandomAscendingArrayOfDistinctValues,
	modifyArrayToContainDuplicateValues,
} from '@utils';

export const array = writable<Array<number>>(
	createRandomAscendingArrayOfDistinctValues()
);

export const arrayWithDuplicates = derived([array], ([$array]) =>
	modifyArrayToContainDuplicateValues($array)
);
