export type BinarySearchState<TResultCondition> = {
	resultIndex: number | null;
	resultCondition: TResultCondition | null;
	lowIndex: number;
	midIndex: number | null;
	highIndex: number;
};
