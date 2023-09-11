import { BASE_HIGHLIGHT_ANIMATION_DURATION, TARGET_PREFIX } from '@constants';
import colors from '@lib/colors';
import { gsap } from 'gsap';

function createHighlightTween(
	targetIndices: Array<number> = [],
	color: string = colors.default,
	duration: number = BASE_HIGHLIGHT_ANIMATION_DURATION
): gsap.core.Tween | null {
	if (!targetIndices.length) {
		return null;
	}

	const targets = targetIndices.map((index) => `${TARGET_PREFIX}${index}`);
	const tween = gsap.to(targets, {
		fill: color,
		duration,
	});

	return tween;
}

export default createHighlightTween;
