import { BASE_HIGHLIGHT_ANIMATION_DURATION } from '@constants';
import type { Writable } from 'svelte/store';
import type { TweensByStep } from '@types';

function addHighlightTweensToTimeline(
	timeline: gsap.core.Timeline,
	tweensByStep: TweensByStep,
	progressStore: Writable<number>,
	isActiveStore: Writable<boolean>
): void {
	let time = 0;

	tweensByStep.forEach((tweens, step) => {
		timeline.call(
			() => {
				progressStore.set(step);
				isActiveStore.set(
					timeline.isActive() && step !== tweensByStep.length - 1
				);
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
