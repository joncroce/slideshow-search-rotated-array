import { derived, writable } from 'svelte/store';
import { gsap } from 'gsap';
import { circleSvgReady } from '@stores/circle';
import { array } from '@stores/array';
import { rotatedBy } from '@stores/rotation';
import colors from '@lib/colors';
import {
	addHighlightTweensToTimeline,
	calcArrayPivotIndex,
	calcOutOfSearchRangeTargetIndices,
	calcSearchRangeTargetIndices,
	createHighlightTween,
	isValidResultIndex,
	mapBinarySearchTargetIndices,
	rotateArray,
} from '@utils';
import { BASE_HIGHLIGHT_ANIMATION_DURATION } from '@constants';
import type { BinarySearchState, TweensByStep } from '@types';

export const pivotIndex = derived([rotatedBy], ([$rotatedBy]) =>
	calcArrayPivotIndex($rotatedBy)
);
export const findPivotAnimationProgress = writable(-1);
export const findPivotAnimation = derived(
	[circleSvgReady, rotatedBy, array],
	([$circleSvgReady, $rotatedBy, $array]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady || !$array.length) {
			return {
				timeline,
				searchStates: [],
			};
		}

		const rotatedArray = rotateArray($array, $rotatedBy);
		const searchStates = buildSearchStates(rotatedArray);
		const tweensByStep: TweensByStep = Array.from(
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
				state.resultCondition !== 'HIGH_EQUAL_TO_LOW'
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

				if (state.resultCondition !== 'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER') {
					const highlightMidIndex = createHighlightTween(
						[midTargetIndex],
						colors.mid
					);
					if (highlightMidIndex) tweensByStep[step].push(highlightMidIndex);
				}
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
			findPivotAnimationProgress,
			findPivitAnimationIsActive
		);

		return {
			timeline,
			searchStates,
		};
	}
);

export const findPivitAnimationIsActive = writable(false);

function buildSearchStates(rotatedArray: Array<number>) {
	const states: Array<BinarySearchState['PIVOT']> = [];

	findPivot(rotatedArray);

	return states;

	function findPivot(
		nums: number[],
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

		if (high === low) {
			states.push({
				resultIndex: low,
				resultCondition: 'HIGH_EQUAL_TO_LOW',
				low: low,
				mid: low,
				high: high,
			});

			return low;
		}

		const mid = low + Math.floor((high - low) / 2);

		if (mid > low && nums[mid - 1] > nums[mid]) {
			states.push({
				resultIndex: mid - 1,
				resultCondition: 'VALUE_AT_MID_LESS_THAN_VALUE_BEFORE',
				low: low,
				mid: mid,
				high: high,
			});

			return mid - 1;
		}

		if (mid < high && nums[mid] > nums[mid + 1]) {
			states.push({
				resultIndex: mid,
				resultCondition: 'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER',
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

		return nums[low] >= nums[mid]
			? findPivot(nums, low, mid - 1)
			: findPivot(nums, mid + 1, high);
	}
}
