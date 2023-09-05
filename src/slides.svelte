<script lang="ts">
	import { gsap } from 'gsap';
	import { Presentation, Slide, CircleArray } from '@components';
	import { Button, NumberInput } from 'carbon-components-svelte';
	import { arraySize } from '@stores/array';
	import { circleSvgVisible } from '@stores/circle';
	import { stepSize, rotateBy, timeline, wrapProgress } from '@stores/rotation';

	function rotate() {
		if ($timeline) {
			gsap.to($timeline, {
				progress: $timeline.progress() + $rotateBy * $stepSize,
				duration: (1 / $arraySize) * $rotateBy,
				ease: 'none',
				modifiers: {
					progress: wrapProgress,
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

	<!-- 1 -->
	<Slide>
		<p>Search Rotated Sorted Array</p>
	</Slide>

	<!-- 2 -->
	<Slide animate>
		<div class="grid gap-6 text-3xl">
			<h2 class="text-orange-500 text-4xl font-bold">
				What is a "Rotated" Array?
			</h2>
			<div class="grid gap-4">
				<p>Here is an array of numbers sorted in ascending order:</p>
				<p class=" font-mono text-blue-300">[1, 2, 3, 4, 5, 6, 7]</p>
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
				<p>Here is an array of numbers sorted in ascending order:</p>
				<p class=" font-mono text-blue-300">[1, 2, 3, 4, 5, 6, 7]</p>
				<p>Here is the same array rotated:</p>
				<p class="font-mono text-blue-300">[5, 6, 7, 1, 2, 3, 4]</p>
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
				<p>Here is an array of numbers sorted in ascending order:</p>
				<p class=" font-mono text-blue-300">
					[1, 2, 3, <span class="text-emerald-500">4</span>, 5, 6, 7]
				</p>
				<p>Here is the same array rotated:</p>
				<p class="font-mono text-blue-300">
					[5, 6, 7, 1, 2, 3, <span class="text-emerald-500">4</span>]
				</p>
				<p>
					We would say the <span class="font-bold text-emerald-500">pivot</span>
					is at index <span class="font-mono italic">3</span> (with a value of
					<span class="font-mono text-emerald-500">4</span>).
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
			<div class="rotate">
				<Button kind="secondary" size="field" on:click={() => rotate()}
					>Rotate</Button
				>
				<span class="text-sm font-sans self-center">by</span>
				<NumberInput
					label="Rotate by"
					hideLabel
					bind:value={$rotateBy}
					min={1}
					max={$arraySize - 1}
				/>
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
