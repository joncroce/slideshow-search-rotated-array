<script lang="ts">
	import { ProgressIndicator, ProgressStep } from '@components';

	export let steps: Array<unknown>;
	export let currentStep: number;
	export let onStepClick: (stepIndex: number) => void;
</script>

{#if steps}
	<ProgressIndicator class="mt-3" currentIndex={currentStep} spaceEqually>
		{#each steps as _, index}
			<ProgressStep
				label={`${index + 1}`}
				on:click={() => {
					onStepClick(index);
				}}
			/>
		{/each}
	</ProgressIndicator>
{/if}
