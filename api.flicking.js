/*
Flicking

@date
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE9 이상
transform: Chrome Yes, Firefox 3.5 (1.9.1), Internet Explorer 9.0, Opera 10.5, Safari 3.1
transitionend: Chrome 1.0, Firefox 4.0 (2.0), Internet Explorer 10, Opera 10.5, Safari 3.2
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || ((!global.api || !global.api.dom) && !global.jQuery)) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.flicking = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	//
	var env = {};
	if(global.api && global.api.env) {
		env = global.api.env;
	}else {
		env = {
			'check': {
				'touch': ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
				'transition': false
			},
			'event': {
				"down": "mousedown",
				"move": "mousemove",
				"up": "mouseup",
				"transitionend": "transitionend"
			}
		};
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
		}
		(function() {
			var transitions = { // event check (IE10이상 공식지원)
				"transition": "transitionend", 
				"WebkitTransition": "webkitTransitionEnd", 
				"MozTransition": "transitionend", 
				"OTransition": "oTransitionEnd",
				"msTransition": "MSTransitionEnd"
			};
			var key;
			var element = document.createElement('div');
			for(key in transitions) {
				if(element.style[key] !== undefined) {
					env['check']['transition'] = true;
					env['event']['transitionend'] = transitions[key];
					break;
				}
			}
		})();
	}

	// 모듈
	var module = (function() {
		function FlickingModule() {
			var that = this;
			// key가 있는 인스턴스
			that.instance = {};
		}
		FlickingModule.prototype = {
			init: function() {

			},
			setSettings: function(settings, options) {
				var key;
				for(key in options) {
					if(options[key].constructor === Object) {
						settings[key] = this.setSettings(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}
				return settings;
			},
			setTranslate: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var duration = parameter['duration'];
				var translateX = parameter['translateX'];
				var style = parameter['element'] && parameter['element'].style;

				try {
					style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 's';
					style.webkitTransform = 'translate(' + translateX + 'px, 0)' + 'translateZ(0)';
					style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + translateX + 'px)';
				}catch(e) {
					console.log(e);
					return false;	
				}
			},
			setAnimate: function(parameter) {

			}
		};
		return new FlickingModule();
	})();
	
	// 플리킹
	var Flicking = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'total': 0,
			'width': 0,
			'element': null,
			'speed': 300,
			'touch': true,
			'callback': null,
			'transitionend': null
		};
		that.settings = module.setSettings(that.settings, settings);
		that.translate = 0; // container 의 현재 translateX 값
		that.index = 1; // 현재 출력되고 있는 슬라이드 (1부터 시작)
		that.init();
		if(that.settings.touch === true) {
			that.on();
		}
		
		// private init
		/*(function() {

		})();*/
	};
	Flicking.prototype = {
		init: function() {
			this.start = {
				"left": 0,
				"top": 0,
				"time": 0
			};
			this.end = {
				"left": 0,
				"top": 0,
				"time": 0
			};
		},
		on: function() {
			var that = this;
			that.off();

			// down 이벤트
			$(that['settings']['element']).on(env['event']['down'] + '.EVENT_MOUSEDOWN_flicking', function(e) {
				//console.log('[정보] flicking MOUSEDOWN');
				var event = e || window.event;
				//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
				var touch = event.touches; // touchstart

				// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.
				// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 스크롤이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
				if(!env['check']['touch']) {
					// PC에서는 마우스 이벤트 정확도(기능 정상작동)를 올리기 위해 정지
					if(event.preventDefault) { 
						event.preventDefault();
					}else {
						event.returnValue = false;
					}
				}
				
				// 멀티터치 방지
				if(touch && touch.length && 1 < touch.length) {
					return;
				}

				// 이벤트 정지
				$(window).off('.EVENT_MOUSEMOVE_flicking');
				$(window).off('.EVENT_MOUSEUP_flicking');
				
				// init
				that.init();

				// ---------- ---------- ---------- ---------- ---------- ----------
				
				// 시작값
				if(touch) {
					that['start']['left'] = touch[0].clientX;
					that['start']['top'] = touch[0].clientY;
				}else {
					that['start']['left'] = event.clientX;
					that['start']['top'] = event.clientY;
				}
				that['start']['time'] = new Date().getTime();
				
				// move 이벤트
				$(window).on(env['event']['move'] + '.EVENT_MOUSEMOVE_flicking', function(e) {
					//console.log('[정보] flicking MOUSEMOVE');
					var event = e || window.event;
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.touches || event.changedTouches;
					var left, top, translate;

					// 이동값
					if(touch) {
						left = touch[0].clientX;
						top = touch[0].clientY;
					}else {
						left = event.clientX;
						top = event.clientY;
					}

					// 로그
					/*console.log("left: " + left);
					console.log("that['start']['left']: " + that['start']['left']);
					console.log("top: " + top);
					console.log("that['start']['top']: " + that['start']['top']);
					console.log(Math.abs(left - that['start']['left']));
					console.log(Math.abs(top - that['start']['top']));*/

					// 사용자 터치가 스크롤인지 슬라이드인지 확인하여 안정화함
					if(Math.abs(left - that['start']['left']) > Math.abs(top - that['start']['top'])) { 
						// 현재 이벤트의 기본 동작을 중단한다. (슬라이드가 작동중일 때 모바일의 기본이벤트인 스크롤 작동을 중단시킨다.)
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}
						// slide 이동
						translate = (left - that['start']['left']) + that['translate'];
						module.setTranslate({'duration': 0, 'translateX': translate, 'element': that['settings']['element']});
					}
				});
				
				// up 이벤트
				$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_flicking', function(e) {
					//console.log('[정보] flicking MOUSEUP');
					var event = e || window.event;
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.changedTouches; // touchend
					var time;
					var left, top;
					var index, duration;

					// 현재 이벤트의 기본 동작을 중단한다.
					if(event.preventDefault) { 
						event.preventDefault();
					}else {
						event.returnValue = false;
					}

					// 정지값
					if(touch) {
						that['end']['left'] = touch[0].clientX;
						that['end']['top'] = touch[0].clientY;
					}else {
						that['end']['left'] = event.clientX;
						that['end']['top'] = event.clientY;
					}
					that['end']['time'] = new Date().getTime();

					time = Number(that['end']['time']) - Number(that['start']['time']);
					left = that['end']['left'] - that['start']['left'];
					top = that['end']['top'] - that['start']['top'];
					index = that['index'];
					duration = Number(that['settings']['speed']) / 1000; /* 300 / 1000 */

					// 이동 가능한지 검사
					if(Math.abs(left) > Math.abs(top) && ((time <= 100 && 30 <= Math.abs(left))/*마우스를 빠르게 이동한 경우*/ || (that['settings']['width'] / 6) < Math.abs(left)/*기준값 이상 이동한 경우*/)) {
						if(index < that['settings']['total'] && left < 0) { // 다음
							index++;
						}else if(1 < index && left > 0) { // 이전
							index--;
						}
						// 슬라이드 속도
						duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
					}

					/*
					// 로그
					console.log('[실행정보] 플로킹');
					console.log('index: ' + that['index']);
					console.log('index: ' + index);
					console.log('duration: ' + duration);
					console.dir(that['start']);
					console.dir(that['end']);
					*/

					// 슬라이드 이동 (transitionend 이벤트 발생됨)
					that.slide({'value': index, 'duration': duration});

					// 이벤트 정지
					$(window).off('.EVENT_MOUSEMOVE_flicking');
					$(window).off('.EVENT_MOUSEUP_flicking');

					// init
					that.init();
				});
			});

			// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
			if(typeof that['settings']['transitionend'] === 'function') {
				$(that['settings']['element']).on(env['event']['transitionend'] + '.EVENT_TRANSITION_flicking', function(e) {
					var event = e || window.event;
					if(that['settings']['element'].isEqualNode(event.target)) {
						that['settings']['transitionend'].call(that['settings']['element'], that['index']);
					}
				});
			}

			return true;
		},
		off: function() {
			var that = this;
			$(window).off('.EVENT_MOUSEMOVE_flicking');
			$(window).off('.EVENT_MOUSEUP_flicking');
			$(that['settings']['element']).off('.EVENT_MOUSEDOWN_flicking');
			$(that['settings']['element']).off('.EVENT_TRANSITION_flicking');

			return true;
		},
		slide: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var value = parameter['value']; // value 숫자이면 해당 index로 이동, next || prev 이면 해당 모드에 따라 이동
			var duration = parameter['duration'] ? parameter['duration'] : Number(that['settings']['speed']) / 1000;

			// 해당 index 로 이동
			var index = that['index'];
			switch(value) {
				case 'next':
					// 다음 슬라이드 이동
					if(index < that['settings']['total']) {
						index += 1;
					}/*else { // 처음으로 이동
						index = 1;
					}*/
					break;
				case 'prev':
					// 이전 슬라이드 이동
					if(1 < index) {
						index -= 1;
					}/*else { // 마지막으로 이동
						index = that['settings']['total'];
					}*/
					break;
				default:
					// value 값에 해당하는 index 로 이동
					if(index !== value && 1 <= value && value <= that['settings']['total']) {
						index = value;
					}
			}
			if(typeof index === 'number' && 0 < index && (that['index'] < index || that['index'] > index)) { // 다음 || 이전
				that['translate'] = (that['settings']['width'] * (index - 1)) * -1;
				that['index'] = index;
			}

			// slide 이동
			module.setTranslate({'duration': duration, 'translateX': that['translate'], 'element': that['settings']['element']});

			// callback
			if(typeof that['settings']['callback'] === 'function') {
				that['settings']['callback'].call(that['settings']['element'], that['index']);
			}

			return true;
		}
	};

	// public return
	return {
		setup: function(settings) {
			// 인스턴스 생성
			var instance;
			if(settings['key'] && module.instance[settings['key']]) {
				instance = module.instance[settings['key']];
			}else {
				instance = new Flicking(settings);
				if(settings['key']) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		instance: function(key) {
			return module.instance[key] || false;
		}
	};

}, this);