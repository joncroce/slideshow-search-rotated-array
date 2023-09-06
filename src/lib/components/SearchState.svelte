<script lang="ts">
	import type { BinarySearchState } from '@lib/types';

	export let searchState: BinarySearchState<string>;
</script>

{#if searchState.lowIndex !== null}
	<span>Low: {searchState.lowIndex}</span>
{/if}
{#if searchState.highIndex !== null}
	<span>High: {searchState.highIndex}</span>
{/if}
{#if searchState.midIndex !== null}
	<span>Mid: {searchState.midIndex}</span>
{/if}
{#if searchState.resultIndex !== null}
	<span>{searchState?.resultCondition ?? 'Result found.'}</span>
	<span>Result: {searchState.resultIndex}</span>
{/if}
