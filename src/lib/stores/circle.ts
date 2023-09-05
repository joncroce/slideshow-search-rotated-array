import { writable } from 'svelte/store';

export const circleSvgReady = writable<boolean>(false);
export const circleSvgVisible = writable<boolean>(false);
