import { BASE_HIGHLIGHT_ANIMATION_DURATION } from '@constants';
import type { TweensByStep } from '@lib/types';
import type { Writable } from 'svelte/store';

function addHighlightTweensToTimeline(
	timeline: gsap.core.Timeline,
	tweensByStep: TweensByStep,
	progressStore: Writable<number>
): void {
	let time = 0;

	tweensByStep.forEach((tweens, step) => {
		timeline.call(
			() => {
				progressStore.set(step);
			},
			[],
			time
		);
		timeline.add(`${step}`, time);
		timeline.add(tweens, time);
		time += BASE_HIGHLIGHT_ANIMATION_DURATION * 2;
	});
}

export default addHighlightTweensToTimeline;
