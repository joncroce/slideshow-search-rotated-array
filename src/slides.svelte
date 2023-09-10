<script lang="ts">
	import { gsap } from 'gsap';
	import {
		Presentation,
		Slide,
		Step,
		Code,
		CircleArray,
		AnimationProgress,
		SearchState,
		Button,
		NumberInput,
		IconPlay,
		IconSearch,
		IconWarning,
		TooltipDefinition,
		IconReturn,
	} from '@components';
	import { navigation } from '@stores/navigation';
	import {
		array,
		rotatedBy,
		rotatedArray,
		rotationAnimation,
		rotationAnimationProgress,
		pivotIndex,
		pivotSearchAnimation,
		pivotSearchAnimationProgress,
		target,
		targetSearchAnimation,
		targetSearchAnimationProgress,
		modifiedTarget,
		modifiedTargetSearchAnimation,
		modifiedTargetSearchAnimationProgress,
		arrayWithDuplicates,
		modifiedWithDuplicatesTarget,
		modifiedWithDuplicatesTargetSearchAnimation,
		modifiedWithDuplicatesTargetSearchAnimationProgress,
	} from '@stores/rotation';
	import colors from '@lib/colors';

	const ROTATION_SLIDE_INDEX = 4;
	const ARRAY_SEARCH_SLIDES = [7, 10, 13, 17];
	const SVG_CIRCLE_VISIBLE_SLIDES = new Set([
		ROTATION_SLIDE_INDEX,
		...ARRAY_SEARCH_SLIDES,
	]);
	$: svgCircleVisible = SVG_CIRCLE_VISIBLE_SLIDES.has($navigation.currentSlide);

	let returnToSlide: number | null = null;

	function printArray(
		array: Array<number>,
		highlightIndices: Array<number> = []
	): string {
		const highlightColor = colors.highlight;

		return array.reduce((result: string, value: number, index: number) => {
			if (highlightIndices.includes(index)) {
				result += `<span style="color: ${highlightColor};">${value}</span>`;
			} else {
				result += value;
			}

			if (index < array.length - 1) {
				result += ', ';
			} else {
				result += ']';
			}

			return result;
		}, '[');
	}

	const wrapProgress = gsap.utils.wrap(0, 1);
	$: wrapIndex = gsap.utils.wrap(0, $array.length);

	$: exampleRotateBy = Math.floor($array.length / 2);
	$: exampleRotatedArray = $array.map(
		(_, index, arr) => arr[wrapIndex(index + exampleRotateBy)]
	);
	$: examplePivotIndex = $array.length - 1 - exampleRotateBy;

	let rotateBy = 1;
	let rotating: boolean = false;

	function rotate() {
		if ($rotationAnimation) {
			rotating = true;

			const stepSize = 1 / $array.length;

			gsap.to($rotationAnimation, {
				progress: $rotationAnimation.progress() - rotateBy * stepSize,
				duration: (1 / $array.length) * rotateBy,
				ease: 'none',
				modifiers: {
					progress: wrapProgress,
				},
				onComplete: () => {
					$rotationAnimationProgress = $rotationAnimation.progress();
					rotating = false;
				},
			});
		} else {
			console.error('no timeline found for rotation animation!');
		}
	}

	function removeArrayItemHighlighting() {
		gsap.set('.array-item', {
			fill: colors.default,
		});
	}

	/**
	 * AnimationProgress component was causing errors attempting to update
	 * on array rotation changes. Hiding it until entering its slide avoids
	 * the issue.
	 */
	let showPivotSearchAnimationProgress = false;

	function seekPivotSearchAnimation(searchStateIndex: number) {
		$pivotSearchAnimation.timeline.pause();
		$pivotSearchAnimation.timeline.seek(`${searchStateIndex + 1}`);
		$pivotSearchAnimationProgress = searchStateIndex;
	}

	function playPivotSearchAnimation() {
		$pivotSearchAnimation.timeline.play(
			$pivotSearchAnimationProgress ===
				$pivotSearchAnimation.searchStates.length - 1
				? 0
				: String($pivotSearchAnimationProgress + 1)
		);
	}

	let userInputTarget = 0;
	let showTargetSearchAnimationProgress = false;
	let targetSearchOrPlay: 'save' | 'play' = 'save';

	function seekTargetSearchAnimation(searchStateIndex: number) {
		$targetSearchAnimation.timeline.pause();
		$targetSearchAnimation.timeline.seek(`${searchStateIndex + 1}`);
		$targetSearchAnimationProgress = searchStateIndex;
	}

	function playTargetSearchAnimation() {
		$targetSearchAnimation.timeline.play(
			$targetSearchAnimationProgress ===
				$targetSearchAnimation.searchStates.length - 1
				? 0
				: String($targetSearchAnimationProgress + 1)
		);
	}

	let userInputModifiedTarget = 0;
	let showModifiedTargetSearchAnimationProgress = false;
	let modifiedTargetSearchOrPlay: 'save' | 'play' = 'save';
	function seekModifiedTargetSearchAnimation(searchStateIndex: number) {
		$modifiedTargetSearchAnimation.timeline.pause();
		$modifiedTargetSearchAnimation.timeline.seek(`${searchStateIndex + 1}`);
		$modifiedTargetSearchAnimationProgress = searchStateIndex;
	}

	function playModifiedTargetSearchAnimation() {
		$modifiedTargetSearchAnimation.timeline.play(
			$modifiedTargetSearchAnimationProgress ===
				$modifiedTargetSearchAnimation.searchStates.length - 1
				? 0
				: String($modifiedTargetSearchAnimationProgress + 1)
		);
	}

	let useArrayWithDuplicates = false;

	let userInputModifiedWithDuplicatesTarget = 0;
	let showModifiedWithDuplicatesTargetSearchAnimationProgress = false;
	let modifiedWithDuplicatesTargetSearchOrPlay: 'save' | 'play' = 'save';
	function seekModifiedWithDuplicatesTargetSearchAnimation(
		searchStateIndex: number
	) {
		$modifiedWithDuplicatesTargetSearchAnimation.timeline.pause();
		$modifiedWithDuplicatesTargetSearchAnimation.timeline.seek(
			`${searchStateIndex + 1}`
		);
		$modifiedWithDuplicatesTargetSearchAnimationProgress = searchStateIndex;
	}

	function playModifiedWithDuplicatesTargetSearchAnimation() {
		$modifiedWithDuplicatesTargetSearchAnimation.timeline.play(
			$modifiedWithDuplicatesTargetSearchAnimationProgress ===
				$modifiedWithDuplicatesTargetSearchAnimation.searchStates.length - 1
				? 0
				: String($modifiedWithDuplicatesTargetSearchAnimationProgress + 1)
		);
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
				<p>
					Here is an array of <span class="font-bold text-indigo-500"
						>distinct</span
					> numbers sorted in ascending order:
				</p>
				<p class="text-xl font-mono text-blue-300">{printArray($array)}</p>
			</div>
		</div>
	</Slide>

	<!-- 2 -->
	<Slide animate>
		<div class="grid gap-6 text-3xl">
			<h2 class="text-orange-500 text-4xl font-bold">
				What is a "Rotated" Array?
			</h2>
			<div class="grid gap-4">
				<p>
					Here is an array of <span class="font-bold text-indigo-500"
						>distinct</span
					> numbers sorted in ascending order:
				</p>
				<p class="text-xl font-mono text-blue-300">{printArray($array)}</p>
				<p>
					Here is the same array <span class="font-bold text-orange-400"
						>rotated</span
					>:
				</p>
				<p class="text-xl font-mono text-blue-300">
					{printArray(exampleRotatedArray)}
				</p>
			</div>
		</div>
	</Slide>

	<!-- 3 -->
	<Slide animate>
		<div class="grid gap-6 text-3xl">
			<h2 class="text-orange-500 text-4xl font-bold">
				What is a "Rotated" Array?
			</h2>
			<div class="grid gap-4">
				<p>
					Here is an array of <span class="font-semibold text-indigo-500"
						>distinct</span
					> numbers sorted in ascending order:
				</p>
				<p class="text-xl font-mono text-blue-300">{printArray($array)}</p>
				<p>
					Here is the same array <span class="font-semibold text-orange-400"
						>rotated</span
					>:
				</p>
				<p class="text-xl font-mono text-blue-300">
					{@html printArray(exampleRotatedArray, [examplePivotIndex])}
				</p>
				<p>
					The pivot index is that which contains the <span
						class="text-violet-500 font-semibold">largest value</span
					> in a rotated ascending array.
				</p>
				<p>
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
			</div>
		</div>
	</Slide>

	<!-- 4 -->
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

	<!-- 5 -->
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
							class="font-bold text-2xl text-red-500 inline-flex justify-center items-center"
						>
							<IconWarning size={24} class="text-yellow-500" /><span
								class="px-2">No Array Rotation Detected</span
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
						<span class="font-semibold text-orange-400">rotate</span> the array,
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
						Here is our freshly <span class="font-semibold text-orange-400"
							>rotated</span
						> array:
					</h3>
				{/if}
				<p class="text-xl font-mono text-blue-300">
					{printArray($rotatedArray)}
				</p>
				<Step>
					<p class="my-4 text-lg">
						One approach to finding a <span class="text-rose-500 font-semibold"
							>target</span
						>
						value is to first locate the position of the
						<span class="text-green-500 font-semibold">pivot</span>.
					</p>
				</Step>
				<Step>
					<h3 class="text-2xl">
						How can we go about finding the <span
							class="text-green-500 font-semibold">pivot</span
						>?
					</h3>
					<p class="my-4 text-lg">
						We can slowly iterate over the values one at a time until we find
						the index of the <span class="text-violet-500 font-semibold"
							>largest</span
						> value...
					</p>
					<p class="text-5xl">🐌</p>
				</Step>
				<Step>
					<p class="my-4 text-lg">
						...or we can go fast using a <TooltipDefinition
							direction="top"
							align="start"
							tooltipText="A process where a function calls itself."
						>
							<span
								class="text-lg text-blue-200 hover:text-blue-500 font-semibold"
								>recursive</span
							></TooltipDefinition
						>
						<TooltipDefinition
							direction="top"
							align="start"
							tooltipText="A search algorithm that reduces the search space by half at each iteration."
							><span
								class="text-lg text-blue-200 hover:text-blue-500 font-semibold"
								>binary search</span
							></TooltipDefinition
						>!
					</p>
					<p class="text-5xl">🐇</p>
				</Step>
			</div>
		</div>
	</Slide>

	<!-- 6 -->
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

	<!-- 7 -->
	<Slide
		animate
		on:in={() => {
			showPivotSearchAnimationProgress = true;
			returnToSlide = $navigation.currentSlide;
		}}
		on:out={() => {
			showPivotSearchAnimationProgress = false;
			$pivotSearchAnimation.timeline.pause(0);
			$pivotSearchAnimationProgress = -1;
			removeArrayItemHighlighting();
		}}
		style="height: 100%;"
	>
		<div class="pivot-search-wrapper">
			<div>
				<h2 class="text-orange-500 text-4xl font-bold">
					Binary Search for Pivot Index
				</h2>
			</div>
			<SearchState
				searchState={$pivotSearchAnimation.searchStates[
					$pivotSearchAnimationProgress
				]}
				searchType="PIVOT"
				visible={$pivotSearchAnimation.searchStates.length > 0}
			/>
			<div>
				<Button
					size="small"
					kind="secondary"
					icon={IconPlay}
					on:click={() => {
						playPivotSearchAnimation();
					}}>Play</Button
				>
				{#if showPivotSearchAnimationProgress}
					<AnimationProgress
						steps={$pivotSearchAnimation?.searchStates ?? []}
						currentStep={$pivotSearchAnimationProgress > 0
							? $pivotSearchAnimationProgress
							: 0}
						onStepClick={seekPivotSearchAnimation}
					/>
				{/if}
			</div>
		</div>
	</Slide>

	<!-- 8 -->
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

	<!-- 9 -->
	<Slide animate>
		<h2 class="my-6 text-orange-500 text-4xl font-bold">
			Binary Search for Target Value
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

	<!-- 10 -->
	<Slide
		animate
		on:in={() => {
			showTargetSearchAnimationProgress = true;
			returnToSlide = $navigation.currentSlide;
		}}
		on:out={() => {
			$targetSearchAnimation.timeline.pause(0);
			$targetSearchAnimationProgress = -1;
			showTargetSearchAnimationProgress = false;
			removeArrayItemHighlighting();
		}}
		style="height: 100%;"
	>
		<div class="target-search-wrapper">
			<div>
				<h2 class="text-orange-500 text-4xl font-bold">
					Binary Search for Target Value
				</h2>
			</div>
			<SearchState
				searchState={$targetSearchAnimation.searchStates[
					$targetSearchAnimationProgress
				]}
				searchType="TARGET"
				visible={$targetSearchAnimation.searchStates.length > 0}
			/>
			<div class="target-wrapper">
				<div class="target">
					<NumberInput
						label="Target Value"
						bind:value={userInputTarget}
						min={0}
						max={100}
						on:change={() => {
							if (userInputTarget !== $target) {
								targetSearchOrPlay = 'save';
							}
						}}
					/>

					<Button
						size="field"
						kind="secondary"
						icon={targetSearchOrPlay === 'play' ? IconPlay : IconSearch}
						on:click={() => {
							if (targetSearchOrPlay === 'play') {
								playTargetSearchAnimation();
							} else {
								$target = userInputTarget;
								targetSearchOrPlay = 'play';
								seekTargetSearchAnimation(-1);
								playTargetSearchAnimation();
							}
						}}>{targetSearchOrPlay === 'play' ? 'Play' : 'Search'}</Button
					>
				</div>
			</div>
			<div>
				{#if showTargetSearchAnimationProgress && targetSearchOrPlay === 'play'}
					<AnimationProgress
						steps={$targetSearchAnimation?.searchStates ?? []}
						currentStep={$targetSearchAnimationProgress > 0
							? $targetSearchAnimationProgress
							: 0}
						onStepClick={seekTargetSearchAnimation}
					/>
				{/if}
			</div>
		</div>
	</Slide>

	<!-- 11 -->
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

	<!-- 12 -->
	<Slide animate>
		<h2 class="my-6 text-orange-500 text-4xl font-bold">
			Modified Binary Search for Target Value
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
					else if (nums[mid] > nums[low]) {
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

	<!-- 13 -->
	<Slide
		animate
		on:in={() => {
			showModifiedTargetSearchAnimationProgress = true;
			returnToSlide = $navigation.currentSlide;
		}}
		on:out={() => {
			$modifiedTargetSearchAnimation.timeline.pause(0);
			$modifiedTargetSearchAnimationProgress = -1;
			showModifiedTargetSearchAnimationProgress = false;
			removeArrayItemHighlighting();
		}}
		style="height: 100%;"
	>
		<div class="target-search-wrapper">
			<div>
				<h2 class="text-orange-500 text-4xl font-bold">
					Modified Binary Search for Target Value
				</h2>
			</div>
			<SearchState
				searchState={$modifiedTargetSearchAnimation.searchStates[
					$modifiedTargetSearchAnimationProgress
				]}
				searchType="TARGET"
				visible={$modifiedTargetSearchAnimation.searchStates.length > 0}
			/>
			<div class="target-wrapper">
				<div class="target">
					<NumberInput
						label="Target Value"
						bind:value={userInputModifiedTarget}
						min={0}
						max={100}
						on:change={() => {
							if (userInputModifiedTarget !== $modifiedTarget) {
								modifiedTargetSearchOrPlay = 'save';
							}
						}}
					/>

					<Button
						size="field"
						kind="secondary"
						icon={modifiedTargetSearchOrPlay === 'play' ? IconPlay : IconSearch}
						on:click={() => {
							if (modifiedTargetSearchOrPlay === 'play') {
								playModifiedTargetSearchAnimation();
							} else {
								$modifiedTarget = userInputModifiedTarget;
								modifiedTargetSearchOrPlay = 'play';
								seekModifiedTargetSearchAnimation(-1);
								playModifiedTargetSearchAnimation();
							}
						}}
						>{modifiedTargetSearchOrPlay === 'play' ? 'Play' : 'Search'}</Button
					>
				</div>
			</div>
			<div>
				{#if showModifiedTargetSearchAnimationProgress && modifiedTargetSearchOrPlay === 'play'}
					<AnimationProgress
						steps={$modifiedTargetSearchAnimation?.searchStates ?? []}
						currentStep={$modifiedTargetSearchAnimationProgress > 0
							? $modifiedTargetSearchAnimationProgress
							: 0}
						onStepClick={seekModifiedTargetSearchAnimation}
					/>
				{/if}
			</div>
		</div>
	</Slide>

	<!-- 14 -->
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

	<!-- 15 -->
	<Slide animate>
		<div class="my-6">
			<h2 class="text-orange-500 text-3xl font-bold">
				Modified Binary Search for Target Value
			</h2>
			<h3 class="text-orange-400 text-2xl font-semibold">
				Adapted for Arrays of Non-Distinct Values
			</h3>
		</div>
		<Code
			lang="javascript"
			lines="12,17-19"
			style="transform-origin: 50% 0%;"
			class="scale-[0.7]"
			>{`
			function modifiedBinarySearch(nums, target) {
				let low = 0, high = nums.length - 1, mid;

				while (low <= high) {
					mid = low + Math.floor((high - low) / 2);
					if (nums[mid] === target)	return mid;
					else if (nums[mid] > nums[low]) {
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

	<!-- 16 -->
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
					Note that the array's <span class="font-semibold text-orange-400"
						>rotation</span
					> status has been preserved.
				</p>
			{/if}
		</div>
	</Slide>

	<!-- 17 -->
	<Slide
		animate
		on:in={() => {
			useArrayWithDuplicates = true;
			showModifiedWithDuplicatesTargetSearchAnimationProgress = true;
			returnToSlide = $navigation.currentSlide;
		}}
		on:out={() => {
			useArrayWithDuplicates = false;
			$modifiedWithDuplicatesTargetSearchAnimation.timeline.pause(0);
			$modifiedWithDuplicatesTargetSearchAnimationProgress = -1;
			showModifiedWithDuplicatesTargetSearchAnimationProgress = false;
			removeArrayItemHighlighting();
		}}
		style="height: 100%;"
	>
		<div class="target-search-wrapper">
			<div>
				<!-- Change header for duplicates -->
				<h2 class="text-orange-500 text-3xl font-bold">
					Modified Binary Search for Target Value
				</h2>
				<h3 class="text-orange-400 text-2xl font-semibold">
					Adapted for Arrays of Non-Distinct Values
				</h3>
			</div>
			<SearchState
				searchState={$modifiedWithDuplicatesTargetSearchAnimation.searchStates[
					$modifiedWithDuplicatesTargetSearchAnimationProgress
				]}
				searchType="TARGET"
				visible={$modifiedWithDuplicatesTargetSearchAnimation.searchStates
					.length > 0}
			/>
			<div class="target-wrapper">
				<div class="target">
					<NumberInput
						label="Target Value"
						bind:value={userInputModifiedWithDuplicatesTarget}
						min={0}
						max={100}
						on:change={() => {
							if (
								userInputModifiedWithDuplicatesTarget !==
								$modifiedWithDuplicatesTarget
							) {
								modifiedWithDuplicatesTargetSearchOrPlay = 'save';
							}
						}}
					/>

					<Button
						size="field"
						kind="secondary"
						icon={modifiedWithDuplicatesTargetSearchOrPlay === 'play'
							? IconPlay
							: IconSearch}
						on:click={() => {
							if (modifiedWithDuplicatesTargetSearchOrPlay === 'play') {
								playModifiedWithDuplicatesTargetSearchAnimation();
							} else {
								$modifiedWithDuplicatesTarget =
									userInputModifiedWithDuplicatesTarget;
								modifiedWithDuplicatesTargetSearchOrPlay = 'play';
								seekModifiedWithDuplicatesTargetSearchAnimation(-1);
								playModifiedWithDuplicatesTargetSearchAnimation();
							}
						}}
						>{modifiedWithDuplicatesTargetSearchOrPlay === 'play'
							? 'Play'
							: 'Search'}</Button
					>
				</div>
			</div>
			<div>
				{#if showModifiedWithDuplicatesTargetSearchAnimationProgress && modifiedWithDuplicatesTargetSearchOrPlay === 'play'}
					<AnimationProgress
						steps={$modifiedWithDuplicatesTargetSearchAnimation?.searchStates ??
							[]}
						currentStep={$modifiedWithDuplicatesTargetSearchAnimationProgress >
						0
							? $modifiedWithDuplicatesTargetSearchAnimationProgress
							: 0}
						onStepClick={seekModifiedWithDuplicatesTargetSearchAnimation}
					/>
				{/if}
			</div>
		</div>
	</Slide>
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

	.target-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		place-items: end center;
	}

	.rotate {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: flex-end;
	}

	.target-search-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 7fr 1fr 1fr;
	}

	.target-wrapper {
		display: inline-flex;
		justify-content: center;
	}

	.target {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: flex-end;
	}

	.pivot-search-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 7fr 2fr;
		z-index: 100;
	}

	.pivot-search-wrapper div:nth-child(1) {
		place-self: start center;
	}
	.pivot-search-wrapper div:nth-child(2) {
		place-self: center center;
	}
	.pivot-search-wrapper div:nth-child(3) {
		place-self: end center;
	}
	.target-search-wrapper div:nth-child(1) {
		place-self: start center;
	}
	.target-search-wrapper div:nth-child(2) {
		place-self: center center;
	}
	.target-search-wrapper div:nth-child(3) {
		place-self: center center;
	}
	.target-search-wrapper div:nth-child(4) {
		place-self: end center;
	}
</style>
