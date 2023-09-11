import { gsap } from 'gsap';
import { writable, derived } from 'svelte/store';
import { circleSvgReady } from '@stores/circle';
import { array } from '@stores/array';
import {
	calcArrayRotatedBy,
	mapArrayItemProgress,
	rotateArray,
	wrapIndex,
	wrapProgress,
} from '@utils';
import { TARGET_PREFIX } from '@constants';

export const rotationAnimationProgress = writable<number>(1);
export const rotationAnimation = derived(
	[circleSvgReady, array],
	([$ready, $array]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$ready || !$array.length) {
			return timeline;
		}

		const leftBracketProgress = -0.245;
		const rightBracketProgress = -0.255;
		const arrayItemProgress = mapArrayItemProgress($array);

		const arrayItemTweens = $array.map((_, index) => {
			return gsap.to(`${TARGET_PREFIX}${index}`, {
				motionPath: {
					path: '#circle',
					align: '#circle',
					alignOrigin: [0.5, 0.5],
					autoRotate: false,
					start: arrayItemProgress[wrapIndex(index)],
					end: 1 + arrayItemProgress[wrapIndex(index)],
				},
				duration: 1,
				ease: 'none',
			});
		});

		const leftBracketTween = gsap.to(`#array-bracket-left`, {
			motionPath: {
				path: '#circle',
				align: '#circle',
				alignOrigin: [0.5, 0.5],
				autoRotate: false,
				start: leftBracketProgress,
				end: leftBracketProgress,
			},
			duration: 1,
			ease: 'none',
		});

		const rightBracketTween = gsap.to(`#array-bracket-right`, {
			motionPath: {
				path: '#circle',
				align: '#circle',
				alignOrigin: [0.5, 0.5],
				autoRotate: false,
				start: rightBracketProgress,
				end: rightBracketProgress,
			},
			duration: 1,
			ease: 'none',
		});

		for (const tween of [
			leftBracketTween,
			rightBracketTween,
			...arrayItemTweens,
		]) {
			timeline.add(tween, 0);
		}

		// Run animation to position items accordingly.
		gsap.to(timeline, {
			progress: -1,
			duration: 1,
			ease: 'none',
			modifiers: {
				progress: wrapProgress,
			},
		});

		// Make ready elements visible
		gsap.to(['.array-item', '.array-bracket'], {
			opacity: 1,
			duration: 1,
			ease: 'none',
		});

		return timeline;
	}
);

export const rotatedBy = derived([rotationAnimationProgress], ([$progress]) =>
	calcArrayRotatedBy($progress)
);

export const rotatedArray = derived(
	[array, rotatedBy],
	([$array, $rotatedBy]) => rotateArray($array, $rotatedBy)
);
