import { gsap } from 'gsap';
import { derived, writable } from 'svelte/store';
import { circleSvgReady } from '@stores/circle';
import colors from '@lib/colors';
import type { BinarySearchState } from '@lib/types';

function createRandomAscendingArrayOfDistinctValues(
	size: number = 20,
	min: number = 0,
	max: number = 60
) {
	if (min > max) {
		throw new Error("Minimum can't be greater than maximum.");
	}

	if (max - min + 1 < size) {
		throw new Error(
			'Insufficient values in range to create an array of that size.'
		);
	}

	const set = new Set(Array.from({ length: max - min + 1 }, (_, i) => i + min));
	const result: Array<number> = [];

	while (result.length < size) {
		const setSize = set.size;
		const randomIndex = Math.floor(Math.random() * setSize);
		const value = Array.from(set.values()).at(randomIndex);

		result.push(value);
		set.delete(value);
	}

	return result.sort((a, b) => a - b);
}

export const array = writable<Array<number>>(
	createRandomAscendingArrayOfDistinctValues()
);

const wrapProgress = gsap.utils.wrap(0, 1);

export const rotationAnimation = derived(
	[circleSvgReady, array],
	([$ready, $array]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$ready || !$array.length) {
			return timeline;
		}

		/**
		 * Path adjustment to move relative to top of the circle.
		 * Small amount added to prevent positioning errors on progress wrap.
		 */
		const pathAdjustmentAmount = 0.250000001;

		const leftBracketProgress = -0.245;
		const rightBracketProgress = -0.255;
		const stepSize = 1 / $array.length;
		const wrapIndex = gsap.utils.wrap(0, $array.length);
		const arrayItemProgress = $array.map((_, index) =>
			wrapProgress(stepSize * index - pathAdjustmentAmount + stepSize / 2)
		);

		const arrayItemTweens = $array.map((_, index) => {
			return gsap.to(`#array-item-${index}`, {
				motionPath: {
					path: '#circle',
					align: '#circle',
					alignOrigin: [0.5, 0.5],
					autoRotate: false,
					start: arrayItemProgress[wrapIndex(index)],
					end: 1 + arrayItemProgress[wrapIndex(index)],
				},
				duration: 1,
				ease: 'none',
			});
		});

		const leftBracketTween = gsap.to(`#array-bracket-left`, {
			motionPath: {
				path: '#circle',
				align: '#circle',
				alignOrigin: [0.5, 0.5],
				autoRotate: false,
				start: leftBracketProgress,
				end: leftBracketProgress,
			},
			duration: 1,
			ease: 'none',
		});

		const rightBracketTween = gsap.to(`#array-bracket-right`, {
			motionPath: {
				path: '#circle',
				align: '#circle',
				alignOrigin: [0.5, 0.5],
				autoRotate: false,
				start: rightBracketProgress,
				end: rightBracketProgress,
			},
			duration: 1,
			ease: 'none',
		});

		for (const tween of [
			leftBracketTween,
			rightBracketTween,
			...arrayItemTweens,
		]) {
			timeline.add(tween, 0);
		}

		// Run animation to position items accordingly.
		gsap.to(timeline, {
			progress: -1,
			duration: 1,
			ease: 'none',
			modifiers: {
				progress: wrapProgress,
			},
		});

		// Make ready elements visible
		gsap.to(['.array-item', '.array-bracket'], {
			opacity: 1,
			duration: 1,
			ease: 'none',
		});

		return timeline;
	}
);

export const rotationAnimationProgress = writable<number>(1);

export const rotatedBy = derived(
	[array, rotationAnimationProgress],
	([$array, $progress]) => {
		if (!$array) {
			return 0;
		}

		const wrapIndex = gsap.utils.wrap(0, $array.length);
		const result = wrapIndex(
			$array.length - Math.round($array.length * wrapProgress($progress))
		);

		return result;
	}
);

export const pivotIndex = derived(
	[array, rotatedBy],
	([$array, $rotatedBy]) => {
		if (!$array) {
			return 0;
		}

		if ($rotatedBy === 0) {
			return -1;
		}

		const result = $array.length - 1 - $rotatedBy;

		return result;
	}
);

export const rotatedArray = derived(
	[array, rotatedBy],
	([$array, $rotatedBy]) => {
		if (!$array) {
			return [];
		}

		const wrapIndex = gsap.utils.wrap(0, $array.length);
		const result = $array.map(
			(_, index, arr) => arr[wrapIndex(index + $rotatedBy)]
		);

		return result;
	}
);

function buildPivotSearchStates(rotatedArray: Array<number>) {
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

export const pivotSearchAnimationProgress = writable(-1);
export const pivotSearchAnimation = derived(
	[circleSvgReady, rotatedBy, array],
	([$circleSvgReady, $rotatedBy, $array]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady) {
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
		const searchStates = buildPivotSearchStates(rotatedArray);

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

			const highlightOutOfSearchRange = gsap.to(outOfRangeTargets, {
				fill: colors.outOfRange,
				duration: duration / 4,
			});

			tweensByStep[step].push(highlightOutOfSearchRange);

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

			if (resultIndex !== null) {
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
					pivotSearchAnimationProgress.set(step);
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

function buildTargetSearchStates(
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

export const target = writable<number>(null);
export const targetSearchAnimationProgress = writable(-1);
export const targetSearchAnimation = derived(
	[circleSvgReady, array, rotatedBy, pivotIndex, target],
	([$circleSvgReady, $array, $rotatedBy, $pivotIndex, $target]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady || $target === null) {
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
		const searchStates = buildTargetSearchStates(
			rotatedArray,
			$target,
			$pivotIndex
		);

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

			const highlightOutOfSearchRange = gsap.to(outOfRangeTargets, {
				fill: colors.outOfRange,
				duration: duration / 4,
			});

			tweensByStep[step].push(highlightOutOfSearchRange);

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

			if (resultIndex !== null) {
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
					targetSearchAnimationProgress.set(step);
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

function buildModifiedTargetSearchStates(nums: Array<number>, target: number) {
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
			} else {
				if (target <= nums[high] && target > nums[mid]) {
					low = mid + 1;
				} else {
					high = mid - 1;
				}
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

export const modifiedTarget = writable<number>(null);
export const modifiedTargetSearchAnimationProgress = writable(-1);
export const modifiedTargetSearchAnimation = derived(
	[circleSvgReady, array, rotatedBy, modifiedTarget],
	([$circleSvgReady, $array, $rotatedBy, $target]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady || $target === null) {
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
		const searchStates = buildModifiedTargetSearchStates(rotatedArray, $target);

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

			const highlightOutOfSearchRange = gsap.to(outOfRangeTargets, {
				fill: colors.outOfRange,
				duration: duration / 4,
			});

			tweensByStep[step].push(highlightOutOfSearchRange);

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

			if (resultIndex !== null) {
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
					modifiedTargetSearchAnimationProgress.set(step);
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
