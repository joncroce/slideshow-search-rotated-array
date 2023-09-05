import { derived, writable } from 'svelte/store';

export const array = writable<Array<number>>(
	Array.from({ length: 14 }, (_, i) => i)
);

export const arraySize = derived([array], ([$array]) => $array.length);
