import { ARRAY_SIZE } from '@constants';
import { wrapIndex, wrapProgress } from '.';

function calcArrayRotatedBy(progress: number): number {
	return wrapIndex(
		ARRAY_SIZE - Math.round(ARRAY_SIZE * wrapProgress(progress))
	);
}

export default calcArrayRotatedBy;
