import { derived, writable } from 'svelte/store';
import { gsap } from 'gsap';
import colors from '@lib/colors';
import { circleSvgReady } from './circle';
import { array } from './array';
import { rotatedBy } from './rotation';
import { pivotIndex } from './findPivot';
import type { BinarySearchState } from '@lib/types';

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

		const arraySize = $array.length;
		const wrapIndex = gsap.utils.wrap(0, arraySize);
		const rotatedArray = $array.map(
			(_, index, arr) => arr[wrapIndex(index + $rotatedBy)]
		);
		const searchStates = buildSearchStates(rotatedArray, $target, $pivotIndex);

		const tweensByStep: Array<Array<gsap.core.Tween>> = Array.from(
			{ length: searchStates.length },
			() => []
		);

		const targetPrefix = '#array-item-';

		const duration = 0.5;

		searchStates.forEach((state, step) => {
			const searchRangeIndices = Array.from(
				{ length: state.high - state.low + 1 },
				(_, index) => wrapIndex(state.low + index + $rotatedBy)
			);

			const low = state.low !== null ? wrapIndex(state.low + $rotatedBy) : null;
			const mid = state.mid !== null ? wrapIndex(state.mid + $rotatedBy) : null;
			const high =
				state.high !== null ? wrapIndex(state.high + $rotatedBy) : null;

			const resultIndex =
				state.resultIndex !== null
					? state.resultIndex !== -1
						? wrapIndex(state.resultIndex + $rotatedBy)
						: -1
					: null;

			const outOfRangeTargets = Array.from({ length: arraySize }, (_, index) =>
				wrapIndex(index - $rotatedBy)
			)
				.filter(
					(index) =>
						index !== resultIndex &&
						index !== low &&
						index !== mid &&
						index !== high &&
						!searchRangeIndices.includes(index)
				)
				.map((index) => `${targetPrefix}${index}`);

			if (state.resultCondition === 'TARGET_AT_PIVOT') {
				console.log(searchRangeIndices);
			}

			if (outOfRangeTargets.length) {
				const highlightOutOfSearchRange = gsap.to(outOfRangeTargets, {
					fill: colors.outOfRange,
					duration: duration / 4,
				});

				tweensByStep[step].push(highlightOutOfSearchRange);
			}

			if (
				state.resultCondition !== 'HIGH_LESS_THAN_LOW' &&
				state.resultCondition !== 'TARGET_AT_PIVOT' &&
				state.resultCondition !== 'TARGET_GREATER_THAN_VALUE_AT_PIVOT' &&
				state.resultCondition !== 'TARGET_LESS_THAN_VALUE_AFTER_PIVOT'
			) {
				const targets = searchRangeIndices
					.filter((index) => index !== mid && index !== resultIndex)
					.map((index) => `${targetPrefix}${index}`);

				const highlightSearchRange = gsap.to(targets, {
					fill: colors.searchRange,
					duration,
				});

				tweensByStep[step].push(highlightSearchRange);

				const highlightMid = gsap.to(`${targetPrefix}${mid}`, {
					fill: colors.mid,
					duration,
				});

				tweensByStep[step].push(highlightMid);
			}

			if (state.resultCondition === 'HIGH_LESS_THAN_LOW') {
				const targets = Array.from(new Set([low, mid, high]).values()).map(
					(index) => `${targetPrefix}${index}`
				);

				const highlightInvalidIndices = gsap.to(targets, {
					fill: colors.invalid,
					duration,
				});

				tweensByStep[step].push(highlightInvalidIndices);
			}

			if (resultIndex !== null && resultIndex !== -1) {
				const highlightResult = gsap.to(`${targetPrefix}${resultIndex}`, {
					fill: colors.result,
					duration,
				});

				tweensByStep[step].push(highlightResult);
			}
		});

		let time = 0;

		tweensByStep.forEach((tweens, step) => {
			timeline.call(
				() => {
					findTargetWithPivotAnimationProgress.set(step);
				},
				[],
				time
			);
			timeline.add(`${step}`, time);
			timeline.add(tweens, time);
			time += duration * 2;
		});

		return {
			timeline,
			searchStates,
		};
	}
);

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

		if (nums[pivot] < target) {
			states.push({
				resultIndex: -1,
				resultCondition: 'TARGET_GREATER_THAN_VALUE_AT_PIVOT',
				low: null,
				mid: null,
				high: null,
			});

			return -1;
		}

		if (nums[pivot + 1] > target) {
			states.push({
				resultIndex: -1,
				resultCondition: 'TARGET_LESS_THAN_VALUE_AFTER_PIVOT',
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
