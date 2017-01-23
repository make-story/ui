/*
Animate

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility


-
사용예

-
jQuery 또는 api.dom 에 종속적 실행
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || ((!global.api || !global.api.dom) && !global.jQuery)) {
		return false;
	}else if(!global.api) {
		global.api = {};
	}
	api.animate = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	// 환경정보
	var env = {};
	if(global.api && global.api.env) {
		env = global.api.env;
	}else {
		env = {
			"check": { // true, false 
				"transform": false,
				"transition": false,
				"animation": false
			},
			"event": {
				// 트랜지션, 애니메이션
				"transitionend": "transitionend",
				"animationstart": "animationstart",
				"animationiteration": "animationiteration",
				"animationend": "animationend"
			}
		};
		(function() {
			var div = document.createElement('div');
			var transforms = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"]; // css check (IE9 벤더프리픽스로 사용가능, IE10이상 공식지원)
			var transitions = { // event check (IE10이상 공식지원)
				"transition": "transitionend", 
				"WebkitTransition": "webkitTransitionEnd", 
				"MozTransition": "transitionend", 
				"OTransition": "oTransitionEnd",
				"msTransition": "MSTransitionEnd"
			};
			var animations = { // event check (IE10이상 공식지원)
				"animation": ['animationstart', 'animationiteration', 'animationend'], 
				"WebkitAnimation": ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd'],
				"MozAnimation": ['animationstart', 'animationiteration', 'animationend'], 
				"OAnimation": ['oanimationstart', 'oanimationiteration', 'oanimationend'],
				"msAnimation": ['MSAnimationStart', 'MSAnimationIteration', 'MSAnimationEnd']
			};
			var key;

			// 트랜스폼
			for(key in transforms) {
				if(div.style[transforms[key]] !== undefined) {
					env['check']['transform'] = true;
					break;
				}
			}
			// 트랜지션
			for(key in transitions) {
				if(div.style[key] !== undefined) {
					env['check']['transition'] = true;
					env['event']['transitionend'] = transitions[key];
					break;
				}
			}
			// 애니메이션
			for(key in animations) {
				if(div.style[key] !== undefined) {
					env['check']['animation'] = true;
					env['event']['animationstart'] = animations[key][0];
					env['event']['animationiteration'] = animations[key][1];
					env['event']['animationend'] = animations[key][2];
					break;
				}
			}
		})();
	}

	// requestAnimationFrame, cancelAnimationFrame
	var setRequestAnimationFrame = (function() { 
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
	})();
	var setCancelAnimationFrame = (function() {
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
		return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
	})();
	var animationFrameQueue = function(queue) {
		/*
		-
		사용예
		api.animationFrameQueue({'element': '.h2', 'style': {'left': '100px', 'top': '100px', 'width': '100px', 'height': '100px'}});
		api.animationFrameQueue([{'element': api.dom('#h2'), 'style': {'left': '100px', 'top': '100px'}}, {...}, ... ]);
		*/
		if(typeof queue !== 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}
		var request = null;

		(function call(queue) {
			var target = queue.shift(); // 현재 순서에 해당하는 정보
			var element = $(target['element']); // 대상 element
			var original = element.get(); // 대상 element 리스트 반환
			var style = target['style']; // 애니메이션을 적용할 CSS값 - {CSS 속성: 값}
			var duration = target['duration'] || 800; // 애니메이션 진행시간
			//var easing = 'swing';
			var complete = target['complete'];

			//
			var current = 0;
			var increment = 20;
			var start = 0; // 애니메이션 시작값 (기존 css등 설정값)
			var end = 0; // 애니메이션 종료값 (사용자 설정값)
			var change = 0;
			var properties = {};
			var easeOutQuad = function (t, b, c, d) {
				return -c *(t/=d)*(t-2) + b;
			};
			var key, i, tmp;

			// start, end 값 추출
			for(key in style) {
				for(i in original) {
					//start = original[i]['style'][key]; // 기존 설정값
					start = $(original[i]).css(key); // 기존 설정값
					end = style[key]; // 사용자 설정값
					if(start) {
						// 설정할 스타일 생성
						properties[key] = {};
						tmp = getNumberUnit(start); // 단위 분리
						if(Array.isArray(tmp)) { 
							// tmp[0]: 원본
							// tmp[1]: 숫자
							// tmp[2]: 단위 (예: px, em, %, s)
							properties[key]['start'] = start = Number(tmp[1] || 0);
							properties[key]['start_unit'] = tmp[2];
						}
						tmp = getNumberUnit(end); // 단위 분리
						if(Array.isArray(tmp)) { 
							// tmp[0]: 원본
							// tmp[1]: 숫자
							// tmp[2]: 단위 (예: px, em, %, s)
							properties[key]['end'] = end = Number(tmp[1] || 0);
							properties[key]['end_unit'] = tmp[2];
						}
						// 변경 스타일값 - 시작 스타일값
						properties[key]['change'] = change = end - start;
					}
				}
			}

			// 애니메이션 프레임 함수 (반복실행)
			var setFrame = function frame() {
				var key, i, val, unit;
				// increment the time
				current += increment;
				for(key in properties) {
					if(regexp.num.test(properties[key]['start']) && regexp.num.test(properties[key]['change'])) {
						val = easeOutQuad(current, Number(properties[key]['start']), Number(properties[key]['change']), duration); 
						if(regexp.pixel_unit_list.test(key)) {
							// opacity 등 소수점 단위는 제외
							val = Math.round(val); // 반올림
						}
						// 단위값이 없을 경우 설정
						unit = properties[key]['end_unit'] || properties[key]['start_unit'] || '';
						if(!unit) {
							// property default value 단위가 px 에 해당하는 것
							if(regexp.pixel_unit_list.test(key)) {
								unit = 'px';
							}else {
								//console.log('[경고] 단위 없음');
								continue;
							}
						}
						for(i in original) {
							original[i]['style'][key] = val + unit;
						}
					}
				}
				//
				if(current < duration) {
					// frame
					request = setRequestAnimationFrame(frame);
				}else {
					setCancelAnimationFrame(request);
					// complete 실행
					if(typeof complete === 'function') {
						complete.call(original, val);
					}
					// 다음 실행할 queue 가 존재할 경우
					if(queue.length) {
						//console.log('[정보] next queue 실행');
						call(queue);
					}
				}
			};
			if(original) {
				setCancelAnimationFrame(request);
				setFrame();
			}
		})(queue);
	};

	// 애니메이션 순차 실행 (이미 실행되고 있는 element는 대기 후 실행)
	// element.style 로 애니메이션을 주는 것이 아닌, 애니메이션값이 있는 class 값을 toggle 하는 방식이다.
	// https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support
	var animationQueue = function(queue) {
		/*
		-
		사용예
		api.animationQueue([{'element': api.dom('#view'), 'animation': 'pt-page-moveToRight'}, {'element': api.dom('#list'), 'animation': 'pt-page-moveToRight'}]);
		api.animationQueue({'element': api.dom('#view'), 'animation': 'pt-page-moveToLeft', 'complete': function() { ... }});
		*/
		if(typeof queue !== 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}

		(function call(queue) {
			var target = queue.shift(); // 현재 순서에 해당하는 정보
			var element = $(target['element']); // 대상 element
			var animation = target['animation']; // animation 적용 class name
			var complete = target['complete']; // 애니메이션 종료 후 콜백 (complete)
			var handler;
			var time;

			//
			handler = function(event) {
				var event = event || window.event;
				//console.log('[정보] 이벤트타입: ' + event.type);
				switch(event.type) {
					case "animationstart":
					case "animationiteration":
						break;
					case "animationend":
						element.removeClass(animation);
						element.off(env.event.animationend + '.EVENT_ANIMATIONEND_QUEUE');
						element.removeProp('animationState');

						// complete 실행
						if(typeof complete === 'function') {
							complete.call(this, event);
						}
						// 다음 실행할 queue 가 존재할 경우
						if(queue.length) {
							//console.log('[정보] next queue 실행');
							call(queue);
						}
						break;
				}
			};

			// element 에 이미 진행중인 애니메이션이 있다면, 대기 했다가 실행한다.
			time = window.setInterval(function() {
				if(element.prop('animationState') !== 'running') { 
					//console.log('[정보] 애니메이션 실행');
					window.clearInterval(time);
					element.prop({'animationState': 'running'});
					element.addClass(animation).on(env.event.animationend + '.EVENT_ANIMATIONEND_QUEUE', handler);
				}else {
					// 현재 실행중인 애니메이션이 존재 (대기 후 이전 애니메이션이 종료되면 실행)
					//console.log('[정보] 애니메이션 대기');
					//console.log('animationState: ' + element.prop('animationState'));
				}
			}, 1);
		})(queue);
	};

	// 트랜지션 순차실행 
	var transitionQueue = function(queue) {
		/*
		-
		사용예
		api.transitionQueue({'element': api.dom('#view'), 'transition': {'left': '100px', 'top': '100px'}});
		api.transitionQueue([{'element': api.dom('#view'), 'transition': {'left': '100px', 'top': '100px'}}, {...}, ... ]);
		*/
		if(typeof queue !== 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}
		var state = { // 트랜지션 종료 후 적용할 초기 style
			/*
			// 기본값 http://www.w3schools.com/cssref/css3_pr_transform.asp
			transition: 
			transition-property: all
			transition-duration: 0s
			transition-timing-function: ease 또는 cubic-bezier(0.25, 0.1, 0.25, 1)
			transition-delay: 0s
			*/
			'msTransition': /^$/,
			'OTransition': /^$/,
			'MozTransition': /^$/,
			'WebkitTransition': /^$/,
			'transition': /^$/,

			'msTransitionProperty': /^(all)$/i,
			'OTransitionProperty': /^(all)$/i,
			'MozTransitionProperty': /^(all)$/i,
			'WebkitTransitionProperty': /^(all)$/i,
			'transitionProperty': /^(all)$/i,

			'msTransitionDuration': /^(0s)$/i,
			'OTransitionDuration': /^(0s)$/i,
			'MozTransitionDuration': /^(0s)$/i,
			'WebkitTransitionDuration': /^(0s)$/i,
			'transitionDuration': /^(0s)$/i,

			'msTransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
			'OTtransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
			'MozTransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
			'WebkitTransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
			'transitionTimingFunction': /^(ease|cubic-bezier+)$/i,

			'msTransitionDelay': /^(0s)$/i,
			'OTransitionDelay': /^(0s)$/i,
			'MozTransitionDelay': /^(0s)$/i,
			'WebkitTransitionDelay': /^(0s)$/i,
			'transitionDelay': /^(0s)$/i
		};

		(function call(queue) {
			var target = queue.shift(); // 현재 순서에 해당하는 정보
			var element = $(target['element']); // 대상 element
			var original = element.get();
			var transition = target['transition']; // 트랜지션을 적용할 CSS값 - {CSS 속성: 값}
			var duration = target['duration'] || 600; 
			var easing = target['easing'] || 'ease'; 
			var delay = target['delay'] || 0; // 효과가 시작할 때까지의 딜레이
			var complete = target['complete']; // 애니메이션 종료 후 콜백 (complete)

			var i, max, key, tmp;
			var properties = {};

			// transition 값 확인
			for(key in transition) {
				if(!/^(animation*|transition*)/i.test(key)) { // animation, transition 관련작업은 제외됨
					properties[key] = transition[key];
				}
			}

			// 초기값 저장 / transition 설정
			for(i=0, max=original.length; i<max; i++) {
				if(typeof original[i]['storage'] !== 'object') {
					original[i]['storage'] = {};
				}

				// 현재 상태값 저장
				if(typeof original[i]['storage']['transition'] !== 'object') {
					original[i]['storage']['transition'] = {};
					for(key in state) {
						tmp = original[i]['style'][key];
						//tmp = $(original[i]).css(key);
						if(tmp && !state[key].test(tmp)) { 
							// 현재 element에 설정된 style의 값이 state 목록에 지정된 기본값(style property default value)이 아니므로 
							// 현재 설정된 값을 저장(종료 후 현재값으로 재설정)
							original[i]['storage']['transition'][key] = tmp;
						}else { 
							// 현재 element에 설정된 style의 값이 state 목록에 지정된 기본값(style property default value)과 동일하거나 없으므로 
							// 작업 후 해당 property 초기화(삭제)
							original[i]['storage']['transition'][key] = null;
						}
					}
				}

				// transition 설정
				original[i]['style'].msTransitionProperty = original[i]['style'].OTransitionProperty = original[i]['style'].MozTransitionProperty = original[i]['style'].WebkitTransitionProperty = original[i]['style'].transitionProperty = Object.keys(properties).join(',');
				original[i]['style'].msTransitionDuration = original[i]['style'].OTransitionDuration = original[i]['style'].MozTransitionDuration = original[i]['style'].WebkitTransitionDuration = original[i]['style'].transitionDuration = Number(duration) / 1000 + 's';
				original[i]['style'].msTransitionTimingFunction = original[i]['style'].OTtransitionTimingFunction = original[i]['style'].MozTransitionTimingFunction = original[i]['style'].WebkitTransitionTimingFunction = original[i]['style'].transitionTimingFunction = easing;
				//original[i]['style'].msTransitionDelay = original[i]['style'].OTransitionDelay = original[i]['style'].MozTransitionDelay = original[i]['style'].WebkitTransitionDelay = original[i]['style'].transitionDelay = Number(delay) / 1000 + 's';
			}

			// 이벤트
			window.setTimeout(function() {
				element.css(properties).on(env.event.transitionend + '.EVENT_TRANSITION_QUEUE', function(event) {
					var event = event || window.event;
					var i, max, key;
					//console.log('[정보] 트랜지션 종료');

					// transition 설정 초기화
					for(i=0, max=original.length; i<max; i++) {
						if(original[i]['storage']) {
							for(key in original[i]['storage']['transition']) {
								original[i]['style'][key] = original[i]['storage']['transition'][key];
							}
						}
					}
					element.off(env.event.transitionend + '.EVENT_TRANSITION_QUEUE');
					
					// complete 실행
					if(typeof complete === 'function') {
						complete.call(this, event);
					}

					// 다음 실행할 queue 가 존재할 경우 (재귀호출)
					if(queue.length) {
						//console.log('[정보] next queue 실행');
						call(queue);
					}
				}, true);
			}, 1);
		})(queue);
	};

	// public return
	return {
		frame: animationFrameQueue,
		animation: animationQueue,
		transition: transitionQueue
	};

}, this);