import { derived, writable } from 'svelte/store';
import { gsap } from 'gsap';
import { circleSvgReady } from './circle';
import { array } from './array';
import { rotatedBy } from './rotation';
import colors from '@lib/colors';
import type { BinarySearchState } from '@lib/types';

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

		const arraySize = $array.length;
		const wrapIndex = gsap.utils.wrap(0, arraySize);
		const rotatedArray = $array.map(
			(_, index, arr) => arr[wrapIndex(index + $rotatedBy)]
		);
		const searchStates = buildSearchStates(rotatedArray);

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

			if (outOfRangeTargets.length) {
				const highlightOutOfSearchRange = gsap.to(outOfRangeTargets, {
					fill: colors.outOfRange,
					duration: duration / 4,
				});

				tweensByStep[step].push(highlightOutOfSearchRange);
			}

			if (
				state.resultCondition !== 'HIGH_LESS_THAN_LOW' &&
				state.resultCondition !== 'HIGH_EQUAL_TO_LOW'
			) {
				const targets = searchRangeIndices
					.filter((index) => index !== mid && index !== resultIndex)
					.map((index) => `${targetPrefix}${index}`);

				const highlightSearchRange = gsap.to(targets, {
					fill: colors.searchRange,
					duration,
				});

				tweensByStep[step].push(highlightSearchRange);

				if (state.resultCondition !== 'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER') {
					const highlightMid = gsap.to(`${targetPrefix}${mid}`, {
						fill: colors.mid,
						duration,
					});

					tweensByStep[step].push(highlightMid);
				}
			}

			if (state.resultCondition === 'HIGH_LESS_THAN_LOW') {
				const targets = Array.from(new Set([low, mid, high])).map(
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
					findPivotAnimationProgress.set(step);
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
