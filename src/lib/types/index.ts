export type BinarySearchState<TResultCondition> = {
	resultIndex: number | null;
	resultCondition: TResultCondition | null;
	low: number;
	mid: number | null;
	high: number;
};
