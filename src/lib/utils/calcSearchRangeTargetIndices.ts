import { wrapIndex } from '@utils';
import type { PartialBinarySearchState } from '@types';

function calcSearchRangeTargetIndices(
	state: PartialBinarySearchState,
	rotatedBy: number
): Array<number> {
	return Array.from(
		{ length: state.high - state.low + 1 },
		(_, index) => index
	).map((index) => wrapIndex(state.low + index + rotatedBy));
}

export default calcSearchRangeTargetIndices;
