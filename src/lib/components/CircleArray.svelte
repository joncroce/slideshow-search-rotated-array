<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import MotionPathPlugin from 'gsap/MotionPathPlugin';
	import options from '@config';
	import { ARRAY_ITEM_FONT_SIZE, TARGET_PREFIX } from '@constants';
	import { circleSvgReady } from '@stores/circle';

	export let visible: boolean = false;
	export let array: Array<number>;

	const { width, height } = options;

	onMount(() => {
		gsap.registerPlugin(MotionPathPlugin);

		MotionPathPlugin.convertToPath('#circle')[0];

		gsap.set(['#circleGroup'], {
			transformOrigin: 'center',
			translate: '50% 50%',
		});

		gsap.set('.array-bracket', {
			scaleY: 1.5,
		});

		$circleSvgReady = true;
	});
</script>

<svg
	id="circleArray"
	data-visible={visible}
	{width}
	{height}
	viewBox="0 0 {width} {height}"
>
	<g id="circleGroup">
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
			font-size={ARRAY_ITEM_FONT_SIZE}
			opacity="0"
			font-family="monospace"
			text-anchor="middle"
			fill="teal"
		>
			[
		</text>
		{#each Array(array.length) as _, i}
			<text
				id="{TARGET_PREFIX.slice(1)}{i}"
				class="array-item"
				x="0"
				y="0"
				font-size={ARRAY_ITEM_FONT_SIZE}
				opacity="0"
				font-family="monospace"
				text-anchor="middle"
				fill="#CCC"
			>
				{array[i]}
			</text>
		{/each}
		<text
			id="array-bracket-right"
			class="array-bracket"
			x="0"
			y="0"
			font-size={ARRAY_ITEM_FONT_SIZE}
			opacity="0"
			font-family="monospace"
			text-anchor="middle"
			fill="teal"
		>
			]
		</text>
	</g>
</svg>

<style lang="postcss">
	#circleArray {
		position: absolute;
		height: 90%;
	}

	#circleArray[data-visible='false'] {
		opacity: 0;
		transition: opacity 0s none;
	}

	#circleArray[data-visible='true'] {
		opacity: 1;
		transition: opacity 0.8s ease;
		transition-delay: 0.2s;
	}
</style>
