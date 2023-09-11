import { ARRAY_SIZE } from '@constants';

function calcArrayPivotIndex(rotatedBy: number = 0): number {
	if (rotatedBy === 0) {
		return -1;
	}

	return ARRAY_SIZE - 1 - rotatedBy;
}

export default calcArrayPivotIndex;
