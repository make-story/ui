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

// Deep extend destination object with N more objects
/*export const extend = (out={}) => {
	let i, key;
	for(i=1; i<arguments.length; i++) {
		if(!arguments[i]) {
			continue;
		}
		for(key in arguments[i]) {
			if(arguments[i].hasOwnProperty(key)) {
				out[key] = arguments[i][key];
			}
		}
	}
	return out;
}*/
export function extend(target = {}, ...sources) {
	if(!sources.length) {
		return target;
	}
	const source = sources.shift();
	if(!source || typeof source !== 'object') {
		return target;
	}
	Object.keys(source).forEach((key) => {
		if(source[key] && typeof source[key] === 'object') {
			if(!Object.keys(target).includes(key)) {
				Object.assign(target, { [key]: {} });
			}
			extend(target[key], source[key]);
		}else {
			Object.assign(target, { [key]: source[key] });
		}
	});
	return extend(target, ...sources);
}