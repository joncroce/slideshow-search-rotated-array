<script lang="ts">
	import { gsap } from 'gsap';
	import {
		Presentation,
		Slide,
		CircleArray,
		Button,
		NumberInput,
		Step,
	} from '@components';
	import { circleSvgVisible } from '@stores/circle';
	import {
		array,
		arraySize,
		stepSize,
		wrapProgress,
		timeline,
		timelineProgress,
		rotatedBy,
		rotatedArray,
		pivotIndex,
		wrapIndex,
	} from '@stores/rotation';

	function printArray(
		array: Array<number>,
		highlightIndices: Array<number> = []
	): string {
		const highlightClass = 'text-emerald-500';

		return array.reduce((result: string, value: number, index: number) => {
			if (highlightIndices.includes(index)) {
				result += `<span class="${highlightClass}">${value}</span>`;
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

	$: exampleRotateBy = Math.floor($arraySize / 2);
	$: exampleRotatedArray = $array.map(
		(_, index, arr) => arr[$wrapIndex(index + exampleRotateBy)]
	);
	$: examplePivotIndex = $array.length - 1 - exampleRotateBy;

	let rotateBy = 1;

	function rotate() {
		if ($timeline) {
			gsap.to($timeline, {
				progress: $timeline.progress() - rotateBy * $stepSize,
				duration: (1 / $arraySize) * rotateBy,
				ease: 'none',
				modifiers: {
					progress: wrapProgress,
				},
				onComplete: () => {
					$timelineProgress = $timeline.progress();
				},
			});
		} else {
			console.error('no timeline found for rotation animation!');
		}
	}
</script>

<Presentation>
	<!-- Positioned absolutely and hidden by default -->
	<CircleArray visible={$circleSvgVisible} />
	<div class="absolute top-0 font-mono text-left text-3xl text-rose-500">
		<p>Pivot Index: {$pivotIndex}</p>
		<p>Pivot Value: {$rotatedArray[$pivotIndex]}</p>
		<p>Rotated By: {$rotatedBy}</p>
		<p>Rotated Array: {$rotatedArray}</p>
	</div>
	<!-- 1 -->
	<Slide>
		<h2 class="text-4xl font-bold">Search Rotated Sorted Array</h2>
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

	<!-- 4 -->
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
					{@html printArray(exampleRotatedArray, [examplePivotIndex])}
				</p>
				<p>
					The pivot index is that which contains the <span
						class="text-violet-500 font-bold">largest value</span
					> in a rotated ascending array.
				</p>
				<p>
					We would say the <span class="text-emerald-500 font-bold">pivot</span>
					is at index
					<span class="font-mono">{examplePivotIndex}</span>
					(with a value of
					<span class="font-mono text-emerald-500"
						>{exampleRotatedArray[examplePivotIndex]}</span
					>).
				</p>
			</div>
		</div>
	</Slide>

	<!-- 5 -->
	<Slide
		animate
		on:in={() => {
			$circleSvgVisible = true;
		}}
		on:out={() => {
			$circleSvgVisible = false;
		}}
		style="height: 100%;"
	>
		<div class="rotate-wrapper">
			<h3 class="text-2xl text-orange-500 mb-[0.5em]">
				Please Rotate the Array
			</h3>
			<div class="rotate">
				<Button kind="secondary" size="field" on:click={() => rotate()}
					>Rotate</Button
				>
				<span class="text-sm font-sans self-center">by</span>
				<NumberInput
					label="Rotate by"
					hideLabel
					bind:value={rotateBy}
					min={1}
					max={$arraySize - 1}
				/>
			</div>
		</div>
	</Slide>

	<!-- 6 -->
	<Slide animate>
		<div class="grid gap-6">
			<h2 class="text-orange-500 text-4xl font-bold">Finding the Pivot</h2>
			<div class="grid gap-4">
				<h3 class="text-2xl">
					Here is our freshly <span class="font-bold text-orange-400"
						>rotated</span
					> array:
				</h3>
				<p class="text-xl font-mono text-blue-300">
					{printArray($rotatedArray)}
				</p>
				<Step>
					<h3 class="text-2xl">
						How can we go about finding the <span
							class="text-emerald-500 font-bold">pivot</span
						>?
					</h3>
					<p class="my-4 text-lg">
						We can slowly iterate over the values one at a time until we find
						the index with the <span class="text-violet-500 font-bold"
							>largest value</span
						>...
					</p>
					<p class="text-5xl">🐌</p>
				</Step>
				<Step>
					<p class="my-4 text-lg">
						...or we can go fast with recursive binary search!
					</p>
					<p class="text-5xl">🐇</p>
				</Step>
			</div>
		</div>
	</Slide>
</Presentation>

<style lang="postcss">
	.rotate-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		place-items: end center;
	}
	.rotate {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: end;
	}
</style>
