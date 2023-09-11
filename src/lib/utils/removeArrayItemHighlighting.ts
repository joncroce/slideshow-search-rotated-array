import { gsap } from 'gsap';
import colors from '@lib/colors';

function removeArrayItemHighlighting() {
	gsap.set('.array-item', {
		fill: colors.default,
	});
}

export default removeArrayItemHighlighting;
