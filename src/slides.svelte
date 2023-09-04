<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
	import { Presentation, Slide, Step } from '@components';
	import options from './config';

	const { width, height } = options;

	const array = Array.from({ length: 24 }, (_, i) => i);

	onMount(() => {
		gsap.registerPlugin(MotionPathPlugin);

		const circlePath = MotionPathPlugin.convertToPath('#circle')[0];
		gsap.set('#circle', { transformOrigin: 'center', translate: '50% 50%' });

		const circleRawPath = MotionPathPlugin.getRawPath(circlePath);
		MotionPathPlugin.cacheRawPathMeasurements(circleRawPath);

		array.forEach((_, index) => {
			// Path origin is at 90deg
			const progress = (1 / array.length) * index - 0.25;
			const point = MotionPathPlugin.getPositionOnPath(circleRawPath, progress);
			console.log(point);

			gsap.set(`#arr-${index}`, {
				x: point.x,
				y: point.y,
				opacity: 1,
				transformOrigin: 'center',
				translate: '50% 50%',
			});
		});
	});
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
			{#each array as value, i}
				<text
					id="arr-{i}"
					x="0"
					y="0"
					font-size="36"
					opacity="0"
					font-family="monospace"
					text-anchor="middle"
				>
					{value}
				</text>
			{/each}
		</svg>
	</Slide>
</Presentation>
