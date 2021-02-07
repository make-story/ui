/**
 * element
 */
import is from './is';

const FIND_ZWB = /\u200B/g;

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

// Get the focused element
export const focusElement = () => {
	let focused = document.activeElement;

	if(!focused || focused === document.body) {
		focused = null;
	}else if(document.querySelector) {
		focused = document.querySelector(':focus');
	}

	return focused;
}

// margin + border + padding
// parseFloat : 0px -> 0 숫자형으로 반환
export const elementOuterSize = (element, { width=0, height=0, }={}) => {
	// style
	//const style = element.currentStyle || window.getComputedStyle(element); // currentStyle 은 비표준으로 IE 하위버전을 지원
	const style = window.getComputedStyle(element);

	// margin
	let [ marginTop, marginRight, marginBottom, marginLeft ] = [ parseFloat(style.marginTop), parseFloat(style.marginRight), parseFloat(style.marginBottom), parseFloat(style.marginLeft) ];
	width += marginLeft + marginRight;
	height += marginTop + marginBottom;
	
	// border
	let [ borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth ] = [ parseFloat(style.borderTopWidth), parseFloat(style.borderRightWidth), parseFloat(style.borderBottomWidth), parseFloat(style.borderLeftWidth) ];
	width += borderLeftWidth + borderRightWidth;
	height += borderTopWidth + borderBottomWidth;
	
	// padding
	let [ paddingTop, paddingRight, paddingBottom, paddingLeft ] = [ parseFloat(style.paddingTop), parseFloat(style.paddingRight), parseFloat(style.paddingBottom), parseFloat(style.paddingLeft) ];
	width += paddingLeft + paddingRight;
	height += paddingTop + paddingBottom;

	return { 
		style,
		marginTop, marginRight, marginBottom, marginLeft,
		borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth,
		paddingTop, paddingRight, paddingBottom, paddingLeft,
		width, height, 
	};
}

// element 가 현재 브라우저창 크기보다 더 큰지 여부
export const isElementBrowserOverflow = (element) => {
	let is = false;
	let browser = {
		'width': window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
		'height': window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight
	};
	let info = element.getBoundingClientRect(); // padding + border 와 스크롤 위치 변화 포함 (document size 기준 위치 측정)
	let width = 0, height = 0;

	if('width' in info && 'height' in info) {
		width = info.width;
		height = info.height;
	}else {
		//width = offsetWidth;
		width = info.right - info.left;
		//height = offsetHeight;
		height = info.bottom - info.top;
	}
	if(browser.width < width || browser.height < height) {
		is = true;
	}

	return is;
}

