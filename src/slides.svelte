<script lang="ts">
	import options from './config';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
	import { Presentation, Slide, Step } from '@components';
	import { Button, NumberInput } from 'carbon-components-svelte';

	const { width, height } = options;
	const array = Array.from({ length: 14 }, (_, i) => i);
	const arrayCharSize = 36;
	const stepSize = 1 / array.length;
	const tl = gsap.timeline({ paused: true });
	const wrapProgress = gsap.utils.wrap(0, 1);
	const wrapIndex = gsap.utils.wrap(0, array.length);

	let rotateBy = Math.ceil(array.length / 2);

	onMount(() => {
		gsap.registerPlugin(MotionPathPlugin);
		MotionPathPlugin.convertToPath('#circle')[0];

		gsap.set(['#circle', '.array-item', '.array-bracket'], {
			transformOrigin: 'center',
			translate: '50% 50%',
		});

		gsap.set('.array-bracket', {
			scaleY: 1.5,
		});

		const arrayItemProgress = array.map((_, index) =>
			// Small amount added to prevent positioning errors on progress wrap
			wrapProgress(stepSize * index - 0.25000001 + stepSize / 2)
		);
		const leftBracketProgress = -0.245;
		const rightBracketProgress = -0.255;

		const arrayItemTweens = array.map((_, index) => {
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
			tl.add(tween, 0);
		}

		// Run timeline through a progress cycle to position
		// elements corrently in advance of viewing slide.
		gsap.to(tl, {
			progress: 1,
			duration: 1,
			ease: 'none',
			modifiers: {
				progress: gsap.utils.wrap(0, 1),
			},
		});

		gsap.to(['.array-item', '.array-bracket'], {
			opacity: 1,
			duration: 1,
			ease: 'none',
		});
	});

	function rotateValues() {
		gsap.to(tl, {
			progress: tl.progress() + rotateBy * stepSize,
			duration: (2 / array.length) * rotateBy,
			ease: 'none',
			modifiers: {
				progress: gsap.utils.wrap(0, 1),
			},
		});
	}
</script>

<Presentation>
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
	<Slide animate>
		<svg {width} {height} viewBox="0 0 {width} {height}">
			<circle
				id="circle"
				cx="50%"
				cy="50%"
				r={`${width * 0.25}`}
				fill="transparent"
			>
			</circle>
			<text
				id="array-bracket-left"
				class="array-bracket"
				x="0"
				y="0"
				font-size={arrayCharSize}
				opacity="0"
				font-family="monospace"
				text-anchor="middle"
				fill="teal"
			>
				[
			</text>
			{#each array as value, i}
				<text
					id="array-item-{i}"
					class="array-item"
					x="0"
					y="0"
					font-size={arrayCharSize}
					opacity="0"
					font-family="monospace"
					text-anchor="middle"
					fill="#CCC"
				>
					{value}
				</text>
			{/each}
			<text
				id="array-bracket-right"
				class="array-bracket"
				x="0"
				y="0"
				font-size={arrayCharSize}
				opacity="0"
				font-family="monospace"
				text-anchor="middle"
				fill="teal"
			>
				]
			</text>
		</svg>
		<div class="rotate-wrapper">
			<Button kind="secondary" size="field" on:click={() => rotateValues()}
				>Rotate</Button
			>
			<span class="text-sm font-sans self-center">by</span>
			<NumberInput
				label="Rotate by"
				hideLabel
				bind:value={rotateBy}
				min={1}
				max={array.length - 1}
			/>
		</div>
	</Slide>
</Presentation>

<style lang="postcss">
	.rotate-wrapper {
		margin-inline: auto;
		display: inline-flex;
		gap: 1rem;
		justify-content: center;
		align-items: end;
	}
</style>
