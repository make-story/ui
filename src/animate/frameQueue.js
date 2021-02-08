/**
 * requestAnimationFrame, cancelAnimationFrame
 * https://javascript.info/js-animation
 */
import browser from '../browser';
import $ from '../dom';
import { 
	regexp,
	numberUnit,
} from '../util';

// 이론적으로 60fps로 호출되지만, 실제로는 인터벌 없이 다음에 사용 가능한 기회에 애니메이션 드로잉(drawing)을 요청
export const requestAnimationFrame = (function() { 
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
})();
export const cancelAnimationFrame = (function() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
	return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
})();

/**
 * js-easing-functions - https://github.com/bameyrick/js-easing-functions/blob/master/src/index.ts
 * https://easings.net/ko
 */
/*let easeOutQuad = function (t, b, c, d) {
	return -c *(t/=d)*(t-2) + b;
};
let easeInOutQuad = function (t, b, c, d) {
	if((t/=d/2) < 1) {
		return c/2*t*t + b;
	}else {
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}
};*/
export const easingFunctions = {
	easeInQuad(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * (elapsed /= duration) * elapsed + initialValue;
	},
	easeOutQuad(elapsed, initialValue, amountOfChange, duration) {
		return -amountOfChange * (elapsed /= duration) * (elapsed - 2) + initialValue;
	},
	easeInOutQuad(elapsed, initialValue, amountOfChange, duration) {
		if((elapsed /= duration / 2) < 1) {
			return amountOfChange / 2 * elapsed * elapsed + initialValue;
		}
		return -amountOfChange / 2 * (--elapsed * (elapsed - 2) - 1) + initialValue;
	},
	easeInCubic(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * (elapsed /= duration) * elapsed * elapsed + initialValue;
	},
	easeOutCubic(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * ((elapsed = elapsed / duration - 1) * elapsed * elapsed + 1) + initialValue;
	},
	easeInOutCubic(elapsed, initialValue, amountOfChange, duration) {
		if((elapsed /= duration / 2) < 1) {
			return amountOfChange / 2 * elapsed * elapsed * elapsed + initialValue;
		}
		return amountOfChange / 2 * ((elapsed -= 2) * elapsed * elapsed + 2) + initialValue;
	},
	easeInQuart(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * (elapsed /= duration) * elapsed * elapsed * elapsed + initialValue;
	},
	easeOutQuart(elapsed, initialValue, amountOfChange, duration) {
		return -amountOfChange * ((elapsed = elapsed / duration - 1) * elapsed * elapsed * elapsed - 1) + initialValue;
	},
	easeInOutQuart(elapsed, initialValue, amountOfChange, duration) {
		if((elapsed /= duration / 2) < 1) {
			return amountOfChange / 2 * elapsed * elapsed * elapsed * elapsed + initialValue;
		}
		return -amountOfChange / 2 * ((elapsed -= 2) * elapsed * elapsed * elapsed - 2) + initialValue;
	},
	easeInQuint(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * (elapsed /= duration) * elapsed * elapsed * elapsed * elapsed + initialValue;
	},
	easeOutQuint(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * ((elapsed = elapsed / duration - 1) * elapsed * elapsed * elapsed * elapsed + 1) + initialValue;
	},
	easeInOutQuint(elapsed, initialValue, amountOfChange, duration) {
		if((elapsed /= duration / 2) < 1) {
			return amountOfChange / 2 * elapsed * elapsed * elapsed * elapsed * elapsed + initialValue;
		}
		return amountOfChange / 2 * ((elapsed -= 2) * elapsed * elapsed * elapsed * elapsed + 2) + initialValue;
	},
	easeInSine(elapsed, initialValue, amountOfChange, duration) {
		return -amountOfChange * Math.cos(elapsed / duration * (Math.PI / 2)) + amountOfChange + initialValue;
	},
	easeOutSine(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * Math.sin(elapsed / duration * (Math.PI / 2)) + initialValue;
	},
	easeInOutSine(elapsed, initialValue, amountOfChange, duration) {
		return -amountOfChange / 2 * (Math.cos(Math.PI * elapsed / duration) - 1) + initialValue;
	},
	easeInExpo(elapsed, initialValue, amountOfChange, duration) {
		return elapsed === 0 ? initialValue : amountOfChange * Math.pow(2, 10 * (elapsed / duration - 1)) + initialValue;
	},
	easeOutExpo(elapsed, initialValue, amountOfChange, duration) {
		return elapsed === duration ? initialValue + amountOfChange : amountOfChange * (-Math.pow(2, -10 * elapsed / duration) + 1) + initialValue;
	},
	easeInOutExpo(elapsed, initialValue, amountOfChange, duration) {
		if(elapsed === 0) {
			return initialValue;
		}
		if(elapsed === duration) {
			return initialValue + amountOfChange;
		}
		if((elapsed /= duration / 2) < 1) {
			return amountOfChange / 2 * Math.pow(2, 10 * (elapsed - 1)) + initialValue;
		}
		return amountOfChange / 2 * (-Math.pow(2, -10 * --elapsed) + 2) + initialValue;
	},
	easeInCirc(elapsed, initialValue, amountOfChange, duration) {
		return -amountOfChange * (Math.sqrt(1 - (elapsed /= duration) * elapsed) - 1) + initialValue;
	},
	easeOutCirc(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange * Math.sqrt(1 - (elapsed = elapsed / duration - 1) * elapsed) + initialValue;
	},
	easeInOutCirc(elapsed, initialValue, amountOfChange, duration) {
		if((elapsed /= duration / 2) < 1) {
			return -amountOfChange / 2 * (Math.sqrt(1 - elapsed * elapsed) - 1) + initialValue;
		}
		return amountOfChange / 2 * (Math.sqrt(1 - (elapsed -= 2) * elapsed) + 1) + initialValue;
	},
	easeInElastic(elapsed, initialValue, amountOfChange, duration) {
		let s = 1.70158;
		let p = 0;
		let a = amountOfChange;
		if(elapsed === 0) {
			return initialValue;
		}
		if((elapsed /= duration) === 1) {
			return initialValue + amountOfChange;
		}
		if(!p) {
			p = duration * 0.3;
		}
		if(a < Math.abs(amountOfChange)) {
			a = amountOfChange;
			s = p / 4;
		}else {
			s = p / (2 * Math.PI) * Math.asin(amountOfChange / a);
		}
		return -(a * Math.pow(2, 10 * (elapsed -= 1)) * Math.sin((elapsed * duration - s) * (2 * Math.PI) / p)) + initialValue;
	},
	easeOutElastic(elapsed, initialValue, amountOfChange, duration) {
		let s = 1.70158;
		let p = 0;
		let a = amountOfChange;
		if(elapsed === 0) {
			return initialValue;
		}
		if((elapsed /= duration) === 1) {
			return initialValue + amountOfChange;
		}
		if(!p) {
			p = duration * 0.3;
		}
		if(a < Math.abs(amountOfChange)) {
			a = amountOfChange;
			s = p / 4;
		}else {
			s = p / (2 * Math.PI) * Math.asin(amountOfChange / a);
		}
		return a * Math.pow(2, -10 * elapsed) * Math.sin((elapsed * duration - s) * (2 * Math.PI) / p) + amountOfChange + initialValue;
	},
	easeInOutElastic(elapsed, initialValue, amountOfChange, duration) {
		let s = 1.70158;
		let p = 0;
		let a = amountOfChange;
		if(elapsed === 0) {
			return initialValue;
		}
		if((elapsed /= duration / 2) === 2) {
			return initialValue + amountOfChange;
		}
		if(!p) {
			p = duration * (0.3 * 1.5);
		}
		if(a < Math.abs(amountOfChange)) {
			a = amountOfChange;
			s = p / 4;
		}else {
			s = p / (2 * Math.PI) * Math.asin(amountOfChange / a);
		}
		if(elapsed < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (elapsed -= 1)) * Math.sin((elapsed * duration - s) * (2 * Math.PI) / p)) + initialValue;
		}
		return (
			a * Math.pow(2, -10 * (elapsed -= 1)) * Math.sin((elapsed * duration - s) * (2 * Math.PI) / p) * 0.5 + amountOfChange + initialValue
		);
	},
	easeInBack(elapsed, initialValue, amountOfChange, duration, s = 1.70158) {
		return amountOfChange * (elapsed /= duration) * elapsed * ((s + 1) * elapsed - s) + initialValue;
	},
	easeOutBack(elapsed, initialValue, amountOfChange, duration, s = 1.70158) {
		return amountOfChange * ((elapsed = elapsed / duration - 1) * elapsed * ((s + 1) * elapsed + s) + 1) + initialValue;
	},
	easeInOutBack(elapsed, initialValue, amountOfChange, duration, s = 1.70158) {
		if((elapsed /= duration / 2) < 1) {
			return amountOfChange / 2 * (elapsed * elapsed * (((s *= 1.525) + 1) * elapsed - s)) + initialValue;
		}
		return amountOfChange / 2 * ((elapsed -= 2) * elapsed * (((s *= 1.525) + 1) * elapsed + s) + 2) + initialValue;
	},
	easeInBounce(elapsed, initialValue, amountOfChange, duration) {
		return amountOfChange - easeOutBounce(duration - elapsed, 0, amountOfChange, duration) + initialValue;
	},
	easeOutBounce(elapsed, initialValue, amountOfChange, duration) {
		if((elapsed /= duration) < 1 / 2.75) {
			return amountOfChange * (7.5625 * elapsed * elapsed) + initialValue;
		}else if(elapsed < 2 / 2.75) {
			return amountOfChange * (7.5625 * (elapsed -= 1.5 / 2.75) * elapsed + 0.75) + initialValue;
		}else if(elapsed < 2.5 / 2.75) {
			return amountOfChange * (7.5625 * (elapsed -= 2.25 / 2.75) * elapsed + 0.9375) + initialValue;
		}else {
			return amountOfChange * (7.5625 * (elapsed -= 2.625 / 2.75) * elapsed + 0.984375) + initialValue;
		}
	},
	easeInOutBounce(elapsed, initialValue, amountOfChange, duration) {
		if(elapsed < duration / 2) {
			return easeInBounce(elapsed * 2, 0, amountOfChange, duration) * 0.5 + initialValue;
		}
		return easeOutBounce(elapsed * 2 - duration, 0, amountOfChange, duration) * 0.5 + amountOfChange * 0.5 + initialValue;
	},
}

