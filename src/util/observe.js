/**
 * lazy
 */

// 스크롤 페이징 체크
export const paging = (target) => {
	let rect = target.getBoundingClientRect();
	let documentHeigt = Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.documentElement.clientHeight
	);
	let windowHeight = window.innerHeight || document.documentElement.clientHeight;
	let interval = 30; // 페이징 작동 여유값

	// 작동 여백 
	if(interval < Number(windowHeight) / 2) {
		interval = Number(windowHeight) / 2;
	}
	if(Number(documentHeigt) < interval) {
		interval = Number(documentHeigt) / 2;
	}
	if(target.offsetHeight < interval) {
		interval = target.offsetHeight;
	}

	// element 가 존재하며(width, height 검사), 최하단이 윈도우 높이값보다 작을 경우
	if(0 < target.offsetWidth && 0 < target.offsetHeight && 0 < rect.bottom && 0 < windowHeight && (rect.bottom - interval) <= windowHeight) {
		// 콜백 실행!
		
	}
}


// 고정이 필요한 요소가 삽입되는 곳 ([data-fixed-wrapper])
export const wrapperFixed = () => {
	let elementHeader = document.querySelector('header');
	let elementWrapper = null;

	if(!elementHeader) {
		return elementWrapper;
	}
	elementWrapper = elementHeader.querySelector('[data-fixed-wrapper]') || document.querySelector('[data-fixed-wrapper]');
	if(!elementWrapper) {
		elementWrapper = document.createElement('div');
		elementWrapper.setAttribute('data-fixed-wrapper', '');
		elementHeader.appendChild(elementWrapper);
	}
	return elementWrapper; 
};


// 상단 고정 기능
export const scrollFixed = (elementModule, elementFixed) => {
	let elementHeader = document.querySelector('header');
	let elementWrapper = elementHeader && elementHeader.querySelector('[data-fixed-wrapper]');
	let original, copy, target;
	let rect = {};
	let height = {};
	let line = 0;

	if(!elementModule || !elementFixed || !elementWrapper) {
		//wrapperFixed();
		return;
	}
	original = Array.prototype.filter.call(elementWrapper.querySelectorAll('[data-fixed-copy="false"]'), element => element.isEqualNode(elementFixed)); // 이미 헤더에 고정되어 있는지 확인 
	copy = elementModule.querySelector('[data-fixed-copy="true"]'); // 해당 고정타겟 복사본 
	target = copy || elementFixed;
	if(!target) {
		return;
	}
	rect = {
		wrapper: elementWrapper.getBoundingClientRect(),
		module: elementModule.getBoundingClientRect(),
		target: target.getBoundingClientRect(),
	};
	height = {
		module: elementModule.clientHeight || 0, // 모듈 영역내에서만 상단 고정 관련 기능이 실행
		target: target.clientHeight || 0, // 상단 고정되었을 때, 스크롤이 모듈 하단 영역을 벗어나는지 확인
	};
	line = rect.wrapper && rect.wrapper.top || 0; // 상단 고정을 실행시키는 기준 선 (header 위치)
	
	//console.log(rect);
	//console.log(elementWrapper);
	//console.log(newValue, oldValue);
	//console.log('line', line);
	//console.log('height', height);
	//console.log('module', rect.module);
	//console.log('target', rect.target);
	//console.log('original', original);

	// 영역검사 (해당 모듈 고정영역 적용여부)
	if(
		(0 <= line && 0 < height.target && height.target < height.module/*모듈 영역이 고정 영역보다 커야한다.*/) && 
		(rect.module.top <= line/*모듈영역 상단 기준*/ && (line + height.target) <= rect.module.bottom/*모듈영역 하단 기준*/) && 
		rect.target.top < line
	) {
		// append 방식
		if(!original.length) {
			// 복사본을 header에 올리지 않는 이유는, 원본에 스와이프 등의 이벤트가 설정되어 있을 수 있기 때문 
			copy = elementFixed.cloneNode(true);
			//copy.setAttribute('data-fixed-index', '');
			copy.setAttribute('data-fixed-copy', 'true');
			//elementFixed.setAttribute('data-fixed-index', '');
			elementFixed.setAttribute('data-fixed-copy', 'false');
			elementFixed.parentNode.insertBefore(copy, elementFixed); // 복사본을 원본 위치에 넣는다.
			elementWrapper.appendChild(elementFixed); // 원본을 header 에 놓어 고정시킨다.
			//elementModule.setAttribute('data-fixed-index', '');
		}
	}else {
		// append 방식
		if(original.length) {
			copy = elementModule.querySelector('[data-fixed-copy="true"]');
			if(copy) {
				copy.parentNode.insertBefore(elementFixed, copy);
				copy.parentNode.removeChild(copy);
			}else {
				elementModule.insertBefore(elementFixed, elementModule.firstChild);
			}
			//elementFixed.setAttribute('data-fixed-index', '');
			//elementModule.setAttribute('data-fixed-index', '');
		}
	}
}


