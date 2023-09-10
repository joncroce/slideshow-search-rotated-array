import { derived } from 'svelte/store';
import { array } from './array';
import { rotatedBy } from './rotation';

export const pivotIndex = derived(
	[array, rotatedBy],
	([$array, $rotatedBy]) => {
		if (!$array || $rotatedBy === 0) {
			return -1;
		}

		const result = $array.length - 1 - $rotatedBy;

		return result;
	}
);
