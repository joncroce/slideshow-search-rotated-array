import { wrapIndex } from '.';

function rotateArray(
	array: Array<number> = [],
	rotateBy: number = 0
): Array<number> {
	if (array.length === 0 || rotateBy === 0) {
		return array;
	}

	return array.map((_, index, arr) => arr[wrapIndex(index + rotateBy)]);
}

export default rotateArray;
