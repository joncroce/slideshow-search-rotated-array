<script lang="ts">
	import { ProgressIndicator, ProgressStep } from '@components';
	import type { BinarySearchState, SearchAnimationName } from '@types';
	import { generateSequentialId } from '@utils';

	export let animationName: SearchAnimationName;
	export let animation: {
		timeline: gsap.core.Timeline;
		searchStates:
			| Array<BinarySearchState['PIVOT']>
			| Array<BinarySearchState['TARGET']>;
	};
	export let animationProgress: number;
	export let seek: (
		animationName: SearchAnimationName,
		stepIndex: number
	) => void;

	$: stepsArray = Array.from(
		{ length: animation.searchStates.length },
		(_, i) => ({
			key: generateSequentialId(),
			label: String(i + 1),
			complete: animationProgress + 1 > i,
		})
	);
</script>

{#if animation}
	<ProgressIndicator class="mt-3" spaceEqually>
		{#each stepsArray as step, index (step.key)}
			<ProgressStep
				complete={step.complete}
				label={step.label}
				on:click={() => {
					seek(animationName, index);
				}}
			/>
		{/each}
	</ProgressIndicator>
{/if}