// DOM 가시성 감시
// IntersectionObserver
// https://heropy.blog/2019/10/27/intersection-observer/
// IE 지원(polyfill) : https://github.com/w3c/IntersectionObserver/tree/main/polyfill
//   $ npm i intersection-observer
//   import 'intersection-observer'
export const observerIntersection = (target, callback, options={}) => {
	/*const callback = (entries, observer) => {
		entries.forEach(entry => {
			// boundingClientRect: 관찰 대상의 사각형 정보(DOMRectReadOnly)
			// intersectionRect: 관찰 대상의 교차한 영역 정보(DOMRectReadOnly)
			// intersectionRatio: 관찰 대상의 교차한 영역 백분율(intersectionRect 영역에서 boundingClientRect 영역까지 비율, Number)
			// isIntersecting: 관찰 대상의 교차 상태(Boolean)
			// rootBounds: 지정한 루트 요소의 사각형 정보(DOMRectReadOnly)
			// target: 관찰 대상 요소(Element)
			// time: 변경이 발생한 시간 정보(DOMHighResTimeStamp)
			console.log(entry); // entry is 'IntersectionObserverEntry'

			// 가시성의 변화가 있으면 관찰 대상 전체에 대한 콜백이 실행되므로,
			// 관찰 대상의 교차 상태가 false일(보이지 않는) 경우 실행하지 않음.
			if(!entry.isIntersecting) {
				return
			}
	  
			// 관찰 대상의 교차 상태가 true일(보이는) 경우 실행.
			// ...
  
			// 위 실행을 처리하고(1회) 관찰 중지
			observer.unobserve(entry.target);
		});
	};*/
	/*const options = {
		// 타겟의 가시성을 검사하기 위해 뷰포트 대신 사용할 요소 객체(루트 요소)를 지정
		// 기본값 null 일 경우 브라우저의 뷰포트가 기본 사용
		root: document.getElementById('my-viewport'),
		// 바깥 여백(Margin)을 이용해 Root 범위를 확장하거나 축소할 수 있습니다.
		// CSS의 margin과 같이 4단계로 여백을 설정할 수 있으며, px 또는 %로 나타낼 수 있습니다.
		// 기본값은 0px 0px 0px 0px이며 단위를 꼭 입력해야 합니다.
		rootMargin: '200px -100px',
		// 옵저버가 실행되기 위해 타겟의 가시성이 얼마나 필요한지 백분율로 표시합니다.
		// 기본값은 Array 타입의 [0]이지만 Number 타입의 단일 값으로도 작성할 수 있습니다.
		//   0: 타겟의 가장자리 픽셀이 Root 범위를 교차하는 순간(타겟의 가시성이 0%일 때) 옵저버가 실행됩니다.
		//   0.3: 타겟의 가시성 30%일 때 옵저버가 실행됩니다.
		//   [0, 0.3, 1]: 타겟의 가시성이 0%, 30%, 100%일 때 모두 옵저버가 실행됩니다.
		threshold: 0.3 // or `threshold: [0.3]`
	};*/

	const observer = new IntersectionObserver(callback, options); // 관찰자 초기화
	/*if(target.length) { // nodeList
		target = Array.from(target);
	}else */if(!Array.isArray(target)) {
		target = [ target ];
	}
	target.forEach(element => {
		observer.observe(element); // 관찰할 대상(요소) 등록
	});
	// observer.unobserve(element); // 관찰 정지
	// observer.disconnect(); // IntersectionObserver 인스턴스가 관찰하는 모든 요소의 관찰을 중지
	return observer;
}


// DOM 변경 감시
// MutationObserver
// https://developer.mozilla.org/ko/docs/Web/API/MutationObserver
// IE11 이상 지원
export const observerMutation = (target, callback, options={}) => {
	/*const callback = (mutations, observer) => {
		mutations.forEach(mutation => {
			switch (mutation.type) {
				case 'attributes':
					// the name of the changed attribute is in
					// mutation.attributeName
					// and its old value is in mutation.oldValue
					// the current value can be retrieved with 
					// target.getAttribute(mutation.attributeName)
					break;
	
				case 'childList':
					// any added nodes are in mutation.addedNodes
					// any removed nodes are in mutation.removedNodes
					break;
				}
		});
	};*/
	/*const options = {
		childList: true, // 대상 노드의 하위 요소의 추가 및 제거를 감시합니다.
		attributes: true, // 대상 노드의 속성에 대한 변화를 감시합니다.
		characterData: true, // 대상 노드의 데이터에 대한 변화를 감시합니다.
		subtree: true, // 대상 노드의 자식 뿐만 아니라 손자 이후로 모두 감시합니다.
		attributeOldValue: true, // 대상 노드의 속성 변경 전의 내용도 기록에 남깁니다.
		characterDataOldValue: true, // 대상 노드의 데이터 변경 전의 내용도 기록에 남깁니다.
		attributeFilter: ['A', 'B',], // 모든 속성 돌연변이를 관찰 할 필요가 없는 경우 속성 네임 스페이스없이 속성 로컬 이름의 배열로 설정 합니다.
	};*/

	const observer = new MutationObserver(callback);
	observer.observe(target, options); 
	return observer;
}