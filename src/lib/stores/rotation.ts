import { gsap } from 'gsap';
import { derived, writable } from 'svelte/store';
import { circleSvgReady } from '@stores/circle';
import { array } from '@stores/array';

const wrapProgress = gsap.utils.wrap(0, 1);

export const rotationAnimationProgress = writable<number>(1);
export const rotationAnimation = derived(
	[circleSvgReady, array],
	([$ready, $array]) => {
		const timeline = gsap.timeline({ paused: true });

		if (!$ready || !$array.length) {
			return timeline;
		}

		/**
		 * Path adjustment to move relative to top of the circle.
		 * Small amount added to prevent positioning errors on progress wrap.
		 */
		const pathAdjustmentAmount = 0.250000001;

		const stepSize = 1 / $array.length;
		const wrapIndex = gsap.utils.wrap(0, $array.length);

		const leftBracketProgress = -0.245;
		const rightBracketProgress = -0.255;
		const arrayItemProgress = $array.map((_, index) =>
			wrapProgress(stepSize * index - pathAdjustmentAmount + stepSize / 2)
		);

		const arrayItemTweens = $array.map((_, index) => {
			return gsap.to(`#array-item-${index}`, {
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

export const rotatedBy = derived(
	[array, rotationAnimationProgress],
	([$array, $progress]) => {
		if (!$array) {
			return 0;
		}

		const wrapIndex = gsap.utils.wrap(0, $array.length);
		const result = wrapIndex(
			$array.length - Math.round($array.length * wrapProgress($progress))
		);

		return result;
	}
);

export const rotatedArray = derived(
	[array, rotatedBy],
	([$array, $rotatedBy]) => {
		if (!$array) {
			return [];
		}

		if ($rotatedBy === 0) {
			return $array;
		}

		const wrapIndex = gsap.utils.wrap(0, $array.length);
		const result = $array.map(
			(_, index, arr) => arr[wrapIndex(index + $rotatedBy)]
		);

		return result;
	}
);
