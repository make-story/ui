/**
 * element
 */
import is from './is';

const FIND_ZWB = /\u200B/g;

// element 가 스크롤 되는 영역 반환
export const scrollParent = (element, includeHidden) => {
	/* 
	// 스크롤 막대가 존재하는지 여부로 찾기
	function getScrollParent(node) {
		if(node == null) {
			return null;
		}
		if(node.scrollHeight > node.clientHeight) {
			return node;
		}else {
			return getScrollParent(node.parentNode);
		}
	}
	*/
	let style = getComputedStyle(element); // https://developer.mozilla.org/ko/docs/Web/API/Window/getComputedStyle
	let excludeStaticParent = style.position === "absolute";
	let overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

	if(style.position === "fixed") return document.body;
	for(let parent = element; (parent = parent.parentElement); ) {
		style = getComputedStyle(parent);
		if(excludeStaticParent && style.position === "static") {
			continue;
		}
		if(overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
	}

	return document.body;
}

// node name
export const nodeName = function(node) {
	if(is.element(node)) {
		return node.tagName;
	}
	return 'TEXT';
};

// text length
export const textLength = function(node) {
	let length;
	if(is.element(node)) {
		length = node.textContent.replace(FIND_ZWB, '').length;
	}else if(is.textNode(node)) {
		length = node.nodeValue.replace(FIND_ZWB, '').length;
	}
	return length;
};

// offset length
export const offsetLength = function(node) {
	let length;
	if(is.element(node)) {
		length = node.childNodes.length;
	}else if (is.textNode(node)) {
		length = node.nodeValue.replace(FIND_ZWB, '').length;
	}  
	return length;
};