// element 위치설정 (css flex 방식으로 구현하는 것을 더욱 추천!)
// topleft, topcenter, topright
// bottomleft, bottomcenter, bottomright
// centerleft, center, centerright
export const elementPosition = (element, position='center'/*string or object*/, { isSet=true/*값을 반환만 할지 여부*/, }={}) => {
	// 위치 설정
	let style, width, height;
	let size = {};
	let center = {
		'left': 0, 
		'top': 0
	};
	let result = {};
	let tempHeight, tempTop;

	// element 크기
	// [주의!!!!!!!!]
	// display 가 none 경우(화면에 렌더 상태가 아님) width, height 추출에 오차가 발생한다.
	// (visibility: hidden 요소의 크기는 측정 가능)
	// 해당 element 가 숨겨져 있을 경우, position: absolute; visibility: hidden; 형태로 보이도록 하여 값 확인 가능
	({ style, width, height } = elementOuterSize(element, { width: element.offsetWidth, height: element.offsetHeight, }));
	width = Math.round(width);
	height = Math.round(height);

	// 이동 가능 포지션 아니면 정지
	// https://developer.mozilla.org/ko/docs/Web/CSS/position
	if(style.position === 'static'/*style.position !== 'fixed'*/) {
		return;
	}

	// center
	if(/center/ig.test(position)) {
		// window, document
		size = {
			'window': {
				"width": window.innerWidth || document.documentElement.clientWidth || 0,
				"height": window.innerHeight || document.documentElement.clientHeight || 0
			},
			'document': {
				"width": Math.max(
					document.body.scrollWidth, document.documentElement.scrollWidth,
					document.body.offsetWidth, document.documentElement.offsetWidth,
					document.documentElement.clientWidth
				),
				"height": Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.documentElement.clientHeight
				)
			}
		};

		// 계산
		if(size.window.width > width) {
			center.left = Math.round(size.window.width / 2) - Math.round(width / 2);
		}else {
			// 윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
			center.left = 0;
		}
		if(size.window.height > height) {
			center.top = Math.round(size.window.height / 2) - Math.round(height / 2);
		}else {
			// 윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우
			center.top = 0;
		}
		// top값 + div높이 > body(window) 전체 높이보다 클경우 (div가 페이지보다 더 아래로 내려가지 않도록함.)
		tempHeight = Math.max(size.window.height, size.document.height);
		tempTop = Math.round(center.top + height);
		if(tempTop > tempHeight) {
			center.top = center.top - Math.round(tempTop - tempHeight);
		}
		// 위치값이 0보다 작지않도록 제어
		if(center.left < 0) {
			center.left = 0;
		}
		if(center.top < 0) {
			center.top = 0;
		}
	}

	// style 초기화
	if(isSet) {
		element.style.removeProperty('top');
		element.style.removeProperty('bottom');
		element.style.removeProperty('left');
		element.style.removeProperty('right');
	}

	// topleft, topcenter, topright
	// bottomleft, bottomcenter, bottomright
	// centerleft, center, centerright
	if(/^top/.test(position)) {
		isSet && (element.style.top = '0px');
	}else if(/^bottom/.test(position)) {
		isSet && (element.style.bottom = '0px');
	}else if(/^center/.test(position)) {
		isSet && (element.style.top = `${center.top}px`);
		result.top = center.top;
	}
	if(/left$/.test(position)) {
		isSet && (element.style.left = '0px');
	}else if(/right$/.test(position)) {
		isSet && (element.style.right = '0px');
	}else if(/center$/.test(position)) {
		isSet && (element.style.left = `${center.left}px`);
		result.left = center.left;
	}

	return result;
}

