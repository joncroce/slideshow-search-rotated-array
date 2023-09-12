import { PATH_ADJUSTMENT_AMOUNT, STEP_SIZE } from '@constants';
import { wrapProgress } from '@utils';

function mapArrayItemProgress(array: Array<number>): Array<number> {
	return array.map((_, index) =>
		wrapProgress(STEP_SIZE * index - PATH_ADJUSTMENT_AMOUNT + STEP_SIZE / 2)
	);
}

export default mapArrayItemProgress;