// frame 값 계산
export const frameValue = (start, end, { elapsed=20/*프레임 경과값, 프레임을 재생할 때 증가 값*/, easing='easeOutQuad', duration=0/*애니메이션 진행시간 (단위기준: 1s)*/, }={}) => {
	let change = end - start;
	let value = end;

	if(duration <= 0) {
		value = end; // 애니메이션 진행시간이 없으므로 바로 적용 
	}else {
		value = easingFunctions[easing](elapsed, Number(start), Number(change), duration); 
	}

	return value;
}

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
		let easing = config.easing || 'easeOutQuad';
		let complete = config.complete;
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
			let elapsed = 0;
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
			setFrame = function setFrame() {
				let key, temp;
				let value, unit;
				
				// increment the time
				elapsed += increment;
				for(key in properties) {
					if(regexp.num.test(properties[key].start) && regexp.num.test(properties[key].change)) {
						// 적용 값
						if(duration <= 0) {
							value = properties[key].end; // 애니메이션 진행시간이 없으므로 바로 적용 
						}else {
							//value = easeOutQuad(elapsed, Number(properties[key].start), Number(properties[key].change), duration); 
							value = frameValue(properties[key].start, properties[key].end, {
								elapsed,
								easing,
								duration,
							});
							if(regexp.pixel_unit_list.test(key)) {
								// opacity 등 소수점 단위는 제외
								value = Math.round(value); // 반올림
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
						temp[key] = value + unit;
						$element.css(temp);
					}
				}

				// frame
				if(elapsed < duration) {
					request = requestAnimationFrame(setFrame);
				}else {
					cancelAnimationFrame(request);
					// last loop
					if(index === (total-1)) {
						// complete 실행
						if(typeof complete === 'function') {
							complete.call($element, value);
						}
						// 다음 실행할 queue 가 존재할 경우
						if(queue.length) {
							//console.log('[정보] next queue 실행');
							call(queue);
						}
					}
				}
			};
			
			cancelAnimationFrame(request);
			setFrame();
		});
	})(queue);
};