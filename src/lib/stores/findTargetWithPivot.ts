import { derived, writable } from 'svelte/store';
import { gsap } from 'gsap';
import { circleSvgReady } from '@stores/circle';
import { array } from '@stores/array';
import { rotatedBy } from '@stores/rotation';
import { pivotIndex } from '@stores/findPivot';
import colors from '@lib/colors';
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
import type { BinarySearchState } from '@types';

export const targetWithPivot = writable<number>(null);
export const findTargetWithPivotAnimationProgress = writable(-1);
export const findTargetWithPivotAnimation = derived(
	[circleSvgReady, array, rotatedBy, pivotIndex, targetWithPivot],
	([$circleSvgReady, $array, $rotatedBy, $pivotIndex, $target]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady || !$array.length || $target === null) {
			return {
				timeline,
				searchStates: [],
			};
		}

		const rotatedArray = rotateArray($array, $rotatedBy);
		const searchStates = buildSearchStates(rotatedArray, $target, $pivotIndex);
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

			if (
				state.resultCondition !== 'HIGH_LESS_THAN_LOW' &&
				state.resultCondition !== 'TARGET_AT_PIVOT' &&
				state.resultCondition !== 'TARGET_LESS_THAN_VALUE_AT_PIVOT' &&
				state.resultCondition !== 'TARGET_GREATER_THAN_VALUE_BEFORE_PIVOT'
			) {
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
			findTargetWithPivotAnimationProgress,
			findTargetWithPivotAnimationIsActive
		);

		return {
			timeline,
			searchStates,
		};
	}
);

export const findTargetWithPivotAnimationIsActive = writable(false);

function buildSearchStates(
	rotatedArray: Array<number>,
	target: number,
	pivotIndex: number
) {
	const states: Array<BinarySearchState['TARGET']> = [];

	findTarget(rotatedArray, target, pivotIndex);

	return states;

	function findTarget(nums: number[], target: number, pivot: number): number {
		if (pivot === -1) {
			return binarySearch(nums, target);
		}

		if (nums[pivot] === target) {
			states.push({
				resultIndex: pivot,
				resultCondition: 'TARGET_AT_PIVOT',
				low: null,
				mid: null,
				high: null,
			});

			return pivot;
		}

		if (nums[pivot] > target) {
			states.push({
				resultIndex: -1,
				resultCondition: 'TARGET_LESS_THAN_VALUE_AT_PIVOT',
				low: null,
				mid: null,
				high: null,
			});

			return -1;
		}

		if (nums[pivot - 1] < target) {
			states.push({
				resultIndex: -1,
				resultCondition: 'TARGET_GREATER_THAN_VALUE_BEFORE_PIVOT',
				low: null,
				mid: null,
				high: null,
			});

			return -1;
		}

		return nums[0] <= target
			? binarySearch(nums, target, 0, pivot - 1)
			: binarySearch(nums, target, pivot + 1);
	}

	function binarySearch(
		nums: number[],
		target: number,
		low: number = 0,
		high: number = nums.length - 1
	): number {
		if (high < low) {
			states.push({
				resultIndex: -1,
				resultCondition: 'HIGH_LESS_THAN_LOW',
				low: low,
				mid: null,
				high: high,
			});

			return -1;
		}

		let mid = Math.floor((low + high) / 2);

		if (nums[mid] === target) {
			states.push({
				resultIndex: mid,
				resultCondition: 'TARGET_AT_MID',
				low: low,
				mid: mid,
				high: high,
			});

			return mid;
		}

		states.push({
			resultIndex: null,
			resultCondition: null,
			low: low,
			mid: mid,
			high: high,
		});

		return nums[mid] < target
			? binarySearch(nums, target, mid + 1, high)
			: binarySearch(nums, target, low, mid - 1);
	}
}
