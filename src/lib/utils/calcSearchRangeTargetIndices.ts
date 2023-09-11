import { wrapIndex } from '.';
import type { PartialBinarySearchState } from '@lib/types';

function calcSearchRangeTargetIndices(
	state: PartialBinarySearchState,
	rotatedBy: number
): Array<number> {
	return Array.from({ length: state.high - state.low + 1 }, (_, index) => index)
		.filter((index) => index !== state.mid && index !== state.resultIndex)
		.map((index) => wrapIndex(state.low + index + rotatedBy));
}

export default calcSearchRangeTargetIndices;
