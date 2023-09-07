export type BinarySearchType = 'PIVOT';

const PivotSearchResultCondition = [
	'HIGH_LESS_THAN_LOW',
	'HIGH_EQUAL_TO_LOW',
	'VALUE_AT_MID_LESS_THAN_VALUE_BEFORE',
	'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER',
] as const;

type BinarySearchStatePartial = {
	resultIndex: number | null;
	low: number;
	mid: number | null;
	high: number;
};

export type BinarySearchState = {
	PIVOT: BinarySearchStatePartial & {
		resultCondition: (typeof PivotSearchResultCondition)[number];
	};
};
