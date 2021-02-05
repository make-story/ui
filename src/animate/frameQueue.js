/**
 * requestAnimationFrame, cancelAnimationFrame
 */
import browser from '../browser';
import $ from '../dom';
import { 
	regexp,
	numberUnit,
} from '../util';

// 이론적으로 60fps로 호출되지만, 실제로는 인터벌 없이 다음에 사용 가능한 기회에 애니메이션 드로잉(drawing)을 요청
export const setRequestAnimationFrame = (function() { 
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
})();
export const setCancelAnimationFrame = (function() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
	return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
})();
export default (queue) => {
	if(typeof queue !== 'object') {
		return false;
	}else if(!Array.isArray(queue)) {
		queue = [queue];
	}
	
	(function call(queue) {
		let config = queue.shift(); // 현재 순서에 해당하는 정보
		let $element = $(config.element); // 대상 element - .class 가 각각 다른 초기 값을 가질 경우, 예상과 다른 결과가 나올 수 있다.
		let style = config.style; // 애니메이션을 적용할 CSS값 - {CSS 속성: 값}
		let duration = config.duration || 0; // 애니메이션 진행시간 (단위기준: 1s)
		//let easing = config.easing;
		let complete = config.complete;

		let easeOutQuad = function (t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		};
		let easeInOutQuad = function (t, b, c, d) {
			if((t/=d/2) < 1) {
				return c/2*t*t + b;
			}else {
				return -c/2 * ((--t)*(t-2) - 1) + b;
			}
		};
		let total = $element.length;

		// duration 값 변경
		if(duration) {
			duration = Number(duration) * 1000;
		}
		
		$element.each(function(index) {	
			let $element = $(this);
			let start; // 애니메이션 시작값 (기존 css등 설정값)
			let end; // 애니메이션 종료값 (사용자 설정값)
			let key, temp;

			let properties = {};
			let current = 0;
			let increment = 20;
			let request = null;
			let setFrame;

			// start, end 값 추출
			for(key in style) {
				start = $element.css(key); // 기존 설정값
				end = style[key]; // 사용자 설정값
				properties[key] = {}; // 설정할 스타일값 생성
				if(start) {
					temp = numberUnit(start); // 단위 분리
					if(Array.isArray(temp)) { 
						// temp[0]: 원본
						// temp[1]: 숫자
						// temp[2]: 단위 (예: px, em, %, s)
						properties[key].start = start = Number(temp[1] || 0);
						properties[key].start_unit = temp[2];
					}
					temp = numberUnit(end); // 단위 분리
					if(Array.isArray(temp)) { 
						// temp[0]: 원본
						// temp[1]: 숫자
						// temp[2]: 단위 (예: px, em, %, s)
						properties[key].end = end = Number(temp[1] || 0);
						properties[key].end_unit = temp[2];
					}
					// 변경 스타일값 - 시작 스타일값
					properties[key].change = end - start;
				}
			}
	
			// 애니메이션 프레임 함수 (반복실행)
			setFrame = function frame() {
				let key, temp;
				let val, unit;
				
				// increment the time
				current += increment;
				for(key in properties) {
					if(regexp.num.test(properties[key].start) && regexp.num.test(properties[key].change)) {
						// 적용 값
						if(duration <= 0) {
							val = properties[key].end; // 애니메이션 진행시간이 없으므로 바로 적용 
						}else {
							val = easeOutQuad(current, Number(properties[key].start), Number(properties[key].change), duration); 
							if(regexp.pixel_unit_list.test(key)) {
								// opacity 등 소수점 단위는 제외
								val = Math.round(val); // 반올림
							}
						}
						// 단위값이 없을 경우 설정
						unit = properties[key].end_unit || properties[key].start_unit || '';
						if(!unit) {
							// property default value 단위가 px 에 해당하는 것
							if(regexp.pixel_unit_list.test(key)) {
								unit = 'px';
							}else {
								//console.log('[경고] 단위 없음');
								continue;
							}
						}
						// style 적용 
						temp = {};
						temp[key] = val + unit;
						$element.css(temp);
					}
				}
				// frame
				if(current < duration) {
					request = setRequestAnimationFrame(frame);
				}else {
					setCancelAnimationFrame(request);
					// last loop
					if(index === (total-1)) {
						// complete 실행
						if(typeof complete === 'function') {
							complete.call($element, val);
						}
						// 다음 실행할 queue 가 존재할 경우
						if(queue.length) {
							//console.log('[정보] next queue 실행');
							call(queue);
						}
					}
				}
			};
			
			setCancelAnimationFrame(request);
			setFrame();
		});
	})(queue);
};