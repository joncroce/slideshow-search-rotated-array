<script lang="ts">
	import { gsap } from 'gsap';
	import {
		Presentation,
		Slide,
		Step,
		Code,
		CircleArray,
		Button,
		NumberInput,
		IconWarning,
		TooltipDefinition,
		IconReturn,
		SearchAnimationSlide,
	} from '@components';
	import { navigation } from '@stores/navigation';
	import { array, arrayWithDuplicates } from '@stores/array';
	import {
		rotatedBy,
		rotatedArray,
		rotationAnimation,
		rotationAnimationProgress,
	} from '@stores/rotation';
	import {
		pivotIndex,
		findPivotAnimation,
		findPivotAnimationProgress,
		findPivitAnimationIsActive,
	} from '@stores/findPivot';
	import {
		targetWithPivot,
		findTargetWithPivotAnimation,
		findTargetWithPivotAnimationProgress,
		findTargetWithPivotAnimationIsActive,
	} from '@stores/findTargetWithPivot';
	import {
		target,
		findTargetAnimation,
		findTargetAnimationProgress,
		findTargetAnimationIsActive,
	} from '@stores/findTarget';
	import {
		targetWhereDuplicates,
		findTargetWhereDuplicatesAnimation,
		findTargetWhereDuplicatesAnimationProgress,
		findTargetWhereDuplicatesAnimationIsActive,
	} from '@stores/findTargetWhereDuplicates';
	import {
		printArray,
		removeArrayItemHighlighting,
		wrapIndex,
		wrapProgress,
	} from '@utils';
	import { ARRAY_SIZE, STEP_SIZE } from '@constants';
	import type { BinarySearchState, SearchAnimationName } from '@types';

	const ROTATION_SLIDE_INDEX = 2;
	const FIND_PIVOT_SLIDE_INDEX = 5;
	const FIND_TARGET_WITH_PIVOT_SLIDE_INDEX = 8;
	const FIND_TARGET_SLIDE_INDEX = 11;
	const FIND_TARGET_WHERE_DUPLICATES_SLIDE_INDEX = 15;
	const SVG_CIRCLE_VISIBLE_SLIDES = new Set([
		ROTATION_SLIDE_INDEX,
		FIND_PIVOT_SLIDE_INDEX,
		FIND_TARGET_WITH_PIVOT_SLIDE_INDEX,
		FIND_TARGET_SLIDE_INDEX,
		FIND_TARGET_WHERE_DUPLICATES_SLIDE_INDEX,
	]);
	$: svgCircleVisible = SVG_CIRCLE_VISIBLE_SLIDES.has($navigation.currentSlide);

	const exampleRotateBy = Math.floor(ARRAY_SIZE / 2);
	const examplePivotIndex = ARRAY_SIZE - 1 - exampleRotateBy;
	$: exampleRotatedArray = $array.map(
		(_, index, arr) => arr[wrapIndex(index + exampleRotateBy)]
	);

	$: useArrayWithDuplicates =
		$navigation.currentSlide === FIND_TARGET_WHERE_DUPLICATES_SLIDE_INDEX;

	let rotateBy = 1;
	let rotating: boolean = false;

	function rotate() {
		if ($rotationAnimation) {
			rotating = true;

			gsap.to($rotationAnimation, {
				progress: $rotationAnimation.progress() - rotateBy * STEP_SIZE,
				duration: STEP_SIZE * rotateBy,
				ease: 'none',
				modifiers: {
					progress: wrapProgress,
				},
				onComplete: () => {
					$rotationAnimationProgress = $rotationAnimation.progress();
					rotating = false;
				},
			});
		}
	}

	let returnToSlide: number | null = null;
	function updateReturnToSlide() {
		returnToSlide = $navigation.currentSlide;
	}

	let showAnimationProgressByName: Record<SearchAnimationName, boolean>;
	$: showAnimationProgressByName = {
		FIND_PIVOT: $navigation.currentSlide === FIND_PIVOT_SLIDE_INDEX,
		FIND_TARGET_WITH_PIVOT:
			$navigation.currentSlide === FIND_TARGET_WITH_PIVOT_SLIDE_INDEX,
		FIND_TARGET: $navigation.currentSlide === FIND_TARGET_SLIDE_INDEX,
		FIND_TARGET_WHERE_DUPLICATES:
			$navigation.currentSlide === FIND_TARGET_WHERE_DUPLICATES_SLIDE_INDEX,
	};

	let searchAnimationByName: Record<
		SearchAnimationName,
		{
			timeline: gsap.core.Timeline;
			searchStates:
				| Array<BinarySearchState['PIVOT']>
				| Array<BinarySearchState['TARGET']>;
		}
	>;
	$: searchAnimationByName = {
		FIND_PIVOT: $findPivotAnimation,
		FIND_TARGET_WITH_PIVOT: $findTargetWithPivotAnimation,
		FIND_TARGET: $findTargetAnimation,
		FIND_TARGET_WHERE_DUPLICATES: $findTargetWhereDuplicatesAnimation,
	};

	let searchAnimationProgressByName: Record<SearchAnimationName, number>;
	$: searchAnimationProgressByName = {
		FIND_PIVOT: $findPivotAnimationProgress,
		FIND_TARGET_WITH_PIVOT: $findTargetWithPivotAnimationProgress,
		FIND_TARGET: $findTargetAnimationProgress,
		FIND_TARGET_WHERE_DUPLICATES: $findTargetWhereDuplicatesAnimationProgress,
	};

	let searchAnimationTargetByName: Record<SearchAnimationName, number | null>;
	$: searchAnimationTargetByName = {
		FIND_PIVOT: null,
		FIND_TARGET_WITH_PIVOT: $targetWithPivot,
		FIND_TARGET: $target,
		FIND_TARGET_WHERE_DUPLICATES: $targetWhereDuplicates,
	};

	const searchAnimationTargetUserInputs: Record<
		SearchAnimationName,
		number | null
	> = {
		FIND_PIVOT: null,
		FIND_TARGET_WITH_PIVOT: 0,
		FIND_TARGET: 0,
		FIND_TARGET_WHERE_DUPLICATES: 0,
	};

	let searchAnimationTargetIsStaleByName: Record<
		SearchAnimationName,
		boolean | null
	> = {
		FIND_PIVOT: null,
		FIND_TARGET_WITH_PIVOT: true,
		FIND_TARGET: true,
		FIND_TARGET_WHERE_DUPLICATES: true,
	};

	let searchAnimationReadyByName: Record<SearchAnimationName, boolean>;
	$: searchAnimationReadyByName = {
		FIND_PIVOT: $findPivotAnimation.searchStates.length > 0,
		FIND_TARGET_WITH_PIVOT:
			$findTargetWithPivotAnimation.searchStates.length > 0,
		FIND_TARGET: $findTargetAnimation.searchStates.length > 0,
		FIND_TARGET_WHERE_DUPLICATES:
			$findTargetWhereDuplicatesAnimation.searchStates.length > 0,
	};

	let searchAnimationActiveByName: Record<SearchAnimationName, boolean>;
	$: searchAnimationActiveByName = {
		FIND_PIVOT: $findPivitAnimationIsActive,
		FIND_TARGET_WITH_PIVOT: $findTargetWithPivotAnimationIsActive,
		FIND_TARGET: $findTargetAnimationIsActive,
		FIND_TARGET_WHERE_DUPLICATES: $findTargetWhereDuplicatesAnimationIsActive,
	};

	function updateTargetIsStale(
		animationName: SearchAnimationName,
		userInput: number
	) {
		searchAnimationTargetIsStaleByName[animationName] =
			searchAnimationTargetByName[animationName] !== userInput;
		searchAnimationTargetUserInputs[animationName] = userInput;
	}

	function updateSearchTarget(animationName: SearchAnimationName) {
		const updateValue = searchAnimationTargetUserInputs[animationName];

		switch (animationName) {
			case 'FIND_TARGET_WITH_PIVOT':
				$targetWithPivot = updateValue;
				break;
			case 'FIND_TARGET':
				$target = updateValue;
				break;
			case 'FIND_TARGET_WHERE_DUPLICATES':
				$targetWhereDuplicates = updateValue;
				break;
			default:
				return;
		}
	}

	function resetSearchAnimationProgress(animationName: SearchAnimationName) {
		switch (animationName) {
			case 'FIND_PIVOT':
				$findPivotAnimationProgress = -1;
				break;
			case 'FIND_TARGET_WITH_PIVOT':
				$findTargetWithPivotAnimationProgress = -1;
				break;
			case 'FIND_TARGET':
				$findTargetAnimationProgress = -1;
				break;
			case 'FIND_TARGET_WHERE_DUPLICATES':
				$findTargetWhereDuplicatesAnimationProgress = -1;
				break;
			default:
				return;
		}
	}

	function playSearchAnimation(animationName: SearchAnimationName) {
		let animation: {
			timeline: gsap.core.Timeline;
			searchStates:
				| Array<BinarySearchState['PIVOT']>
				| Array<BinarySearchState['TARGET']>;
		};
		let progress: number;

		switch (animationName) {
			case 'FIND_PIVOT':
				animation = $findPivotAnimation;
				progress = $findPivotAnimationProgress;
				break;
			case 'FIND_TARGET_WITH_PIVOT':
				animation = $findTargetWithPivotAnimation;
				progress = $findTargetWithPivotAnimationProgress;
				break;
			case 'FIND_TARGET':
				animation = $findTargetAnimation;
				progress = $findTargetAnimationProgress;
				break;
			case 'FIND_TARGET_WHERE_DUPLICATES':
				animation = $findTargetWhereDuplicatesAnimation;
				progress = $findTargetWhereDuplicatesAnimationProgress;
				break;
			default:
				return;
		}

		if (animation) {
			const { timeline, searchStates } = animation;

			timeline.play(
				progress === searchStates.length - 1 ? 0 : String(progress + 1)
			);
		}
	}

	function pauseSearchAnimation(animationName: SearchAnimationName) {
		const { timeline } = searchAnimationByName[animationName];

		timeline.pause();

		switch (animationName) {
			case 'FIND_PIVOT':
				$findPivitAnimationIsActive = false;
				break;
			case 'FIND_TARGET_WITH_PIVOT':
				$findTargetWithPivotAnimationIsActive = false;
				break;
			case 'FIND_TARGET':
				$findTargetAnimationIsActive = false;
				break;
			case 'FIND_TARGET_WHERE_DUPLICATES':
				$findTargetWhereDuplicatesAnimationIsActive = false;
				break;
			default:
				return;
		}
	}

	function seekSearchAnimation(
		animationName: SearchAnimationName,
		searchStateIndex: number
	) {
		const { timeline } = searchAnimationByName[animationName];

		timeline.pause();
		timeline.seek(String(searchStateIndex + 1));

		switch (animationName) {
			case 'FIND_PIVOT':
				$findPivotAnimationProgress = searchStateIndex;
				break;
			case 'FIND_TARGET_WITH_PIVOT':
				$findTargetWithPivotAnimationProgress = searchStateIndex;
				break;
			case 'FIND_TARGET':
				$findTargetAnimationProgress = searchStateIndex;
				break;
			case 'FIND_TARGET_WHERE_DUPLICATES':
				$findTargetWhereDuplicatesAnimationProgress = searchStateIndex;
				break;
			default:
				return;
		}
	}

	async function updateSearchAnimation(animationName: SearchAnimationName) {
		showAnimationProgressByName[animationName] = false;
		updateSearchTarget(animationName);
		searchAnimationTargetIsStaleByName[animationName] = false;
		removeArrayItemHighlighting();
		resetSearchAnimationProgress(animationName);
		showAnimationProgressByName[animationName] = true;
	}
