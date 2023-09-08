<script lang="ts">
	import colors from '@lib/colors';
	import type { BinarySearchState, BinarySearchType } from '@lib/types';

	export let searchType: BinarySearchType;
	export let searchState: BinarySearchState[typeof searchType];
	export let show: boolean;

	type ConditionsDescriptionMap = {
		PIVOT: Record<BinarySearchState['PIVOT']['resultCondition'], string>;
		TARGET: Record<BinarySearchState['TARGET']['resultCondition'], string>;
	};

	const resultConditionsDescriptionMaps: ConditionsDescriptionMap = {
		PIVOT: {
			HIGH_LESS_THAN_LOW:
				"High crossed over low. No pivot found. Array isn't rotated.",
			HIGH_EQUAL_TO_LOW: 'High met low. Pivot is at low.',
			VALUE_AT_MID_LESS_THAN_VALUE_BEFORE:
				'Value at mid is less than the value before it. Pivot is one before mid.',
			VALUE_AT_MID_GREATER_THAN_VALUE_AFTER:
				'Value at mid is greater than the value after it. Pivot is at mid.',
		},
		TARGET: {
			HIGH_LESS_THAN_LOW: 'High crossed over low. Target value not found.',
			TARGET_AT_MID: 'Target found at mid.',
			TARGET_AT_PIVOT: 'Target found at pivot index.',
		},
	};
</script>

<div class="search-state">
	{#if show && searchState}
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
					<td
						class="cell"
						style="color: {searchState.resultCondition === 'HIGH_LESS_THAN_LOW'
							? colors.invalid
							: colors.searchRange}">{searchState?.low ?? '—'}</td
					>
					<td
						class="cell"
						style="color: {searchState.resultCondition === 'HIGH_LESS_THAN_LOW'
							? colors.invalid
							: colors.mid}">{searchState?.mid ?? '—'}</td
					>
					<td
						class="cell"
						style="color: {searchState.resultCondition === 'HIGH_LESS_THAN_LOW'
							? colors.invalid
							: colors.searchRange}">{searchState?.high ?? '—'}</td
					>
				</tr>
			</tbody>
		</table>
		<div class="result-description">
			{#if searchState?.resultCondition}
				<span class="text-xl text-center">
					{resultConditionsDescriptionMaps[searchType][
						searchState.resultCondition
					] ?? 'Result found.'}
				</span>
			{/if}
		</div>
		{#if searchState.resultIndex !== null}
			<table class="text-xl">
				<thead>
					<tr>
						<th>Result</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td
							class="cell"
							style="color: {searchState.resultCondition ===
							'HIGH_LESS_THAN_LOW'
								? colors.invalid
								: colors.result}">{searchState.resultIndex}</td
						>
					</tr>
				</tbody>
			</table>
		{/if}
	{/if}
</div>

<style lang="postcss">
	.search-state {
		margin-block: auto;
		margin-inline: auto;
		width: 35%;
		height: 70%;

		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cell {
		text-align: center;
		font-weight: 600;
	}
</style>