// 지정된 위치 기준점으로 element 출력
// auto
// topleft, topcenter, topright
// bottomleft, bottomcenter, bottomright
// lefttop, leftmiddle, leftbottom
// righttop, rightmiddle, rightbottom
export const elementPositionStandard = (element, standard/*출력위치 기준이 되는 element*/, position='auto', { isFixed=true, }={}) => {
	let width, height;
	let target = {};
	let info = standard.getBoundingClientRect();
	let scroll = (() => {
		if('pageXOffset' in window && 'pageYOffset' in window) {
			return {'left': window.pageXOffset, 'top': window.pageYOffset};
		}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
			return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
		}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
			return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
		}else {
			return {'left': 0, 'top': 0};
		}
	})();
	let temp;

	// element 정보
	({ width, height } = elementOuterSize(element, { width: element.offsetWidth, height: element.offsetHeight, }));
	width = Math.round(width);
	height = Math.round(height);

	target.left = info.left + (isFixed === true ? 0 : scroll.left);
	target.top = info.top + (isFixed === true ? 0 : scroll.top);
	({ width: target.width, height: target.height } = elementOuterSize(standard, { width: standard.offsetWidth, height: standard.offsetHeight, })); // margin 값까지 포함하면 오차발생
	target.width = Math.round(target.width);
	target.height = Math.round(target.height);

	// topleft, topcenter, topright
	// centerleft, center, centerright
	// bottomleft, bottomcenter, bottomright
	/*if(/^top/.test(position)) {
		element.style.top = `${(target.top - height)}px`;
	}else if(/^bottom/.test(position)) {
		element.style.top = `${(target.top + target.height)}px`;
	}else if(/^center/.test(position)) {
		temp = Math.round(Math.abs(height - target.height) / 2);
		if(height > target.height) {
			element.style.top = `${(target.top - temp)}px`;
		}else {
			element.style.top = `${(target.top + temp)}px`;
		}
	}
	if(/left$/.test(position)) {
		element.style.left = `${(target.left - width)}px`;
	}else if(/right$/.test(position)) {
		element.style.left = `${(target.left + target.width)}px`;
	}else if(/center$/.test(position)) {
		temp = Math.round(Math.abs(width - target.width) / 2);
		if(width > element.width) {
			target.style.left = `${(target.left - temp)}px`;
		}else {
			element.style.left = `${(target.left + temp)}px`;
		}
	}*/

	// auto
	// topleft, topcenter, topright
	// bottomleft, bottomcenter, bottomright
	// lefttop, leftmiddle, leftbottom
	// righttop, rightmiddle, rightbottom
	if(position === 'auto') {
		// 최적화된 영역을 찾아 position 값을 자동 설정해준다.
		position = (() => {
			let position = 'bottomcenter';
			let browser = {};
			let center = {};
			let middle = {};

			// 브라우저 크기를 3등분하여 중앙영역을 구한다.
			// 중앙영역에 위치할 경우는 center 위치
			browser = {
				'width': window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
				'height': window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight
			};
			if(browser.width < info.left || browser.width < info.right || info.top < 0 || browser.height < info.bottom) { // 브라우저창 영역밖에 위치하는지 확인
				// window(브라우저창) 기준에서 document(body) 기준으로 크기를 변경한다.
				browser.width = Math.max(
					document.body.scrollWidth, document.documentElement.scrollWidth,
					document.body.offsetWidth, document.documentElement.offsetWidth,
					document.documentElement.clientWidth
				);
				browser.height = Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.documentElement.clientHeight
				);
			}
			center = {
				'left': browser.width / 2,
				'top': browser.height / 2
			};
			middle = {
				'left': center.left - ((browser.width / 3) / 2), // 중앙영역 좌측
				'right': center.left + ((browser.width / 3) / 2), // 중앙영역 우측
				'top': center.top - ((browser.height / 3) / 2), // 중앙영역 상단
				'bottom': center.top + ((browser.height / 3) / 2) // 중앙영역 하단
			};
			/*
			스크린 화면기준 상단좌측, 상단우측, 중앙, 하단좌측, 하단우측으로 분리하여
			출력기준이 되는 standard 가 어디에 위치하는지 확인한다.
			-------------------------
			| 3    | 2  |    |    4 |
			|      |    |    |      |
			|      -----------      |
			|      | 1  |    |      |
			|------|----|----|------|
			|      |    |    |      |
			|      -----------      |
			|      |    |    |      |
			| 6    | 5  |    |    7 |
			-------------------------
			1: bottomcenter
			2: bottomleft
			3: bottomright
			4: topleft
			5: topright
			*/
			if((middle.left <= info.left && info.left <= middle.right) && (middle.top <= info.top && info.top <= middle.bottom)) { // 1
				position = 'bottomcenter';
			}else if(info.top <= center.top) {
				if(middle.left <= info.left && info.left <= middle.right) { // 2
					position = 'bottomcenter';
				}else if(info.left <= center.left) { // 3
					position = 'bottomleft';
				}else if(center.left <= info.left) { // 4
					position = 'bottomright';
				}
			}else if(center.top <= info.top) {
				if(middle.left <= info.left && info.left <= middle.right) { // 5
					position = 'topcenter';
				}else if(info.left <= center.left) { // 6
					position = 'topleft';
				}else if(center.left <= info.left) { // 7
					position = 'topright';
				}
			}

			return position;
		})();
	}

	element.style.removeProperty('top');
	element.style.removeProperty('bottom');
	element.style.removeProperty('left');
	element.style.removeProperty('right');

	if(/^top/.test(position)) {
		element.style.top = `${(target.top - height)}px`;
	}else if(/^bottom/.test(position)) {
		element.style.top = `${(target.top + target.height)}px`;
	}else if(/^left/.test(position)) {
		element.style.left = `${(target.left - width)}px`;
	}else if(/^right/.test(position)) {
		element.style.left = `${(target.left + target.width)}px`;
	}

	if(/left$/.test(position)) {
		element.style.left = `${target.left}px`;
	}else if(/center$/.test(position)) {
		temp = Math.round(Math.abs(width - target.width) / 2);
		if(width > target.width) {
			element.style.left = `${(target.left - temp)}px`;
		}else {
			element.style.left = `${(target.left + temp)}px`;
		}
	}else if(/right$/.test(position)) {
		temp = Math.round(Math.abs(width - target.width));
		if(width > target.width) {
			element.style.left = `${(target.left - temp)}px`;
		}else {
			element.style.left = `${(target.left + temp)}px`;
		}
	}else if(/top$/.test(position)) {
		element.style.top = `${target.top}px`;
	}else if(/middle$/.test(position)) {
		temp = Math.round(Math.abs(height - target.height) / 2);
		if(height > target.height) {
			element.style.top = `${(target.top - temp)}px`;
		}else {
			element.style.top = `${(target.top + temp)}px`;
		}
	}else if(/bottom$/.test(position)) {
		temp = Math.round(Math.abs(height - target.height));
		if(height > target.height) {
			element.style.top = `${(target.top - temp)}px`;
		}else {
			element.style.top = `${(target.top + temp)}px`;
		}
	}
}

