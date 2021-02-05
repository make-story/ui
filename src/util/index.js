/**
 * Util
 * https://medium.com/javascript-in-plain-english/25-javascript-code-solutions-utility-tricks-you-need-to-know-about-3023f7ed993e
 * https://github.com/beforesemicolon/javascript-solutions
 */

// 모듈 조합
// https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/export
export * from './array';
export * from './css';
export * from './date';
export * from './html';
export * from './number';
export * from './object';
export { default as regexp } from './regexp';
export * from './string';

// extend (deep copy)
// extend({}, objA, objB);
export const extend = (out={}) => {
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
}

// key (일반적인 고유값)
export const getKey = () => ['key', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);

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