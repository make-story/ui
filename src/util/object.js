/**
 * Object, JSON
 */

// 중복 제거
export const removeObjectDuplicates = (list=[], key='') => {
	// list = [ {id: 1}, {id: 4}, {id: 1}, {id: 5}, {id: 4}, ];
	const set = new Set();
	return list.filter(obj => {
		const existing = set.has(obj[key]);
		set.add(obj[key]);
		return !existing;
	});
}

// 깊은 복사
export const deepClone = (obj={}) => {
	let clone = obj;
	if(obj && typeof obj === "object") {
		clone = new obj.constructor();
		Object.getOwnPropertyNames(obj).forEach(prop => (clone[prop] = deepClone(obj[prop])));
	}
	return clone;
}