// 서로 겹치지 않도록 제어
export const elementOverlap = (element, targetList, position=''/*이동할 위치*/, { isBrowserOverflow=false/*브라우저 밖으로 나가도 되는지 여부*/, }={}) => {
	const size = {
		'window': {
			"width": window.innerWidth || document.documentElement.clientWidth || 0,
			"height": window.innerHeight || document.documentElement.clientHeight || 0
		},
		'document': {
			"width": Math.max(
				document.body.scrollWidth, document.documentElement.scrollWidth,
				document.body.offsetWidth, document.documentElement.offsetWidth,
				document.documentElement.clientWidth
			),
			"height": Math.max(
				document.body.scrollHeight, document.documentElement.scrollHeight,
				document.body.offsetHeight, document.documentElement.offsetHeight,
				document.documentElement.clientHeight
			)
		}
	};
	//let { style: styleElement } = elementOuterSize(element, { width: element.offsetWidth, height: element.offsetHeight, });
	let rectElement = element.getBoundingClientRect(); // padding + border 와 스크롤 위치 변화 포함 (document size 기준 위치 측정)
	let { left, right, top, bottom, width, height } = rectElement;
	
	// targetList
	if(is.string(targetList)) {
		targetList = document.querySelectorAll(targetList);
	}else if(is.element(targetList)) {
		targetList = [ targetList ];
	}
	if(is.elementList(targetList)) {
		targetList = Array.from(targetList);
	}

	// position 값 확인
	targetList = targetList.filter(target => /*target.style.position !== 'static'*/target.style.position === 'fixed' && !target.isEqualNode(element));

	// 위치 변경 (위 또는 아래)
	targetList.forEach((target) => {
		//let { style: styleTarget } = elementOuterSize(target, { width: target.offsetWidth, height: target.offsetHeight, });
		// https://stackoverflow.com/questions/12066870/how-to-check-if-an-element-is-overlapping-other-elements
		let rectTarget = target.getBoundingClientRect(); // padding + border 와 스크롤 위치 변화 포함 (document size 기준 위치 측정)
		let isOverlap = !(rectElement.right < rectTarget.left || rectElement.left > rectTarget.right || rectElement.bottom < rectTarget.top || rectElement.top > rectTarget.bottom);
		
		// 겹치는 부분 보정
		if(isOverlap) {
			switch(position) {
				case 'top':

					break;
				case 'bottom':

					break
				case 'left':

					break;
				case 'right':

					break;
				default:
					if(rectTarget.height <= top) {
						// 아래에서 위로 이동
						target.style.removeProperty('top');
						target.style.bottom = `${parseFloat(size.window.height - top)}px`;
					}else if(rectTarget.height <= size.window.height - bottom) {
						// 위에서 아래로 이동
						target.style.removeProperty('bottom');
						target.style.top = `${bottom}px`;
					}
					break;
			}
			// 위치갑 최산화
			rectTarget = target.getBoundingClientRect(); // padding + border 와 스크롤 위치 변화 포함 (document size 기준 위치 측정)
		}

		// 다음 검사 범위 수정
		if(0 < rectTarget.top && rectTarget.top < top) { 
			top = rectTarget.top;
		}
		if(bottom < rectTarget.bottom) {
			bottom = rectTarget.bottom;
		}
		if(0 < rectTarget.left && rectTarget.left < left) {
			left = rectTarget.left;
		}
		if(right < rectTarget.right) {
			right = rectTarget.right;
		}
	});
}

// element 가 스크롤 되는 영역 반환
export const elementScrollParent = (element, includeHidden) => {
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
