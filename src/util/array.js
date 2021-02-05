/**
 * 배열
 */

// 중복 제거
export const removeArrayDuplicates = (list=[]) => {
	// list = [ undefined, 12, NaN, false, 89, 9, 12, NaN, null, null, ];
	return Array.from(new Set(list));
}