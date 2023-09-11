import { derived, writable } from 'svelte/store';
import { gsap } from 'gsap';
import { circleSvgReady } from './circle';
import { arrayWithDuplicates } from './array';
import { rotatedBy } from './rotation';
import colors from '@lib/colors';
import type { BinarySearchState } from '@lib/types';
import {
	addHighlightTweensToTimeline,
	calcOutOfSearchRangeTargetIndices,
	calcSearchRangeTargetIndices,
	createHighlightTween,
	isValidResultIndex,
	mapBinarySearchTargetIndices,
	rotateArray,
} from '@utils';
import { BASE_HIGHLIGHT_ANIMATION_DURATION } from '@constants';

export const targetWhereDuplicates = writable<number>(null);
export const findTargetWhereDuplicatesAnimationProgress = writable(-1);
export const findTargetWhereDuplicatesAnimation = derived(
	[circleSvgReady, arrayWithDuplicates, rotatedBy, targetWhereDuplicates],
	([$circleSvgReady, $array, $rotatedBy, $target]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady || !$array.length || $target === null) {
			return {
				timeline,
				searchStates: [],
			};
		}

		const rotatedArray = rotateArray($array, $rotatedBy);
		const searchStates = buildSearchStates(rotatedArray, $target);
		const tweensByStep: Array<Array<gsap.core.Tween>> = Array.from(
			{ length: searchStates.length },
			() => []
		);

		searchStates.forEach((state, step) => {
			const {
				lowTargetIndex,
				midTargetIndex,
				highTargetIndex,
				resultTargetIndex,
			} = mapBinarySearchTargetIndices(state, $rotatedBy);

			const outOfSearchRangeTargetIndices = calcOutOfSearchRangeTargetIndices(
				state,
				$rotatedBy
			);
			const highlightOutOfRangeIndices = createHighlightTween(
				outOfSearchRangeTargetIndices,
				colors.outOfRange,
				BASE_HIGHLIGHT_ANIMATION_DURATION / 4
			);
			if (highlightOutOfRangeIndices)
				tweensByStep[step].push(highlightOutOfRangeIndices);

			if (state.resultCondition !== 'HIGH_LESS_THAN_LOW') {
				const searchRangeIndices = calcSearchRangeTargetIndices(
					state,
					$rotatedBy
				);
				const highlightSearchRangeIndices = createHighlightTween(
					searchRangeIndices,
					colors.searchRange
				);
				if (highlightSearchRangeIndices)
					tweensByStep[step].push(highlightSearchRangeIndices);

				const highlightMidIndex = createHighlightTween(
					[midTargetIndex],
					colors.mid
				);
				if (highlightMidIndex) tweensByStep[step].push(highlightMidIndex);
			}

			if (state.resultCondition === 'HIGH_LESS_THAN_LOW') {
				const invalidIndices = Array.from(
					new Set([lowTargetIndex, midTargetIndex, highTargetIndex])
				);
				const highlightInvalidIndices = createHighlightTween(
					invalidIndices,
					colors.invalid
				);
				if (highlightInvalidIndices)
					tweensByStep[step].push(highlightInvalidIndices);
			}

			if (isValidResultIndex(resultTargetIndex)) {
				const highlightResultIndex = createHighlightTween(
					[resultTargetIndex],
					colors.result
				);
				if (highlightResultIndex) tweensByStep[step].push(highlightResultIndex);
			}
		});

		addHighlightTweensToTimeline(
			timeline,
			tweensByStep,
			findTargetWhereDuplicatesAnimationProgress
		);

		return {
			timeline,
			searchStates,
		};
	}
);

function buildSearchStates(nums: Array<number>, target: number) {
	const states: Array<BinarySearchState['TARGET']> = [];

	let low = 0;
	let high = nums.length - 1;
	let mid: number;

	while (low <= high) {
		mid = low + Math.floor((high - low) / 2);

		if (nums[mid] === target) {
			states.push({
				resultIndex: mid,
				resultCondition: 'TARGET_AT_MID',
				low: low,
				mid: mid,
				high: high,
			});

			return states;
		} else {
			states.push({
				resultIndex: null,
				resultCondition: null,
				low: low,
				mid: mid,
				high: high,
			});

			if (nums[mid] > nums[low]) {
				if (target >= nums[low] && target < nums[mid]) {
					high = mid - 1;
				} else {
					low = mid + 1;
				}
			} else if (nums[mid] < nums[low]) {
				if (target <= nums[high] && target > nums[mid]) {
					low = mid + 1;
				} else {
					high = mid - 1;
				}
			} else {
				low += 1;
			}
		}
	}

	states.push({
		resultIndex: -1,
		resultCondition: 'HIGH_LESS_THAN_LOW',
		low: low,
		mid: null,
		high: high,
	});

	return states;
}
