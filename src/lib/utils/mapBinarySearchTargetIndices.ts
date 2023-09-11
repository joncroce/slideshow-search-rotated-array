import { wrapIndex } from '.';
import type { PartialBinarySearchState } from '@lib/types';

function mapBinarySearchTargetIndices(
	searchState: PartialBinarySearchState,
	rotatedBy: number
): {
	lowTargetIndex: number | null;
	midTargetIndex: number | null;
	highTargetIndex: number | null;
	resultTargetIndex: number | null;
} {
	const { low, mid, high, resultIndex } = searchState;

	const [lowTargetIndex, midTargetIndex, highTargetIndex] = [
		low,
		mid,
		high,
	].map(rotateToTargetIndex);

	const resultTargetIndex =
		resultIndex !== null
			? resultIndex !== -1
				? rotateToTargetIndex(resultIndex)
				: -1
			: null;

	return {
		lowTargetIndex,
		midTargetIndex,
		highTargetIndex,
		resultTargetIndex,
	};

	function rotateToTargetIndex(index: number | null): number | null {
		if (index === null) {
			return null;
		}

		return wrapIndex(index + rotatedBy);
	}
}

export default mapBinarySearchTargetIndices;
