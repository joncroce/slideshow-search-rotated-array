import { gsap } from 'gsap';
import { derived, writable } from 'svelte/store';
import { array } from './array';
import { circleSvgReady } from './circle';

export const rotateBy = writable<number>(1);

export const stepSize = derived([array], ([$array]) => 1 / $array.length);

// Small amount added to prevent positioning errors on progress wrap
const PATH_ADJUSTMENT_FACTOR = 0.250000001;

export const wrapProgress = gsap.utils.wrap(0, 1);

const leftBracketProgress = -0.245;
const rightBracketProgress = -0.255;
const arrayItemProgress = derived([array, stepSize], ([$array, $stepSize]) => {
	return $array.map((_, index) =>
		wrapProgress($stepSize * index - PATH_ADJUSTMENT_FACTOR + $stepSize / 2)
	);
});

const tweens = derived(
	[circleSvgReady, array, arrayItemProgress],
	([$circleSvgReady, $array, $arrayItemProgress]) => {
		if (!$circleSvgReady || !$array || !$arrayItemProgress) {
			return null;
		}

		const wrapIndex = gsap.utils.wrap(0, $array.length);

		const arrayItemTweens = $array.map((_, index) => {
			return gsap.to(`#array-item-${index}`, {
				motionPath: {
					path: '#circle',
					align: '#circle',
					alignOrigin: [0.5, 0.5],
					autoRotate: false,
					start: $arrayItemProgress[wrapIndex(index)],
					end: 1 + $arrayItemProgress[wrapIndex(index)],
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

		return [leftBracketTween, rightBracketTween, ...arrayItemTweens];
	}
);

export const timeline = derived(
	[circleSvgReady, tweens],
	([$ready, $tweens]) => {
		if (!$ready || !$tweens) {
			return null;
		}

		const tl = gsap.timeline({ paused: true });

		for (const tween of $tweens) {
			tl.add(tween, 0);
		}

		// Run animation to position items accordingly.
		gsap.to(tl, {
			progress: 1,
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

		return tl;
	}
);