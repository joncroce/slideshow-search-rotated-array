import { gsap } from 'gsap';
import { derived, writable } from 'svelte/store';
import { circleSvgReady } from './circle';

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

export const wrapProgress = gsap.utils.wrap(0, 1);

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
	type PivotSearchResultConditionMet =
		| 'HIGH_LESS_THAN_LOW'
		| 'HIGH_EQUAL_TO_LOW'
		| 'VALUE_AT_MID_LESS_THAN_VALUE_BEFORE'
		| 'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER';

	type PivotSearchState = {
		resultIndex: number | null;
		resultCondition: PivotSearchResultConditionMet | null;
		lowIndex: number;
		midIndex: number | null;
		highIndex: number;
	};

	const states: Array<PivotSearchState> = [];

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
				lowIndex: null,
				midIndex: null,
				highIndex: null,
			});

			return -1;
		}

		if (high === low) {
			states.push({
				resultIndex: low,
				resultCondition: 'HIGH_EQUAL_TO_LOW',
				lowIndex: null,
				midIndex: null,
				highIndex: null,
			});

			return low;
		}

		const mid = low + Math.floor((high - low) / 2);

		if (mid > low && nums[mid - 1] > nums[mid]) {
			states.push({
				resultIndex: mid - 1,
				resultCondition: 'VALUE_AT_MID_LESS_THAN_VALUE_BEFORE',
				lowIndex: low,
				midIndex: mid,
				highIndex: high,
			});

			return mid - 1;
		}

		if (mid < high && nums[mid] > nums[mid + 1]) {
			states.push({
				resultIndex: mid,
				resultCondition: 'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER',
				lowIndex: low,
				midIndex: mid,
				highIndex: high,
			});

			return mid;
		}

		states.push({
			resultIndex: null,
			resultCondition: null,
			lowIndex: low,
			midIndex: mid,
			highIndex: high,
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

		const colors = {
			searchRange: '#38BDF8', // tw light-blue-400
			result: '#22C55E', // tw green-500
			mid: '#E879F9', // tw-fuschia-400
			outOfRange: '#CCCCCC',
		};

		const duration = 0.5;

		searchStates.forEach((state, step) => {
			const searchRangeIndices = Array.from(
				{ length: state.highIndex - state.lowIndex + 1 },
				(_, index) => wrapIndex(state.lowIndex + index + $rotatedBy)
			);

			const midIndex =
				state.midIndex !== null ? wrapIndex(state.midIndex + $rotatedBy) : null;

			const resultIndex =
				state.resultIndex !== null
					? wrapIndex(state.resultIndex + $rotatedBy)
					: null;

			const outOfRangeTargets = Array.from({ length: arraySize }, (_, index) =>
				wrapIndex(index - $rotatedBy)
			)
				.filter(
					(index) =>
						index !== resultIndex &&
						index !== midIndex &&
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
					.filter((index) => index !== midIndex && index !== resultIndex)
					.map((index) => `${targetPrefix}${index}`);

				const highlightSearchRange = gsap.to(targets, {
					fill: colors.searchRange,
					duration,
				});

				tweensByStep[step].push(highlightSearchRange);

				const highlightMid = gsap.to(`${targetPrefix}${midIndex}`, {
					fill: colors.mid,
					duration,
				});

				tweensByStep[step].push(highlightMid);
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
