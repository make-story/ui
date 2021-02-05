/**
 * lazy
 */
/*
const observer = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			
		}
	});
});
observer.observe(element);
observer.unobserve(element);
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
};