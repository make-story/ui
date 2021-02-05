/**
 * element
 */

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