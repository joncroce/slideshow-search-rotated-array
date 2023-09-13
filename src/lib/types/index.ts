export type SearchAnimationName =
	| 'FIND_PIVOT'
	| 'FIND_TARGET_WITH_PIVOT'
	| 'FIND_TARGET'
	| 'FIND_TARGET_WHERE_DUPLICATES';

export type BinarySearchType = 'PIVOT' | 'TARGET';

export type PartialBinarySearchState = {
	resultIndex: number | null;
	low: number;
	mid: number | null;
	high: number;
};

const PivotSearchResultCondition = [
	'HIGH_LESS_THAN_LOW',
	'HIGH_EQUAL_TO_LOW',
	'VALUE_AT_MID_LESS_THAN_VALUE_BEFORE',
	'VALUE_AT_MID_GREATER_THAN_VALUE_AFTER',
] as const;

const TargetSearchResultCondition = [
	'HIGH_LESS_THAN_LOW',
	'TARGET_AT_PIVOT',
	'TARGET_LESS_THAN_VALUE_AT_PIVOT',
	'TARGET_GREATER_THAN_VALUE_BEFORE_PIVOT',
	'TARGET_AT_MID',
] as const;

export type BinarySearchState = {
	PIVOT: PartialBinarySearchState & {
		resultCondition: (typeof PivotSearchResultCondition)[number];
	};
	TARGET: PartialBinarySearchState & {
		resultCondition: (typeof TargetSearchResultCondition)[number];
	};
};

export type TweensByStep = Array<Array<gsap.core.Tween>>;
