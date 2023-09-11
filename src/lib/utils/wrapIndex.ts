import { gsap } from 'gsap';
import { ARRAY_SIZE } from '@constants';

const wrapIndex = gsap.utils.wrap(0, ARRAY_SIZE);

export default wrapIndex;
