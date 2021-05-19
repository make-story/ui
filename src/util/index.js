/**
 * Util
 * https://medium.com/javascript-in-plain-english/25-javascript-code-solutions-utility-tricks-you-need-to-know-about-3023f7ed993e
 * https://github.com/beforesemicolon/javascript-solutions
 */

// 모듈 조합
// https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/export
//export { default } from './app';
//export { default } from './array';
//export { default } from './css';
//export { default } from './date';
//export { default } from './element';
//export { default } from './html';
//export { default as is } from './is';
//export { default } from './number';
//export { default } from './object';
//export { default } from './observe';
export { default as regexp } from './regexp';
//export { default } from './string';
//export { default } from './url';
//export * from './app';
export * from './array';
export * from './css';
export * from './date';
export * from './element';
export * from './html';
export * from './is';
export * from './number';
export * from './object';
export * from './observe';
export * from './regexp';
export * from './string';
//export * from './url';

// key (일반적인 고유값)
/*
-
랜덤, 날짜 결합
var arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
var date = new Date();
return [arr[Math.floor(Math.random() * arr.length)], Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), date.getFullYear(), (Number(date.getMonth()) + 1), date.getDate(), date.getHours(), date.getMinutes()].join('');
-
페이스북 참고
	1. 'f' + : 'f' 문자열에 뒤의 것을 더할 건데, // f
	2. Math.random() : 0~1 사이의 랜덤한 수 생성에 // 0.13190673617646098
	3. * (1 << 30) : 2의 30승을 곱하고, // 0.13190673617646098 * 1073741824 = 141633779.5
	4. .toString(16) : 16진수로 문자열로 표현한 후에, // Number(141633779.9).toString(16) = 87128f3.8
	5. .replace('.', '') : 문자열에서 닷(소수점)을 제거한다. // 'f' + 87128f38 = f87128f38
return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
-
timestamp : new Date().getTime()
*/
export const getKey = () => ['key', new Date().getTime(), 'T', (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);

// 대기 - 예: sleep(10000);
export const sleep = (milliSeconds) => {
	const startTime = new Date().getTime(); 
	while(new Date().getTime() < startTime + milliSeconds);
}

// 페이징 계산 
export const pager = (totalCount, currentPage=1, listSize=20, pageSize=10) => {
	/*
	totalCount : 데이터 전체개수(select count(*) from 테이블)
	currentPage : 현재페이지(no값)
	listSize : 한페이지에 보여질 게시물의 수
	pageSize : 페이지 나누기에 표시될 페이지의 수

	// 페이지번호 리스트 출력
	for(let i=startPage; i<=endPage && i<=totalPage; i++) {
		let number = (currentPage == i) ? `<strong>${i}</strong>` : i;
		// `<a href="?page=${i}">${number}</a>`;
	}
	*/
	if(!totalCount || totalCount <= 0) {
		totalCount = 0;
	}
	if(!currentPage || currentPage <= 0) {
		currentPage = 1;
	}
	if(!listSize || listSize <= 0) {
		listSize = 20;
	}
	if(!pageSize || pageSize <= 0) {
		pageSize = 10;
	}

	let totalPage = Math.ceil(totalCount / listSize) ; // 총페이지수(Total Page)
	let currentBlock = Math.ceil(currentPage / pageSize); // 현재블록(Current Block)
	let totalBlock = Math.ceil(totalPage / pageSize); // 총블록수(Total Block)
	let startPage = (currentBlock - 1) * pageSize + 1; // 블록의 처음 페이지(Start Page)
	let endPage = (currentBlock * pageSize); // 블록의 마지막 페이지(End Page)
	let prevPage = null;
	let nextPage = null;
	if(totalPage < endPage) {
		endPage = totalPage;
	}
	if(currentBlock > 1) {
		prevPage = startPage - 1; // 이전 블록
	}
	if(currentBlock < totalBlock) {
		nextPage = endPage + 1; // 다음 블록
	}

	return {
		totalCount,
		currentPage,
		listSize,
		pageSize,
		totalPage,
		currentBlock,
		totalBlock,
		startPage,
		endPage,
		prevPage,
		nextPage,
	};
}


/**
 * debounce
 * 
 * function someMethodToInvokeDebounced() {}
 *
 * var debounced = debounce(someMethodToInvokeDebounced, 300);
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();    // last invoke of debounced()
 */
export function debounce(fn, delay) {
	let timer, args;
  
	/* istanbul ignore next */
	delay = delay || 0;
  
	function debounced() { // eslint-disable-line require-jsdoc
		args = Array.prototype.slice.call(arguments);
  
		window.clearTimeout(timer);
		timer = window.setTimeout(function() {
			fn.apply(null, args);
		}, delay);
	}
  
	return debounced;
}