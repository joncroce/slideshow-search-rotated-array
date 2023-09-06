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

export const arraySize = derived([array], ([$array]) => $array.length);

export const stepSize = derived([array], ([$array]) => {
	if (!$array) {
		return 0;
	}

	return 1 / $array.length;
});

// Small amount added to prevent positioning errors on progress wrap
const PATH_ADJUSTMENT_FACTOR = 0.250000001;

export const wrapProgress = gsap.utils.wrap(0, 1);
export const wrapIndex = derived([arraySize], ([$arraySize]) =>
	gsap.utils.wrap(0, $arraySize)
);

const leftBracketProgress = -0.245;
const rightBracketProgress = -0.255;
const arrayItemProgress = derived([array, stepSize], ([$array, $stepSize]) => {
	return $array.map((_, index) =>
		wrapProgress($stepSize * index - PATH_ADJUSTMENT_FACTOR + $stepSize / 2)
	);
});

const tweens = derived(
	[circleSvgReady, array, arrayItemProgress, wrapIndex],
	([$circleSvgReady, $array, $arrayItemProgress, $wrapIndex]) => {
		if (!$circleSvgReady || !$array || !$arrayItemProgress) {
			return null;
		}

		const arrayItemTweens = $array.map((_, index) => {
			return gsap.to(`#array-item-${index}`, {
				motionPath: {
					path: '#circle',
					align: '#circle',
					alignOrigin: [0.5, 0.5],
					autoRotate: false,
					start: $arrayItemProgress[$wrapIndex(index)],
					end: 1 + $arrayItemProgress[$wrapIndex(index)],
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

		return [leftBracketTween, rightBracketTween, ...arrayItemTweens];
	}
);

export const timeline = derived(
	[circleSvgReady, tweens],
	([$ready, $tweens]) => {
		if (!$ready || !$tweens) {
			return null;
		}

		const tl = gsap.timeline({ paused: true });

		for (const tween of $tweens) {
			tl.add(tween, 0);
		}

		// Run animation to position items accordingly.
		gsap.to(tl, {
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

		return tl;
	}
);

export const timelineProgress = writable<number>(1);

export const rotatedBy = derived(
	[array, timelineProgress, wrapIndex],
	([$array, $progress, $wrapIndex]) => {
		if (!$array) {
			return 0;
		}

		return $wrapIndex(
			$array.length - Math.round($array.length * wrapProgress($progress))
		);
	}
);

export const pivotIndex = derived(
	[array, rotatedBy],
	([$array, $rotatedBy]) => {
		if (!$array) {
			return 0;
		}

		return $array.length - 1 - $rotatedBy;
	}
);

export const rotatedArray = derived(
	[array, rotatedBy, wrapIndex],
	([$array, $rotatedBy, $wrapIndex]) => {
		if (!$array) {
			return [];
		}

		return $array.map((_, index, arr) => arr[$wrapIndex(index + $rotatedBy)]);
	}
);

export const rotatedArrayReady = writable(false);

export const pivotSearchStates = derived(
	[rotatedArrayReady, rotatedArray],
	([$rotatedArrayReady, $rotatedArray]) => {
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

		if (!$rotatedArrayReady) {
			return states;
		}

		findPivot($rotatedArray);

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
);

export const pivotSearchAnimationProgress = writable(-1);

export const pivotSearchAnimation = derived(
	[circleSvgReady, pivotSearchStates, rotatedBy, arraySize],
	([$circleSvgReady, $pivotSearchStates, $rotatedBy, $arraySize]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$circleSvgReady) {
			console.log('circle svg not ready');
			return timeline;
		}

		if (!$pivotSearchStates.length) {
			console.log('no pivot search states');
			return timeline;
		}

		const tweensByStep: Array<Array<gsap.core.Tween>> = Array.from(
			{ length: $pivotSearchStates.length },
			() => []
		);

		const wrapIndex = gsap.utils.wrap(0, $arraySize);

		const targetPrefix = '#array-item-';

		const colors = {
			searchRange: '#38BDF8', // tw light-blue-400
			result: '#22C55E', // tw green-500
			mid: '#E879F9', // tw-fuschia-400
			outOfRange: '#CCCCCC',
		};

		const duration = 0.5;

		$pivotSearchStates.forEach((state, step) => {
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

			const outOfRangeTargets = Array.from({ length: $arraySize }, (_, index) =>
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

		return timeline;
	}
);
