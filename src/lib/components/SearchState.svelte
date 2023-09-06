<script lang="ts">
	import colors from '@lib/colors';
	import type { BinarySearchState } from '@lib/types';

	export let searchState: BinarySearchState<string>;
</script>

<div class="h-full w-full relative">
	{#if searchState}
		<table class="search-pointers text-xl">
			<thead>
				<tr>
					<th>Low</th>
					<th>Mid</th>
					<th>High</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="cell" style="color: {colors.searchRange}"
						>{searchState?.low ?? '—'}</td
					>
					<td class="cell" style="color: {colors.mid}"
						>{searchState?.mid ?? '—'}</td
					>
					<td class="cell" style="color: {colors.searchRange}"
						>{searchState?.high ?? '—'}</td
					>
				</tr>
			</tbody>
		</table>
		{#if searchState.resultIndex !== null}
			<div class="result text-2xl text-center">
				<span>{searchState?.resultCondition ?? 'Result found.'}</span>
				<div>
					<table class="text-xl">
						<thead>
							<tr>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="cell" style="color: {colors.result}"
									>{searchState.resultIndex}</td
								>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
	.search-pointers {
		position: absolute;
		top: 25%;
		left: 50%;
		transform: translateX(-50%);
	}

	.cell {
		text-align: center;
		font-weight: 600;
	}

	.result {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 30%;
		width: 35%;
	}
</style>
