<script lang="ts">
	import {
		AnimationControl,
		AnimationProgress,
		NumberInput,
		SearchState,
		Slide,
	} from '@components';
	import type { BinarySearchState, SearchAnimationName } from '@types';
	import { removeArrayItemHighlighting } from '@lib/utils';

	export let animation: {
		timeline: gsap.core.Timeline;
		searchStates:
			| Array<BinarySearchState['PIVOT']>
			| Array<BinarySearchState['TARGET']>;
	};
	export let animationName: SearchAnimationName;
	export let animationProgress: number;
	export let animationReady: boolean;
	export let animationActive: boolean;
	export let searchState:
		| BinarySearchState['PIVOT']
		| BinarySearchState['TARGET'];
	export let userInput: number;
	export let targetIsStale: boolean;
	export let showAnimationProgress: boolean;
	export let updateTargetIsStale: (
		animationName: SearchAnimationName,
		userInput: number
	) => void;
	export let updateSearchAnimation: (
		animationName: SearchAnimationName
	) => Promise<void>;
	export let playSearchAnimation: (animationName: SearchAnimationName) => void;
	export let pauseSearchAnimation: (animationName: SearchAnimationName) => void;
	export let seekSearchAnimation: (
		animationName: SearchAnimationName,
		searchStateIndex: number
	) => void;
	export let resetSearchAnimationProgress: (
		animationName: SearchAnimationName
	) => void;
	export let updateReturnToSlide: () => void;

	const searchType = animationName === 'FIND_PIVOT' ? 'PIVOT' : 'TARGET';
</script>

<Slide
	animate
	on:in={() => {
		updateReturnToSlide();
	}}
	on:out={() => {
		pauseSearchAnimation(animationName);
		resetSearchAnimationProgress(animationName);
		removeArrayItemHighlighting();
	}}
	style="height: 100%;"
>
	<div class="{searchType === 'PIVOT' ? 'pivot' : 'target'}-search-wrapper">
		<div>
			<slot />
		</div>
		<SearchState {searchState} {searchType} visible={animationReady} />
		{#if searchType === 'TARGET'}
			<div class="target-wrapper">
				<div class="target">
					<NumberInput
						label="Target Value"
						bind:value={userInput}
						min={0}
						max={100}
						on:change={() => {
							updateTargetIsStale(animationName, userInput);
						}}
					/>

					<AnimationControl
						{animationName}
						status={targetIsStale
							? 'SEARCH'
							: animationActive
							? 'PAUSE'
							: 'PLAY'}
						search={updateSearchAnimation}
						play={playSearchAnimation}
						pause={pauseSearchAnimation}
					/>
				</div>
			</div>
		{/if}
		<div>
			{#if searchType === 'PIVOT'}
				<AnimationControl
					{animationName}
					status={animationActive ? 'PAUSE' : 'PLAY'}
					search={updateSearchAnimation}
					play={playSearchAnimation}
					pause={pauseSearchAnimation}
				/>
			{/if}
			{#if showAnimationProgress && animationReady}
				<AnimationProgress
					{animationName}
					{animation}
					{animationProgress}
					seek={seekSearchAnimation}
				/>
			{/if}
		</div>
	</div>
</Slide>

<style lang="postcss">
	.pivot-search-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 7fr 2fr;
		z-index: 100;
	}

	.pivot-search-wrapper div:nth-child(1) {
		place-self: start center;
	}
	.pivot-search-wrapper div:nth-child(2) {
		place-self: center center;
	}
	.pivot-search-wrapper div:nth-child(3) {
		place-self: end center;
	}

	.target-search-wrapper {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 7fr 1fr 1fr;
	}

	.target-wrapper {
		display: inline-flex;
		justify-content: center;
	}

	.target {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: flex-end;
	}

	.target-search-wrapper div:nth-child(1) {
		place-self: start center;
	}
	.target-search-wrapper div:nth-child(2) {
		place-self: center center;
	}
	.target-search-wrapper div:nth-child(3) {
		place-self: center center;
	}
	.target-search-wrapper div:nth-child(4) {
		place-self: end center;
	}
</style>
