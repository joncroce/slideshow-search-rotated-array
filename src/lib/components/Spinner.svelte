<div class="wrapper">
	<div class="spinner" />
</div>
<div class="wrapper" data-rotated="true">
	<div class="spinner" />
</div>

<style lang="postcss">
	/* Adapted from spinner at https://css-loaders.com/spinner/#l7 by Temana Afif */

	.wrapper {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		position: absolute;
		height: 100%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
	}

	.wrapper[data-rotated='true'] {
		transform: translate(-50%, -50%) rotate(-45deg);
	}

	.spinner {
		width: 100%;
		aspect-ratio: 1;
		--_c: no-repeat radial-gradient(farthest-side, #38bdf8 92%, #0000);
		background:
			var(--_c) top,
			var(--_c) left,
			var(--_c) right,
			var(--_c) bottom;
		background-size: 7% 7%;
		animation: spinner 1s infinite;
	}
	@keyframes spinner {
		to {
			transform: rotate(-45deg);
		}
	}
</style>
