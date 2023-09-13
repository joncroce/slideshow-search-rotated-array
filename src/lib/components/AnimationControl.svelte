<script lang="ts">
	import { Button, IconSearch, IconPlay, IconPause } from '@components';
	import type { SearchAnimationName } from '@types';

	export let animationName: SearchAnimationName;
	export let status: 'SEARCH' | 'PLAY' | 'PAUSE';
	export let search: (animationName: SearchAnimationName) => Promise<void>;
	export let play: (animationName: SearchAnimationName) => void;
	export let pause: (animationName: SearchAnimationName) => void;
	export let searchDisabled: boolean;

	$: icon =
		status === 'SEARCH'
			? IconSearch
			: status === 'PLAY'
			? IconPlay
			: status === 'PAUSE'
			? IconPause
			: undefined;

	async function handleClick() {
		switch (status) {
			case 'SEARCH':
				pause(animationName);
				await search(animationName);
				play(animationName);
				break;
			case 'PLAY':
				play(animationName);
				break;
			case 'PAUSE':
				pause(animationName);
				break;
		}
	}
</script>

<Button
	size="field"
	kind="secondary"
	{icon}
	disabled={status === 'SEARCH' && searchDisabled}
	on:click={handleClick}
	><span class="w-24"
		>{status.charAt(0).concat(status.slice(1).toLowerCase())}</span
	></Button
>
