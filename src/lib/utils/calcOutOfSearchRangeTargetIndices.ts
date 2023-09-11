import { ARRAY_SIZE } from '@constants';
import {
	calcSearchRangeTargetIndices,
	mapBinarySearchTargetIndices,
	wrapIndex,
} from '.';
import type { PartialBinarySearchState } from '@lib/types';

function calcOutOfSearchRangeTargetIndices(
	searchState: PartialBinarySearchState,
	rotatedBy: number
) {
	const searchRangeIndices = calcSearchRangeTargetIndices(
		searchState,
		rotatedBy
	);
	const binarySearchIndices = mapBinarySearchTargetIndices(
		searchState,
		rotatedBy
	);
	const filterSet = new Set([
		...searchRangeIndices,
		...Object.keys(binarySearchIndices),
	]);

	return Array.from({ length: ARRAY_SIZE }, (_, index) =>
		wrapIndex(index + rotatedBy)
	).filter((index) => !filterSet.has(index));
}

export default calcOutOfSearchRangeTargetIndices;
