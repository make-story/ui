/*
Animate
requestAnimationFrame, animation(keyframes), transition 실행 또는 순차실행

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE8에서는 element for in 오류

-
사용예
api.animate.frame({'element': '.h2', 'style': {'left': '100px', 'top': '100px', 'width': '100px', 'height': '100px'}, 'duration': 3});
api.animate.frame([{'element': api.dom('#h2'), 'style': {'left': '100px', 'top': '100px'}, 'duration': 3, 'complete': function() { ... }}, {...}, ... ]);

api.animate.transition({'element': api.dom('#view'), 'style': {'left': '100px', 'top': '100px'}, 'duration': 3});
api.animate.transition([{'element': api.dom('#view'), 'style': {'left': '100px', 'top': '100px'}, 'duration': 3, 'complete': function() { ... }}, {...}, ... ]);

api.animate.animation([{'element': api.dom('#view'), 'class': 'pt-page-moveToRight'}, {'element': api.dom('#list'), 'class': 'pt-page-moveToRight'}]);
api.animate.animation({'element': api.dom('#view'), 'class': 'pt-page-moveToLeft', 'complete': function() { ... }});

-
jQuery 또는 api.browser 또는 jQuery 에 종속적 실행
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

	// 정규식
	var regexp = {
		pixel_unit_list: /width$|height$|top|right|bottom|left|fontSize|letterSpacing|lineHeight|^margin*|^padding*/i, // 단위 px 해당되는 것
		time_unit_list: /.+(-duration|-delay)$/i, // seconds (s) or milliseconds (ms)
		position_list: /^(top|right|bottom|left)$/,
		display_list: /^(display|visibility|opacity|)$/i,
		text: /^(\D+)$/i, // 텍스트
		num_unit: /^([0-9]+)(\D+)$/i, // 단위
		num: /^[+-]?\d+(\.\d+)?$/, // 숫자
		source_num: /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, // +=, -= 숫자와 연산자 분리
		trim: /(^\s*)|(\s*$)/g // 양쪽 여백
	};

	// 숫자/단위 분리 (예: 10px -> [0]=>10px, [1]=>10, [2]=>'px')
	var getNumberUnit = function(value) {
		//var regexp_source_num = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
		var regexp_number = new RegExp("^(" + regexp.source_num + ")(.*)$", "i");
		var matches = regexp_number.exec(value);
		if(matches) {
			return matches;
		}else {
			return [value];
		}
	};

	// requestAnimationFrame, cancelAnimationFrame
	// 이론적으로 60fps로 호출되지만, 실제로는 인터벌 없이 다음에 사용 가능한 기회에 애니메이션 드로잉(drawing)을 요청
	var setRequestAnimationFrame = (function() { 
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
	})();
	var setCancelAnimationFrame = (function() {
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
		return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
	})();
	var animationFrameQueue = function(queue) {
		if(typeof queue !== 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}
		
		(function call(queue) {
			var config = queue.shift(); // 현재 순서에 해당하는 정보
			var $element = $(config['element']); // 대상 element - .class 가 각각 다른 초기 값을 가질 경우, 예상과 다른 결과가 나올 수 있다.
			var style = config['style']; // 애니메이션을 적용할 CSS값 - {CSS 속성: 값}
			var duration = config['duration'] || 0; // 애니메이션 진행시간 (단위기준: 1s)
			//var easing = config['easing'];
			var complete = config['complete'];
	
			var easeOutQuad = function (t, b, c, d) {
				return -c *(t/=d)*(t-2) + b;
			};
			var easeInOutQuad = function (t, b, c, d) {
				if((t/=d/2) < 1) {
					return c/2*t*t + b;
				}else {
					return -c/2 * ((--t)*(t-2) - 1) + b;
				}
			};
			var total = $element.length;

			// duration 값 변경
			if(duration) {
				duration = Number(duration) * 1000;
			}
			
			$element.each(function(index) {	
				var $element = $(this);
				var start; // 애니메이션 시작값 (기존 css등 설정값)
				var end; // 애니메이션 종료값 (사용자 설정값)
				var key, tmp;
	
				var properties = {};
				var current = 0;
				var increment = 20;
				var request = null;
				var setFrame;
	
				// start, end 값 추출
				for(key in style) {
					start = $element.css(key); // 기존 설정값
					end = style[key]; // 사용자 설정값
					properties[key] = {}; // 설정할 스타일값 생성
					if(start) {
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
						properties[key]['change'] = end - start;
					}
				}
		
				// 애니메이션 프레임 함수 (반복실행)
				setFrame = function frame() {
					var key, tmp;
					var val, unit;
					
					// increment the time
					current += increment;
					for(key in properties) {
						if(regexp.num.test(properties[key]['start']) && regexp.num.test(properties[key]['change'])) {
							// 적용 값
							if(duration <= 0) {
								val = properties[key]['end']; // 애니메이션 진행시간이 없으므로 바로 적용 
							}else {
								val = easeOutQuad(current, Number(properties[key]['start']), Number(properties[key]['change']), duration); 
								if(regexp.pixel_unit_list.test(key)) {
									// opacity 등 소수점 단위는 제외
									val = Math.round(val); // 반올림
								}
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
							// style 적용 
							tmp = {};
							tmp[key] = val + unit;
							$element.css(tmp);
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

	// 트랜지션 순차실행 - IE10이상 사용가능 
	var transitionQueue = function(queue) {
		if(typeof queue !== 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}
		var state = { // 트랜지션 종료 후 적용할 초기 style
			/*
			// 기본값 https://developer.mozilla.org/ko/docs/Web/CSS/transition
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
			var config = queue.shift(); // 현재 순서에 해당하는 정보
			var $element = $(config['element']); // 대상 element
			var transition = config['style'] || config['transition']; // 트랜지션을 적용할 CSS값 - {CSS 속성: 값}
			var duration = config['duration'] || 0; // 애니메이션 진행시간 (단위기준: 1s)
			var easing = config['easing'] || 'ease'; 
			var delay = config['delay'] || 0; // 효과가 시작할 때까지의 딜레이
			var complete = config['complete']; // 애니메이션 종료 후 콜백 (complete)
			
			var element = $element.get();
			var properties = {}; // css 적용 프로퍼티 
			var transitionend = {}; // transitionend 이벤트 실행된 것 (true)
			var i, max, key, tmp;
	
			// transition 값 확인
			for(key in transition) {
				if(!/^(animation*|transition*)/i.test(key)) { // animation, transition 관련작업은 제외됨
					properties[key] = transition[key];
				}
			}
	
			// 초기값 저장 / transition 설정
			for(i=0, max=element.length; i<max; i++) {
				if(typeof element[i] !== 'object' || !element[i].nodeType) {
					continue;
				}

				// 현재 상태값 저장
				if(typeof element[i]['storage'] !== 'object') {
					element[i]['storage'] = {};
				}
				if(typeof element[i]['storage']['transition'] !== 'object') {
					element[i]['storage']['transition'] = {};
					for(key in state) {
						//tmp = element[i]['style'][key];
						tmp = $(element[i]).css(key);
						if(tmp && !state[key].test(tmp)) { 
							// 현재 element에 설정된 style의 값이 state 목록에 지정된 기본값(style property default value)이 아니므로 
							// 현재 설정된 값을 저장(종료 후 현재값으로 재설정)
							element[i]['storage']['transition'][key] = tmp;
						}else { 
							// 현재 element에 설정된 style의 값이 state 목록에 지정된 기본값(style property default value)과 동일하거나 없으므로 
							// 작업 후 해당 property 초기화(삭제)
							element[i]['storage']['transition'][key] = ''; // '' 또는 null
						}
					}
				}
	
				// transition 설정
				element[i]['style'].msTransitionProperty = element[i]['style'].OTransitionProperty = element[i]['style'].MozTransitionProperty = element[i]['style'].WebkitTransitionProperty = element[i]['style'].transitionProperty = Object.keys(properties).join(',');
				element[i]['style'].msTransitionDuration = element[i]['style'].OTransitionDuration = element[i]['style'].MozTransitionDuration = element[i]['style'].WebkitTransitionDuration = element[i]['style'].transitionDuration = Number(duration) + 's';
				element[i]['style'].msTransitionTimingFunction = element[i]['style'].OTtransitionTimingFunction = element[i]['style'].MozTransitionTimingFunction = element[i]['style'].WebkitTransitionTimingFunction = element[i]['style'].transitionTimingFunction = easing;
				//element[i]['style'].msTransitionDelay = element[i]['style'].OTransitionDelay = element[i]['style'].MozTransitionDelay = element[i]['style'].WebkitTransitionDelay = element[i]['style'].transitionDelay = Number(delay) / 1000 + 's';
			}
	
			// 스타일 설정 
			$element.css(properties);

			// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
			// 또는 addEventListener 를 사용하여, event.target 를 검사하여, 해당되는 element의 경우에만 콜백을 실행해야 한다.
			// transition 값이 여러개의 경우 각각의 프로퍼티별로 콜백이 실행된다. (left/top 두개 트랜지션이 설정되었을 경우, left/top 각각 콜백이 두번 실행된다.)
			$element.on(env.event.transitionend + '.EVENT_TRANSITION_QUEUE', function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var currentTarget = event.currentTarget;
				var target = event.target || event.srcElement;
				var propertyName = event.propertyName; // 트랜지션 실행된 프로퍼티명 
				var i, max, key;
	
				//console.log('[정보] 트랜지션 종료', event);
				/*console.log('event', event);
				console.log('currentTarget', currentTarget);
				console.log('target', target);
				console.log('transitionend', transitionend);
				console.log('propertyName', propertyName);*/
				if(currentTarget && target && currentTarget.isEqualNode(target) && transitionend[propertyName] !== true) { 
					// 해당 프로퍼티 실행상태로 변경 
					transitionend[propertyName] = true;
	
					// 모든 transitionend 실행되었는지 여부 확인
					if(Object.keys(properties).length === Object.keys(transitionend).length) {
						$element.off(env.event.transitionend + '.EVENT_TRANSITION_QUEUE');
	
						// transition 설정 초기화
						for(i=0, max=element.length; i<max; i++) {
							if(typeof element[i] !== 'object' || !element[i].nodeType) {
								continue;
							}
							if(element[i]['storage']) {
								for(key in element[i]['storage']['transition']) {
									element[i]['style'][key] = element[i]['storage']['transition'][key];
								}
							}
						}
	
						// complete 실행
						if(typeof complete === 'function') {
							complete.call(element, event);
						}
	
						// 다음 실행할 queue 가 존재할 경우 (재귀호출)
						if(queue.length) {
							//console.log('[정보] next queue 실행');
							call(queue);
						}
					}
				}
			});
		})(queue);
	};

	// 애니메이션 순차 실행 (이미 실행되고 있는 element는 대기 후 실행)
	// element.style 로 애니메이션을 주는 것이 아닌, 애니메이션값이 있는 class 값을 toggle 하는 방식이다.
	// https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support
	var animationQueue = function(queue) {
		if(typeof queue !== 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}

		(function call(queue) {
			var config = queue.shift(); // 현재 순서에 해당하는 정보
			var $element = $(config['element']); // 대상 element
			var animation = config['class'] || config['animation']; // animation 적용 class name
			var complete = config['complete']; // 애니메이션 종료 후 콜백 (complete)
			var handler;
			var time;

			handler = function(event) {
				var event = event || window.event;

				//console.log('[정보] 이벤트타입: ' + event.type);
				switch(event.type) {
					case "animationstart":
					case "animationiteration":
						break;
					case "animationend":
						$element.removeClass(animation);
						$element.off(env.event.animationend + '.EVENT_ANIMATIONEND_QUEUE');
						$element.removeProp('animationState');

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
				if($element.prop('animationState') !== 'running') { 
					//console.log('[정보] 애니메이션 실행');
					window.clearInterval(time);
					$element.prop({'animationState': 'running'});
					$element.addClass(animation);
					//$element.one(env.event.animationend + '.EVENT_ANIMATIONEND_QUEUE', handler);
					$element.on(env.event.animationend + '.EVENT_ANIMATIONEND_QUEUE', handler);
				}else {
					// 현재 실행중인 애니메이션이 존재 (대기 후 이전 애니메이션이 종료되면 실행)
					//console.log('[정보] 애니메이션 대기');
					//console.log('animationState: ' + $element.prop('animationState'));
				}
			}, 1);
		})(queue);
	};

	// transform
	// https://developer.mozilla.org/en-US/docs/Web/CSS/transform
	var transform = function(parameter) {
		var parameter = parameter || {};
		var element = parameter['element'];
		var transform = parameter['transform'];
		var box = parameter['box']; // transform-box
		var origin = parameter['origin']; // transform-origin
		var style = parameter['style']; // transform-style
		//var duration = parameter['duration'] || 0; // transform: translate 경우 
		var complete = parameter['complete'];
		
		try {
			//element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = duration + 's';
			element.style.webkitTransform = element.style.msTransform = element.style.MozTransform = element.style.OTransform = transform;
		}catch(e) {
			console.log(e);
		}
	};

	// public return
	return {
		frame: animationFrameQueue,
		transition: transitionQueue,
		animation: animationQueue,
		transform: transform
	};

}, this);