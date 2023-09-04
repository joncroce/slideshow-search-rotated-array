<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
	import { Presentation, Slide, Step } from '@components';
	import options from './config';
	import { Button } from 'carbon-components-svelte';
	import { NumberInput } from 'carbon-components-svelte';

	const { width, height } = options;

	const array = Array.from({ length: 24 }, (_, i) => i);
	const arrayCharSize = 36;

	let rotateBy = 6;

	const segmentLength = 1 / (array.length + 1);

	let circlePath: SVGPathElement;

	let currentProgress: Array<number> = Array(array.length).fill(0);

	onMount(() => {
		gsap.registerPlugin(MotionPathPlugin);

		circlePath = MotionPathPlugin.convertToPath('#circle')[0];
		gsap.set('#circle', { transformOrigin: 'center', translate: '50% 50%' });

		const circleRawPath = MotionPathPlugin.getRawPath(circlePath);
		MotionPathPlugin.cacheRawPathMeasurements(circleRawPath);

		/**
		 * Want to reserve one space to split between brackets.
		 *
		 * Should be positioned at the top.
		 *
		 * Since a progress value of 0 lines up with 90deg on the circle,
		 * the reserved space should be centered at -0.25 progress,
		 * and have a width of 1 / (array.length + 1).
		 *
		 *
		 */

		const leftBracketProgress = segmentLength / 4 - 0.25;
		const rightBracketProgress = -segmentLength / 4 - 0.25;

		gsap.set(`#arr-bracket-left`, {
			...MotionPathPlugin.getPositionOnPath(circleRawPath, leftBracketProgress),
			opacity: 1,
			transformOrigin: 'center',
			translate: '50% 50%',
		});
		gsap.set(`#arr-bracket-right`, {
			...MotionPathPlugin.getPositionOnPath(
				circleRawPath,
				rightBracketProgress
			),
			opacity: 1,
			transformOrigin: 'center',
			translate: '50% 50%',
		});

		array.forEach((_, index) => {
			// Path origin is at 90deg
			// Leave gap at top for brackets
			const progress = segmentLength * (index + 1) - 0.25;
			currentProgress[index] = progress;

			const point = MotionPathPlugin.getPositionOnPath(circleRawPath, progress);

			gsap.set(`#arr-${index}`, {
				x: point.x,
				y: point.y,
				opacity: 1,
				transformOrigin: 'center',
				translate: '50% 50%',
			});
		});
	});

	function rotateValues() {
		const tl = gsap.timeline({ paused: true });

		const nextProgress = currentProgress.map((curr, index) => {
			const next = currentProgress.at(
				(index + rotateBy) % currentProgress.length
			);

			return next > curr ? next : 1 + next;
		});

		const tweens = currentProgress.map((current, index) => {
			return gsap.to(`#arr-${index}`, {
				motionPath: {
					path: '#circle',
					align: '#circle',
					alignOrigin: [0.5, 0.5],
					autoRotate: true,
					start: current,
					end: nextProgress[index],
				},
			});
		});

		for (const tween of tweens) {
			tl.add(tween, 0);
		}

		currentProgress = nextProgress.map(
			(progress) => progress - Math.floor(progress)
		);

		tl.play();
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
				id="arr-bracket-left"
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
					id="arr-{i}"
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
				id="arr-bracket-right"
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
