import { derived, writable } from 'svelte/store';
import { gsap } from 'gsap';
import { circleSvgReady } from './circle';
import { arrayWithDuplicates } from './array';
import { rotatedBy } from './rotation';
import colors from '@lib/colors';
import type { BinarySearchState } from '@lib/types';

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

		const arraySize = $array.length;
		const wrapIndex = gsap.utils.wrap(0, arraySize);
		const rotatedArray = $array.map(
			(_, index, arr) => arr[wrapIndex(index + $rotatedBy)]
		);
		const searchStates = buildSearchStates(rotatedArray, $target);

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

			if (state.resultCondition !== 'HIGH_LESS_THAN_LOW') {
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
					findTargetWhereDuplicatesAnimationProgress.set(step);
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