</script>

<Presentation>
	<!-- Positioned absolutely and hidden by default -->
	<CircleArray
		array={useArrayWithDuplicates ? $arrayWithDuplicates : $array}
		visible={svgCircleVisible}
	/>
	{@const viewingRotationSlide =
		$navigation.currentSlide === ROTATION_SLIDE_INDEX}
	<div
		class="jump-navigate absolute isolate h-[36px] top-[12%] left-0 w-1/3 grid justify-center items-stretch"
		style="z-index: 101;"
		data-visible={svgCircleVisible &&
			(!viewingRotationSlide || returnToSlide !== null)}
	>
		<Button
			style="pointer-events: all; z-index: 1;"
			size="small"
			kind="tertiary"
			icon={IconReturn}
			href="#/{viewingRotationSlide ? returnToSlide : ROTATION_SLIDE_INDEX}"
			>Return to {viewingRotationSlide ? 'Search' : 'Rotation'}</Button
		>
	</div>

	<!-- 0 -->
	<Slide>
		<h2 class="text-4xl font-bold">Search Rotated Sorted Array</h2>
	</Slide>

	<!-- 1 -->
	<Slide animate>
		<div class="grid gap-6 text-3xl">
			<h2 class="text-orange-500 text-4xl font-bold">
				What is a "Rotated" Array?
			</h2>
			<div class="grid gap-4">
				<Step>
					<p class="text-2xl">
						Here is an array of <span class="font-semibold text-indigo-500"
							>distinct</span
						> numbers sorted in ascending order:
					</p>
					<p class="m-2 text-xl font-mono text-blue-300">
						{printArray($array)}
					</p>
				</Step>
				<Step>
					<p class="text-2xl">
						Here is the same array <span class="font-semibold text-amber-400"
							>rotated</span
						>:
					</p>
					<p class="m-2 text-xl font-mono text-blue-300">
						{@html printArray(exampleRotatedArray, [examplePivotIndex])}
					</p>
				</Step>
				<Step>
					<p class="text-2xl">
						The pivot index is that which contains the <span
							class="text-violet-500 font-semibold">largest value</span
						> in a rotated ascending array.
					</p>
					<p class="text-2xl">
						We would say the <span class="text-green-500 font-semibold"
							>pivot</span
						>
						is at index
						<span class="font-mono">{examplePivotIndex}</span>
						(with a value of
						<span class="font-mono text-green-500"
							>{exampleRotatedArray[examplePivotIndex]}</span
						>).
					</p>
				</Step>
			</div>
		</div>
	</Slide>

	<!-- 2 -->
	<Slide
		animate
		on:out={() => {
			returnToSlide = null;
			$rotationAnimationProgress = $rotationAnimation.progress();
		}}
		style="height: 100%;"
	>
		<div class="rotate-wrapper">
			<div>
				<h2 class="text-orange-500 text-4xl font-bold">
					Choose Rotation Amount
				</h2>
			</div>
			<div>
				<table class="text-2xl">
					<thead>
						<tr>
							<th>Rotated By</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td
								class="font-semibold text-amber-400"
								style="text-align: center;">{$rotatedBy}</td
							>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="rotate">
				<Button
					kind="secondary"
					size="field"
					disabled={rotating}
					on:click={() => rotate()}>Rotate</Button
				>
				<span class="text-sm font-sans self-center">by</span>
				<NumberInput
					label="Rotate by"
					hideLabel
					bind:value={rotateBy}
					min={1}
					max={$array.length - 1}
				/>
			</div>
		</div>
	</Slide>

	<!-- 3 -->
	<Slide animate>
		<div class="grid gap-6">
			<h2 class="text-orange-500 text-4xl font-bold">
				Finding the Pivot Index
			</h2>
			<div class="grid gap-4">
				{#if $pivotIndex === -1}
					<div
						class="mx-auto mt-2 p-2 grid place-items-center border-dotted border-2 border-red-200"
					>
						<h3
							class="inline-flex justify-center items-center text-2xl font-bold"
						>
							<IconWarning size={24} class="text-yellow-500" /><span
								class="px-2 text-red-500">No Array Rotation Detected</span
							><IconWarning size={24} class="text-yellow-500" />
						</h3>
					</div>
					<p class="mb-2 text-lg">
						<a
							href="#/{$navigation.currentSlide - 1}"
							class="underline underline-blue-gray-300 underline-offset-2"
							>Go back</a
						>
						and
						<span class="font-semibold text-amber-400">rotate</span> the array,
						or continue to see how
						<span class="font-semibold text-red-400">non-rotated</span> arrays are
						handled by the algorithm.
					</p>
					<h3 class="text-2xl">
						Here is our <span class="font-semibold text-red-400"
							>non-rotated</span
						> array:
					</h3>
				{:else}
					<h3 class="text-2xl">
						Here is our freshly <span class="font-semibold text-amber-400"
							>rotated</span
						> array:
					</h3>
				{/if}
				<p class="text-xl font-mono text-blue-300">
					{printArray($rotatedArray)}
				</p>
				<Step>
					<p class="my-4 text-xl">
						One approach to finding a <span class="font-semibold text-rose-500"
							>target</span
						>
						value is to first locate the position of the
						<span class="font-semibold text-green-500">pivot</span>.
					</p>
				</Step>
				<Step>
					<h3 class="text-2xl">
						How can we go about finding the <span
							class="font-semibold text-green-500">pivot</span
						>?
					</h3>
					<p class="my-4 text-xl">
						We can slowly iterate over the values one at a time until we find
						the index of the <span class="font-semibold text-violet-500"
							>largest</span
						> value...
					</p>
					<p class="text-5xl">🐌</p>
				</Step>
				<Step>
					<p class="my-4 text-xl">
						...or we can go fast using a <TooltipDefinition
							direction="top"
							align="start"
							tooltipText="A process where a function calls itself."
						>
							<span
								class="text-xl font-semibold text-blue-200 hover:text-blue-500"
								>recursive</span
							></TooltipDefinition
						>
						<TooltipDefinition
							direction="top"
							align="start"
							tooltipText="A search algorithm that reduces the search space by half at each iteration."
							><span
								class="text-xl font-semibold text-blue-200 hover:text-blue-500"
								>binary search</span
							></TooltipDefinition
						>!
					</p>
					<p class="text-5xl">🐇</p>
				</Step>
			</div>
		</div>
	</Slide>

	<!-- 4 -->
	<Slide animate>
		<h2 class="my-6 text-orange-500 text-4xl font-bold">
			Binary Search for Pivot Index
		</h2>
		<Code
			lang="javascript"
			style="transform-origin: 50% 0%;"
			class="scale-[0.8]"
		>
			{`
				function findPivot(nums, low,	high) {
					if (high === low)
						return low;

					if (high < low)
						return -1;

					const mid = low + Math.floor((high - low) / 2);

					if (mid > low && nums[mid - 1] > nums[mid])
						return mid - 1;

					if (mid < high && nums[mid] > nums[mid + 1])
						return mid;

					return nums[low] >= nums[mid]
						? findPivot(nums, low, mid - 1)
						: findPivot(nums, mid + 1, high);
				}
				`}
		</Code>
	</Slide>

	<!-- 5 -->
	<SearchAnimationSlide
		animation={searchAnimationByName['FIND_PIVOT']}
		animationName="FIND_PIVOT"
		animationProgress={searchAnimationProgressByName['FIND_PIVOT']}
		animationReady={searchAnimationReadyByName['FIND_PIVOT']}
		animationActive={searchAnimationActiveByName['FIND_PIVOT']}
		searchState={searchAnimationByName['FIND_PIVOT'].searchStates[
			searchAnimationProgressByName['FIND_PIVOT']
		]}
		userInput={searchAnimationTargetUserInputs['FIND_PIVOT']}
		targetIsStale={searchAnimationTargetIsStaleByName['FIND_PIVOT']}
		showAnimationProgress={showAnimationProgressByName['FIND_PIVOT']}
		{updateTargetIsStale}
		{updateSearchAnimation}
		{playSearchAnimation}
		{pauseSearchAnimation}
		{seekSearchAnimation}
		{resetSearchAnimationProgress}
		{updateReturnToSlide}
	>
		<h2 class="text-orange-500 text-4xl font-bold">
			Binary Search for Pivot Index
		</h2>
	</SearchAnimationSlide>

	<!-- 6 -->
	<Slide animate>
		<div class="grid gap-4">
			{#if $pivotIndex === -1}
				<p class="text-2xl">
					Now that we've detected no <span class="text-green-500 font-semibold"
						>pivot</span
					>, and know that we're dealing with a
					<span class="font-semibold text-red-400">non-rotated</span>
					array, we'd like to find a
					<span class="text-fuchsia-500 font-semibold">target</span> value in the
					array.
				</p>
				<p class="my-6 text-xl font-mono text-blue-300">
					{@html printArray($array)}
				</p>
				<p class="text-2xl">
					Once again we can use recursive binary search to accomplish this...
				</p>
				<p class="my-6 text-5xl">🐇</p>
			{:else}
				<p class="text-2xl">
					Now that we've located the <span class="text-green-500 font-semibold"
						>pivot</span
					>
					index in our rotated sorted array, we'd like to find a
					<span class="text-fuchsia-500 font-semibold">target</span> value in the
					array.
				</p>
				<p class="my-6 text-xl font-mono text-blue-300">
					{@html printArray($rotatedArray, [$pivotIndex])}
				</p>
				<p class="text-2xl">
					Once again we can use recursive binary search to accomplish this...
				</p>
				<p class="my-6 text-5xl">🐇</p>
				<p class="text-2xl">
					...but the wise thing is to take advantage of our knowledge of the <span
						class="text-green-500 font-semibold">pivot</span
					> location to first check whether:
				</p>
				<ul
					class="mx-auto text-xl text-left list-disc list-inside marker:text-blue-300"
				>
					<li>
						the <span class="text-fuchsia-500 font-semibold">target</span> value
						is
						<span class="font-semibold">at</span>
						the <span class="text-green-500 font-semibold">pivot</span>;
					</li>
					<li>
						the <span class="text-fuchsia-500 font-semibold">target</span> value
						is
						<span class="font-semibold">greater than</span> the value
						<span class="font-semibold">at</span>
						the
						<span class="text-green-500 font-semibold">pivot</span>;
					</li>
					<li>
						the <span class="text-fuchsia-500 font-semibold">target</span> value
						is
						<span class="font-semibold">less than</span> the value
						<span class="font-semibold">immediately after</span>
						the
						<span class="text-green-500 font-semibold">pivot</span>.
					</li>
				</ul>
				<p class="my-6 text-5xl">🦉</p>
			{/if}
		</div>
	</Slide>

	<!-- 7 -->
	<Slide animate>
		<h2 class="my-6 text-orange-500 text-4xl font-bold">
			Binary Search for Target Value with Pivot
		</h2>
		<Code
			lang="javascript"
			style="transform-origin: 50% 0%;"
			class="scale-[0.65]"
		>
			{`
				function search(nums, target) {
					const pivot = findPivot(nums);
					
					if (pivot === -1)	
						return binarySearch(nums, target, 0, nums.length - 1);
					if (nums[pivot] === target)	return pivot;
					if (nums[pivot] < target) return -1;
					if (nums[pivot + 1] > target) return -1;
					
					return nums[0] <= target
						? binarySearch(nums, target, 0, pivot - 1)
						: binarySearch(nums, target, pivot + 1, nums.length - 1);
				}

				function binarySearch(nums,	target,	low, high) {
					if (high < low) return -1;

					const mid = low + Math.floor((high - low) / 2);

					if (nums[mid] === target)	return mid;

					return nums[mid] < target
						? binarySearch(nums, target, mid + 1, high)
						: binarySearch(nums, target, low, mid - 1);
				}
			`}
		</Code>
	</Slide>

	<!-- 8 -->
	<SearchAnimationSlide
		animation={searchAnimationByName['FIND_TARGET_WITH_PIVOT']}
		animationName="FIND_TARGET_WITH_PIVOT"
		animationProgress={searchAnimationProgressByName['FIND_TARGET_WITH_PIVOT']}
		animationReady={searchAnimationReadyByName['FIND_TARGET_WITH_PIVOT']}
		animationActive={searchAnimationActiveByName['FIND_TARGET_WITH_PIVOT']}
		searchState={searchAnimationByName['FIND_TARGET_WITH_PIVOT'].searchStates[
			searchAnimationProgressByName['FIND_TARGET_WITH_PIVOT']
		]}
		userInput={searchAnimationTargetUserInputs['FIND_TARGET_WITH_PIVOT']}
		targetIsStale={searchAnimationTargetIsStaleByName['FIND_TARGET_WITH_PIVOT']}
		showAnimationProgress={showAnimationProgressByName[
			'FIND_TARGET_WITH_PIVOT'
		]}
		{updateTargetIsStale}
		{updateSearchAnimation}
		{playSearchAnimation}
		{pauseSearchAnimation}
		{seekSearchAnimation}
		{resetSearchAnimationProgress}
		{updateReturnToSlide}
	>
		<h2 class="text-orange-500 text-4xl font-bold">
			Binary Search for Target Value with Pivot
		</h2>
	</SearchAnimationSlide>

	<!-- 9 -->
	<Slide animate>
		<div class="grid gap-4">
			<p class="text-2xl">
				We've now seen how to find a <span class="text-rose-500 font-semibold"
					>target value</span
				>
				in a rotated sorted array by first locating the
				<span class="text-green-500 font-semibold">pivot</span>.
			</p>
			<p class="text-2xl">
				It's actually possible to avoid this <span
					class="text-green-500 font-semibold">pivot</span
				>
				finding step though, and we can still take advantage of binary search to
				find a
				<span class="text-rose-500 font-semibold">target value</span> in our rotated
				array.
			</p>
			<p class="text-2xl">
				Let's take a look at a <span class="text-teal-400"
					>modified binary search</span
				>.
			</p>
			<p class="text-2xl">
				This time we'll see an <span class="text-orange-400 font-semibold"
					>iterative</span
				>
				version—though it's still entirely possible to use
				<span class="text-orange-400 font-semibold">recursion</span> if you prefer.
			</p>
		</div>
	</Slide>

	<!-- 10 -->
	<Slide animate>
		<h2 class="my-6 text-orange-500 text-4xl font-bold">
			Binary Search for Target Value
		</h2>
		<Code
			lang="javascript"
			style="transform-origin: 50% 0%;"
			class="scale-[0.8]"
			>{`
			function modifiedBinarySearch(nums, target) {
				let low = 0, high = nums.length - 1, mid;

				while (low <= high) {
					mid = low + Math.floor((high - low) / 2);
					if (nums[mid] === target)	return mid;
					else if (nums[mid] >= nums[low]) {
						if (target >= nums[low] && target < nums[mid])
							high = mid - 1;
						else
							low = mid + 1;
					} else {
						if (target <= nums[high] && target > nums[mid])
							low = mid + 1;
						else
							high = mid - 1;
					}
				}
				return -1;
			}
		`}
		</Code>
	</Slide>

	<!-- 11 -->
	<SearchAnimationSlide
		animation={searchAnimationByName['FIND_TARGET']}
		animationName="FIND_TARGET"
		animationProgress={searchAnimationProgressByName['FIND_TARGET']}
		animationReady={searchAnimationReadyByName['FIND_TARGET']}
		animationActive={searchAnimationActiveByName['FIND_TARGET']}
		searchState={searchAnimationByName['FIND_TARGET'].searchStates[
			searchAnimationProgressByName['FIND_TARGET']
		]}
		userInput={searchAnimationTargetUserInputs['FIND_TARGET']}
		targetIsStale={searchAnimationTargetIsStaleByName['FIND_TARGET']}
		showAnimationProgress={showAnimationProgressByName['FIND_TARGET']}
		{updateTargetIsStale}
		{updateSearchAnimation}
		{playSearchAnimation}
		{pauseSearchAnimation}
		{seekSearchAnimation}
		{resetSearchAnimationProgress}
		{updateReturnToSlide}
	>
		<h2 class="text-orange-500 text-4xl font-bold">
			Binary Search for Target Value
		</h2>
	</SearchAnimationSlide>

	<!-- 12 -->
	<Slide animate>
		<h2 class="my-6 text-orange-500 text-4xl font-bold">
			Dealing with Duplicates
		</h2>
		<div class="grid gap-4">
			<p class="text-2xl">
				So far we've been working with an array of <span
					class="font-semibold text-indigo-500">distinct</span
				> numbers.
			</p>
			<p class="text-2xl">
				What would it take to adapt our modified binary search to find a <span
					class="text-rose-500 font-semibold">target</span
				>
				value in an array that possibly contains
				<span class="font-semibold text-fuchsia-500">duplicate</span> numbers?
			</p>
			<p class="text-2xl">
				As it turns out, we only need to check for one more condition in our
				code...
			</p>
		</div>
	</Slide>

	<!-- 13 -->
	<Slide animate>
		<div class="my-6">
			<h2 class="text-orange-500 text-3xl font-bold">
				Binary Search for Target Value
			</h2>
			<h3 class="text-orange-400 text-2xl font-semibold">
				Adapted for Arrays of Non-Distinct Values
			</h3>
		</div>
		<Code
			lang="javascript"
			lines="7,12,17-19"
			style="transform-origin: 50% 0%;"
			class="scale-[0.7]"
			>{`
			function modifiedBinarySearch(nums, target) {
				let low = 0, high = nums.length - 1, mid;

				while (low <= high) {
					mid = low + Math.floor((high - low) / 2);
					if (nums[mid] === target)	return mid;
					else if (nums[mid] > nums[low]) { // now more specific
						if (target >= nums[low] && target < nums[mid])
							high = mid - 1;
						else
							low = mid + 1;
					} else if (nums[mid] < nums[low]) { // now more specific
						if (target <= nums[high] && target > nums[mid])
							low = mid + 1;
						else
							high = mid - 1;
					} else { // new condition for nums[mid] === nums[low]
						low += 1;
					}
				}
				return -1;
			}
		`}
		</Code>
	</Slide>

	<!-- 14 -->
	<Slide animate>
		<div class="grid gap-4">
			<p class="text-2xl">
				Now that we have a way to perform binary search on arrays of <span
					class="font-semibold text-fuchsia-500">non-distinct</span
				>
				numbers, let's take our previous array and create a version that contains
				<span class="font-semibold text-fuchsia-500">duplicates</span>:
			</p>
			<p class="my-6 text-xl font-mono text-blue-300">
				{@html printArray($arrayWithDuplicates)}
			</p>
			{#if $pivotIndex === -1}
				<p class="text-2xl">
					Note that the array's <span class="font-semibold text-red-400"
						>non-rotation</span
					> status has been preserved.
				</p>
			{:else}
				<p class="text-2xl">
					Note that the array's <span class="font-semibold text-amber-400"
						>rotation</span
					> status has been preserved.
				</p>
			{/if}
		</div>
	</Slide>

	<!-- 15 -->
	<SearchAnimationSlide
		animation={searchAnimationByName['FIND_TARGET_WHERE_DUPLICATES']}
		animationName="FIND_TARGET_WHERE_DUPLICATES"
		animationProgress={searchAnimationProgressByName[
			'FIND_TARGET_WHERE_DUPLICATES'
		]}
		animationReady={searchAnimationReadyByName['FIND_TARGET_WHERE_DUPLICATES']}
		animationActive={searchAnimationActiveByName[
			'FIND_TARGET_WHERE_DUPLICATES'
		]}
		searchState={searchAnimationByName['FIND_TARGET_WHERE_DUPLICATES']
			.searchStates[
			searchAnimationProgressByName['FIND_TARGET_WHERE_DUPLICATES']
		]}
		userInput={searchAnimationTargetUserInputs['FIND_TARGET_WHERE_DUPLICATES']}
		targetIsStale={searchAnimationTargetIsStaleByName[
			'FIND_TARGET_WHERE_DUPLICATES'
		]}
		showAnimationProgress={showAnimationProgressByName[
			'FIND_TARGET_WHERE_DUPLICATES'
		]}
		{updateTargetIsStale}
		{updateSearchAnimation}
		{playSearchAnimation}
		{pauseSearchAnimation}
		{seekSearchAnimation}
		{resetSearchAnimationProgress}
		{updateReturnToSlide}
	>
		<h2 class="text-orange-500 text-3xl font-bold">
			Binary Search for Target Value
		</h2>
		<h3 class="text-orange-400 text-2xl font-semibold">
			Adapted for Arrays of Non-Distinct Values
		</h3>
	</SearchAnimationSlide>
</Presentation>

<style lang="postcss">
	.jump-navigate[data-visible='false'] {
		opacity: 0;
		transition: opacity 0s none;
	}
	.jump-navigate[data-visible='true'] {
		opacity: 0.8;
		transition: opacity 0.5s ease;
		transition-delay: 0.5s;
	}

	.rotate-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 7fr 2fr;
	}
	.rotate-wrapper div:nth-child(1) {
		place-self: start center;
	}
	.rotate-wrapper div:nth-child(2) {
		place-self: center center;
	}
	.rotate-wrapper div:nth-child(3) {
		place-self: end center;
	}

	.rotate {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: flex-end;
	}
</style>
