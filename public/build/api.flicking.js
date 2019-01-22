/*
Flicking

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE8 이상
requestAnimationFrame / cancelAnimationFrame: Internet Explorer 10
transform: Chrome Yes, Firefox 3.5 (1.9.1), Internet Explorer 9.0, Opera 10.5, Safari 3.1
transitionend: Chrome 1.0, Firefox 4.0 (2.0), Internet Explorer 10, Opera 10.5, Safari 3.2

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
	global.api.flicking = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	// 환경정보
	var env = {};
	if(global.api && global.api.env) {
		env = global.api.env;
	}else {
		env = {
			'check': {
				'touch': ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
				'transform': false,
				'transition': false
			},
			'browser': {
				'scrollbar': (function() { // 브라우저별 스크롤바 폭 (모바일브라우저 주의)
					var div = document.createElement("div");
					var scrollbar = 0;
					div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
					document.documentElement.appendChild(div);
					scrollbar = div.offsetWidth - div.clientWidth;
					document.documentElement.removeChild(div);
					return scrollbar;
				})()
			},
			'event': {
				"down": "mousedown",
				"move": "mousemove",
				"up": "mouseup",
				"wheel": (function() {
					var element = document.createElement('div');
					if((navigator.userAgent || navigator.vendor || window.opera).toLowerCase().indexOf('webkit') >= 0) { // Chrome / Safari
						return 'mousewheel';
					}else if(element.attachEvent) { // IE
						return 'mousewheel';
					}else if(element.addEventListener) { // Mozilla
						return 'DOMMouseScroll';
					}
					return false;
				})(),
				"transitionend": "transitionend"
			}
		};

		// event
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
		}

		// transform, transition
		(function() {
			var transforms = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"]; // css check (IE9 벤더프리픽스로 사용가능, IE10이상 공식지원)
			var transitions = { // event check (IE10이상 공식지원)
				"transition": "transitionend", 
				"WebkitTransition": "webkitTransitionEnd", 
				"MozTransition": "transitionend", 
				"OTransition": "oTransitionEnd",
				"msTransition": "MSTransitionEnd"
			};
			var key;
			var div = document.createElement('div');

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
		})();
	}

	// 모듈 (private)
	var module = (function() {
		function FlickingModule() {
			var that = this;
			// key가 있는 인스턴스
			that.instance = {};
		}
		FlickingModule.prototype = {
			setSettings: function(settings, options) {
				var key;
				for(key in options) {
					if(!options.hasOwnProperty(key)) {
						continue;
					}else if(options[key] && options[key].constructor === Object && !options[key].nodeType) {
						settings[key] = settings[key] || {};
						settings[key] = this.setSettings(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}
				return settings;
			},
			// requestAnimationFrame, cancelAnimationFrame
			setRequestAnimationFrame: (function() { 
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
				return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
			})(),
			setCancelAnimationFrame: (function() {
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
				return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
			})(),
			setAnimate: (function() {
				if(env['check']['transform'] === true && env['check']['transition'] === true) {
					return function(parameter) { // transform (GPU)
						var that = this;
						var parameter = parameter || {};
						var element = parameter['element'];
						var duration = parameter['duration'] || 0; // 애니메이션 진행시간 (단위기준: 1s)
						var left = Number(parameter['left'] || 0); // translateX
						var top = Number(parameter['top'] || 0); // translateY
						var complete = parameter['complete'];
						
						try {
							element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = Number(duration) + 's';
							element.style.webkitTransform = 'translate(' + left + 'px, ' + top + 'px)' + 'translateZ(0)'; // translateZ : CSS GPU가속 사용을 위한 핵 (3d로 속여서 GPU가속 사용)
							element.style.msTransform = element.style.MozTransform = element.style.OTransform = 'translate(' + left + 'px, ' + top + 'px)';
							$(element).off(env['event']['transitionend'] + '.EVENT_TRANSITION_FLICKING').on(env['event']['transitionend'] + '.EVENT_TRANSITION_FLICKING', function(e) {
								var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
								var currentTarget = event.currentTarget;
								var target = event.target || event.srcElement;
								var propertyName = event.propertyName; // 트랜지션 실행된 프로퍼티명 (transform)
								
								//console.log('event', event);
								//console.log('currentTarget', currentTarget);
								//console.log('target', target);
								//console.log('propertyName', propertyName);
								if(currentTarget && target && currentTarget.isEqualNode(target)) {
									// complete 실행
									if(typeof complete === 'function') {
										complete.call(element);
									}
								}
							});
						}catch(e) {
							console.log(e);
						}
					};
				}else {
					return function(parameter) { // requestAnimationFrame / cancelAnimationFrame
						var that = this;
						var parameter = parameter || {};
						var element = parameter['element'];
						var duration = parameter['duration'] || 0; // 애니메이션 진행시간 (단위기준: 1s)
						var left = Number(parameter['left'] || 0);
						var top = Number(parameter['top'] || 0);
						var complete = parameter['complete'];

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

						var start = 0; // 애니메이션 시작값 (기존 css등 설정값)
						var end = 0; // 애니메이션 종료값 (사용자 설정값)
						var properties = {
							'left': {},
							'top': {}
						};
						var current = 0;
						var increment = 20;
						var request = null;
						var setFrame;

						element.style.position = 'absolute';
						if(!duration) {
							element.style.left = left + 'px';
							element.style.top = top + 'px';
						}else {
							// duration 값 변경
							duration = Number(duration) * 1000;

							// start, end 값 추출
							start = Number(that.numberReturn(element.style.left) || 0);
							properties.left.start = start;
							properties.left.end = end = Number(left);
							properties.left.change = end - start;
							start = Number(that.numberReturn(element.style.top) || 0);
							properties.top.start = start;
							properties.top.end = end = Number(top);
							properties.top.change = end - start;
							
							// 애니메이션 프레임 함수 (반복실행)
							setFrame = function frame() {
								var key, value;

								// increment the time
								current += increment; 

								for(key in properties) {
									value = easeInOutQuad(current, properties[key].start, properties[key].change, duration); 
									element.style[key] = value + 'px';
								}

								if(current < duration) {
									// frame
									request = that.setRequestAnimationFrame(frame);
								}else if(request) {
									that.setCancelAnimationFrame(request);

									// complete 실행
									if(typeof complete === 'function') {
										complete.call(element);
									}
								}
							};
							if(request) {
								that.setCancelAnimationFrame(request);
							}
							setFrame();
						}
					};
				}
			})(),
			// 현재 이벤트의 기본 동작을 중단한다.
			preventDefault: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
			},
			// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
			stopPropagation: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.stopPropagation) { 
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
			},
			// 단위 분리
			numberUnit: function(value) { 
				// [1]: 숫자값
				// [2]: 단위
				return /^([0-9]+)(\D+)$/i.exec(value);
			},
			// 숫자여부 확인
			isNumeric: function(value) {
				return !isNaN(parseFloat(value)) && isFinite(value);
			},
			// 숫자만 추출
			numberReturn: function(value) { 
				return String(value).replace(/[^+-\.\d]|,/g, '');
			}
		};
		return new FlickingModule();
	})();
	
	// 플리킹
	var Flicking = function(settings) {
		var that = this;
		that.settings = {
			'key': '', // 플리킹 작동 고유키 (선택)
			'target': null, // 슬라이드 wrap (셀렉터 또는 element 값)
			'flow': 'horizontal', // 플리킹 방향 (가로:horizontal, 세로:vertical)
			'width': 'auto', // 슬라이드 width 값 설정 (auto: 슬라이드가 target 가운데 위치하도록 wrap width 값에 따라 자동설정)
			'height': 'auto', // 슬라이드 height 값 설정
			'centered': false, // true / false / margin / padding 
			'speed': 300, // 슬라이드 속도
			'touch': true, // 클릭 또는 터치 슬라이드 작동여부
			'auto': 0, // 자동 슬라이드 작동여부 (0 이상의 값이 입력되면 작동합니다.)
			'wheel': false, // 마우스 휠 이벤트 작동여부
			'edge': true, // 가장자리 터치(클릭)시 슬라이드 이동여부
			'listeners': { // 플리킹 작동 listeners (선택)
				'init': null,
				'next': null,
				'prev': null,
				'slidechange': null,
				'append': null,
				'remove': null,
				'transitionend': null
			}
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.total = 0; // 총 슬라이드 수
		that.index = 1; // 현재 출력되고 있는 슬라이드 (1부터 시작)
		that.width = {}; // 플리킹 wrap width value, unit 값
		that.height = {}; // 플리킹 wrap height value, unit 값
		that.current = 0; // container 의 이동전(현재) translateX, left 또는 translateY, top 값
		that.time = {
			'auto': 0, // 자동슬라이드 time key
			'resize': 0	
		}; 
		if(typeof that.settings.centered !== 'boolean' && !/margin|padding/i.test(that.settings.centered)) {
			that.settings.centered = false;
		}else if(that.settings.centered === true) {
			that.settings.centered = 'margin';
		}

		// target
		that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
		that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));
		that.elements.children = that.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
		that.total = that.elements.children.length || 0;

		// init
		that.init();
		that.wrap();
		that.view();
		that.on();
		that.auto({'mode': 'start'});
		that.wheel({'mode': 'on'});

		// resize event 
		$(window).off('resize.EVENT_RESIZE_FLICKING_' + that['settings']['key']);
		if(that.settings.width === 'auto' && that.settings.height === 'auto') {
			$(window).on('resize.EVENT_RESIZE_FLICKING_' + that['settings']['key'], function(e) {
				console.log('[정보] 플리킹 resize event');
				window.clearTimeout(that.time.resize);
				that.time.resize = window.setTimeout(function(){ 
					console.log('[정보] 플리킹 resize set');
					// 애니메이션 정지!
					that.wrap();
					that.view();
				}, 300);
			});
		}

		// listeners
		if(typeof that.settings.listeners.init === 'function') {
			that.settings.listeners.init.call(that, that.elements.target);
		}
	};
	Flicking.prototype = {
		// 초기값 (모션)
		init: function() {
			var that = this;

			that.start = {
				"left": 0,
				"top": 0,
				"time": 0
			};
			that.end = {
				"left": 0,
				"top": 0,
				"time": 0
			};

			return that;
		},
		// 설정값 변경
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
								}
							}
							break;
						case 'width':
						case 'height':
							that.settings[key] = settings[key];
							// resize event 
							window.clearTimeout(that.time.resize);
							$(window).off('resize.EVENT_RESIZE_FLICKING_' + that['settings']['key']);
							if(that.settings[key] === 'auto') {
								$(window).on('resize.EVENT_RESIZE_FLICKING_' + that['settings']['key'], function(e) {
									window.clearTimeout(that.time.resize);
									that.time.resize = window.setTimeout(function(){ 
										// 애니메이션 정지!
										that.wrap();
										that.view();
									}, 300);
								});
							}
							// 
							that.wrap();
							that.view();
							break;
						/*
						default:
							that.settings[key] = settings[key];
							break;
						*/
					}
				}
			}catch(e) {}

			return that;
		},
		// 플리킹(target) 감싸는 element width, style 등 설정
		wrap: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var display; // flex 검사 
			var target = that.elements.target;
			var parent = target.parentNode; // target 상위 element
			var tmp;
			var style = {
				'parent': {},
				'target': {}
			};
			var translate = {
				'element': target,
				//'duration': Number(that.settings.speed) / 1000
				'duration': 0
			};

			console.log('[정보] parent', parent);

			// toLowerCase
			if(/^(horizontal|vertical)$/i.test(that.settings.flow) === false) {
				that.settings.flow = 'horizontal';
			}else {
				that.settings.flow = that.settings.flow.toLowerCase();
			}
			if(typeof that.settings.width === 'string') {
				that.settings.width = that.settings.width.toLowerCase();
			}
			if(typeof that.settings.height === 'string') {
				that.settings.height = that.settings.height.toLowerCase();
			}

			// width / height 초기값
			that.width = {
				'value': 0,
				'unit': 'px'
			};
			that.height = {
				'value': 0,
				'unit': 'px'
			};

			// 사용자가 width /  height 를 설정
			if(module.isNumeric(that.settings.width)) {
				that.width = {
					'value': Number(that.settings.width),
					'unit': 'px'
				};
			}else if(/^([0-9]+)(\D+)$/i.test(that.settings.width)) {
				tmp = numberUnit(that.settings.width);
				that.width = {
					'value': Number(tmp[1]),
					'unit': tmp[2]
				};
			}
			if(module.isNumeric(that.settings.height)) {
				that.height = {
					'value': Number(that.settings.height),
					'unit': 'px'
				};
			}else if(/^([0-9]+)(\D+)$/i.test(that.settings.height)) {
				tmp = numberUnit(that.settings.height);
				that.height = {
					'value': Number(tmp[1]), 
					'unit': tmp[2]
				};
			}

			// wrap 크기 정보
			// auto (parent element의 width / height 를 구함)
			if(that.settings.width === 'auto' || that.settings.height === 'auto') {
				// display
				// flow, flow-root, table, flex, ruby, grid, list-item
				// !/flow|table|flex|ruby|grid|list/ig.test(display)
				display = $(target).css('display'); 
				//console.log('[정보] 플리킹 display', display);

				// target 상위 parent element 의 정확한 값을 구하기 위해 플리킹 wrap 의 width / height 초기화
				// float해제방식: overflow: hidden; 또는 부모요소 inline-block
				//$(target).css({'width': '0px', 'height': '0px', 'overflow': 'hidden'});
				$(target).css({'display': 'none'});
				if(that.settings.width === 'auto') {
					that.width = {
						'value': Number(module.numberReturn($(parent).innerWidth()) || 0),
						'unit': 'px'
					};
				}
				if(that.settings.height === 'auto' && that.settings.flow === 'vertical') {
					that.height = {
						'value': Number(module.numberReturn($(parent).innerHeight()) || 0),
						'unit': 'px'
					};
				}
				$(target).css({'display': display || ''});
				//console.log('[정보] wrap width', that.width);
				//console.log('[정보] wrap height', that.height);
			}

			// style
			style['parent']['position'] = 'relative';
			style['parent']['overflow'] = 'hidden';
			style['target']['height'] = 'auto';
			style['target']['user-select'] = 'none';
			//style['target']['touch-action'] = 'pan-y';
			//style['target']['-webkit-user-drag'] = 'none';
			if(that.settings.flow === 'vertical') {
				style['target']['width'] = that.width.value + 'px';
			}else {
				style['target']['width'] = (that.width.value * that.total) + 'px';
			}
			$(parent).css(style['parent']);
			$(target).css(style['target']);

			// translate
			if(that.settings.flow === 'vertical') {
				translate['top'] = that.current = (that.height.value * (that.index - 1)) * -1;
			}else {
				translate['left'] = that.current = (that.width.value * (that.index - 1)) * -1;
			}
			module.setAnimate(translate); // resize 콜백 발생시 슬라이드 위치 초기화
			
			return that;
		},
		// 슬라이드 element width, style 등 설정
		view: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var index = parameter['index']; // 해당 슬라이드 index
			var element = parameter['element']; // 해당 슬라이드 element
			var i, max;
			var setStyle = function(element) {
				var parent; // 상위 element
				var centered = that.settings.centered;
				var width = 0, height = 0;
				var rect = {};
				var past = {}; // 기존 element 에 설정된 style 값
				var style = {}; // 슬라이드 기본 style 설정 값
				var tmp;

				if(element) {
					parent = element.parentNode;
					element = $(element);

					// 기존 element 값 
					// auto의 경우 정확한 margin 판단을 위해 값 초기화
					if(centered) {
						tmp = {};
						if(that.settings.flow === 'vertical') {
							tmp[centered + '-top'] = '0px';
							tmp[centered + '-bottom'] = '0px';
						}else {
							tmp[centered + '-left'] = '0px';
							tmp[centered + '-right'] = '0px';
						}
						element.css(tmp);
						/*if(that.settings.width !== 'auto') {
							past[centered + '-left'] = element.css(centered + '-left');
							past[centered + '-right'] = element.css(centered + '-right');
						}else {
							tmp = {};
							tmp[centered + '-left'] = '0px';
							tmp[centered + '-right'] = '0px';
							element.css(tmp);
						}
						if(that.settings.height !== 'auto') {
							past[centered + '-top'] = element.css(centered + '-top');
							past[centered + '-bottom'] = element.css(centered + '-bottom');
						}else {
							tmp = {};
							tmp[centered + '-top'] = '0px';
							tmp[centered + '-bottom'] = '0px';
							element.css(tmp);
						}*/
					}
					past['min-width'] = element.css('min-width');
					past['max-width'] = element.css('max-width');
					past['min-height'] = element.css('min-height');
					past['max-height'] = element.css('max-height');
					past['display'] = element.css('display');
					console.log('[정보] 플리킹 대상 element 기존 style', past);

					// 슬라이드의 width / height 값 계산(정확한 width / height 값 반환을 위해 float: left 설정, max-width 값 초기화)
					// 플리킹을 위한 기본 style 설정
					if(parent && /flow|table|flex|ruby|grid|list/ig.test(parent.style && parent.style.display || '')) {
						element.css({'min-width': '0', 'max-width': 'none', 'min-height': '0', 'max-height': 'none', 'position': 'relative'}); 
					}else {
						element.css({'min-width': '0', 'max-width': 'none', 'min-height': '0', 'max-height': 'none', 'position': 'relative', 'float': 'left'}); 
					}

					// border 값을 포함한 width / height 값
					// 중앙정렬 조건이 padding 경우 width, height 값 확인 다시!
					width = Number(module.numberReturn(element.outerWidth()) || 0); 
					height = Number(module.numberReturn(element.outerHeight()) || 0); 
					console.log('[정보] 플리킹 슬라이드 사이즈1', width + '/' + height); 
					if(element.get(0) && typeof element.get(0).getBoundingClientRect === 'function') { // chrome 에서는 정수가 아닌 실수단위로 정확한 값을 요구하므로 getBoundingClientRect 사용
						rect = element.get(0).getBoundingClientRect(); // width/height: IE9 이상 지원
						if('width' in rect || 'height' in rect) { 
							width = rect.width || width;
							height = rect.height || height;
							console.log('[정보] 플리킹 슬라이드 사이즈2', width + '/' + height); 
						}
					}

					// style (px, em, rem 에 따른 분기 작업필요)
					/*if(centered) {
						style[centered + '-left'] = past[centered + '-left'] || '0px';
						style[centered + '-right'] = past[centered + '-right'] || '0px';
						style[centered + '-top'] = past[centered + '-top'] || '0px';
						style[centered + '-bottom'] = past[centered + '-bottom'] || '0px';
					}*/
					style['min-width'] = past['min-width'] || '0'; // default value 0
					style['max-width'] = past['max-width'] || 'none'; // default value none
					style['min-height'] = past['min-height'] || '0'; // default value 0
					style['max-height'] = past['max-height'] || 'none'; // default value none
					style['display'] = past['display'] || 'block';

					// width
					console.log('[정보] 플리킹 width', width); 
					if(0 < that.width.value && (width <= 0 || that.width.value < width)) {
						// 슬라이드 width 크기가 플리킹 wrap width 보다 클경우 강제 width 설정
						style['max-width'] = that.width.value + 'px';
					}else if(centered) {
						// 양쪽 여백값 (슬라이드를 가운데 위치시키기 위함)
						style[centered + '-left'] = style[centered + '-right'] = ((that.width.value - width) / 2) + 'px'; 
					}else {
						// 최소 가로 크기 (슬라이드 가로 크기)
						style['min-width'] = that.width.value + 'px';
					}

					// height 
					console.log('[정보] 플리킹 height', height);
					if(that.settings.flow === 'vertical') {
						if(0 < that.height.value && (height <= 0 || that.height.value < height)) {
							style['max-height'] = that.height.value + 'px';
						}else if(centered) {
							style[centered + '-top'] = style[centered + '-bottom'] = ((that.height.value - height) / 2) + 'px'; 	
						}else {
							style['min-height'] = that.height.value + 'px';
						}
					}
					
					console.log('[정보] 플리킹 style', style);
					element.css(style);
				}
			};
			
			//
			element = index && that.elements.children[index-1] ? that.elements.children[index-1] : element;
			if(element) {
				setStyle(element);
			}else {
				for(i=0, max=that.total; i<max; i++) {
					setStyle(that.elements.children[i]);
				}
			}

			return that;
		},
		// 슬라이드 추가
		append: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var index = parameter['index'] || 'last'; // 지정된 위치에 삽입 (last, first, 숫자)
			var html = parameter['html'];
			var element = parameter['element'];

			if(typeof html === 'string' && html.length > 0) {
				element = (function(html) {
					// getBoundingClientRect 사용을 위해 fragment 를 활용하지 않는다.
					// getBoundingClientRect 는 크롬에서의 소수점 단위의 정확한 width / height 값을 알기 위해 사용한다.
					var div = document.createElement('div');
					div.innerHTML = html;
					return div.firstChild; // IE8 이하 사용 불가능
				})(html);
			}else {
				element = $(element).get(0);
			}

			if(typeof element === 'object' && element.nodeType) {
				// index 값에 따라 해당 위치에 삽입
				if(module.isNumeric(index)) { // 숫자
					if(!that.elements.target.insertBefore(element, that.elements.children[index-1])) {
						return false;
					}
				}else if(typeof index === 'string') { // 문자
					switch(index.toLowerCase()) {
						case 'first':
							if(!that.elements.target.insertBefore(element, that.elements.target.firstChild)) {
								return false;
							}
							break;
						case 'last':
							if(!that.elements.target.appendChild(element)) {
								return false;
							}
							break;
					}
				}

				// 정보 업데이트
				that.elements.children = that.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
				that.total = that.elements.children.length || 0; 
				$(that.elements.target).css({'width': (that.settings.flow === 'vertical' ? that.width.value : (that.width.value * that.total)) + 'px'}); // wrap width 수정
				that.view({'index': that.total});
				console.log('[정보] append total', that.total);

				// listeners
				if(typeof that.settings.listeners.append === 'function') {
					that.settings.listeners.append.call(that, element);
				}
			}

			return that;
		},
		// 슬라이드 삭제
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var index = parameter['index'] || 'last'; // current, last, 숫자
			var element;
			var is = false; // 삭제 후 술라이드 이동 여부 (현재 슬라이드 삭제 등의 경우)
			var setDelete = function(element) {
				$(element).off();
				if(typeof element === 'object' && element.nodeType && element.parentNode.removeChild(element)) {
					return true;
				}else {
					return false;
				}
			};

			if(index) {
				if(module.isNumeric(index)) { // 숫자
					if(index == that.index) {
						is = true;
					}
					element = that.elements.children[index-1];
				}else if(typeof index === 'string') { // 문자
					switch(index.toLowerCase()) {
						case 'current':
							is = true;
							element = that.index && that.elements.children[that.index-1];
							break;
						case 'last':
							is = false;
							element = that.total && that.elements.children[that.total-1];
							break;
					}
				}
				setDelete(element);
			}else { // 전체제거
				for(index in that.elements.children) {
					setDelete(that.elements.children[index]);
				}
			}

			// 정보 업데이트
			that.elements.children = that.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
			that.total = that.elements.children.length || 0; 
			$(that.elements.target).css({'width': (that.settings.flow === 'vertical' ? that.width.value : (that.width.value * that.total)) + 'px'}); 
			if(is) {
				that.slide({'index': 'prev'});
			}

			// listeners
			if(typeof that.settings.listeners.remove === 'function') {
				that.settings.listeners.remove.call(that, that.elements.target);
			}

			return that;
		},
		// 슬라이드 위치 설정
		slide: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var index = parameter['index'] && typeof parameter['index'] === 'string' && String(parameter['index']).toLowerCase() || parameter['index']; // index 숫자이면 해당 index로 이동, next || prev 이면 해당 모드에 따라 이동
			var duration = module.isNumeric(parameter['duration']) ? parameter['duration'] : Number(that.settings.speed) / 1000;

			var is = false; // 이동이 발생했는지 여부
			var before = that.index; // 현재 슬라이드 index
			var after = that.index; // 이동할 슬라이드 index
			var translate = {
				'element': that.elements.target,
				'duration': duration
			};

			// 해당 index 로 이동
			switch(index) {
				case 'next':
					// 다음 슬라이드 이동
					if(after < that.total) {
						after += 1;
					}/*else { // 처음으로 이동
						after = 1;
					}*/
					break;
				case 'prev':
					// 이전 슬라이드 이동
					if(1 < after) {
						after -= 1;
					}/*else { // 마지막으로 이동
						after = that.total;
					}*/
					break;
				default:
					// index 값에 해당하는 index 로 이동
					if(module.isNumeric(index)) {
						after = index;
					}
			}

			// 다음 또는 이전 이동이 발생했는지 확인
			if(module.isNumeric(after) && 1 <= after && (before < after || before > after) && after <= that.total) {
				is = true;
			}

			// slide 이동
			if(that.settings.flow === 'horizontal') {
				translate['left'] = that.current = (that.width.value * ((is ? after : before) - 1)) * -1;
			}else if(that.settings.flow === 'vertical') {
				translate['top'] = that.current = (that.height.value * ((is ? after : before) - 1)) * -1;
			}
			module.setAnimate(translate/*, complete*/);

			if(is) {
				// 값 변경
				that.index = after;
				// listeners
				if(before < after && typeof that['settings']['listeners']['next'] === 'function') { // next
					that['settings']['listeners']['next'].call(that, that.elements.target);
				}else if(before > after && typeof that['settings']['listeners']['prev'] === 'function') { // prev
					that['settings']['listeners']['prev'].call(that, that.elements.target);
				}
				if(typeof that['settings']['listeners']['slidechange'] === 'function') { // slidechange
					that['settings']['listeners']['slidechange'].call(that, that.elements.target);
				}
			}

			// auto
			that.auto({'mode': 'start'});

			return true;
		},
		// 마우스, 터치 이벤트 설정
		on: function() {
			var that = this;

			// 이벤트 초기화
			that.off(); 
			
			if(that.settings.touch === true) {
				// down 이벤트
				$(that.elements.target).on(env['event']['down'] + '.EVENT_MOUSEDOWN_FLICKING_' + that['settings']['key'], function(e) {
					//console.log('[정보] flicking MOUSEDOWN');
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					var self = event.currentTarget; // event listener element (event 실행 element)
					var target = event && event.target; // event 가 발생한 element
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.touches; // touchstart
					var rect; 

					// 위치 / 크기 
					if(self.parentNode) {
						rect = self.parentNode.getBoundingClientRect();
					}
					console.log('offset: ' + self.offsetLeft + '/' + self.offsetTop + '|' + self.offsetWidth + '/' + self.offsetHeight);
					console.log('client: ' + self.clientLeft + '/' + self.clientTop + '|' + self.clientWidth + '/' + self.clientHeight);

					// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.
					// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 스크롤이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
					if(!env['check']['touch'] && /[^input|select|textarea|button]/i.test(target.tagName)) {
						// PC에서는 마우스 이벤트 정확도(기능 정상작동)를 올리기 위해 정지
						module.preventDefault(event);
					}
					
					// 멀티터치 방지
					if(touch && touch.length && 1 < touch.length) {
						return;
					}

					// 이벤트 정지
					$(window).off('.EVENT_MOUSEMOVE_FLICKING_' + that['settings']['key']);
					$(window).off('.EVENT_MOUSEUP_FLICKING_' + that['settings']['key']);

					// auto
					that.auto({'mode': 'stop'});
					
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
					$(window).on(env['event']['move'] + '.EVENT_MOUSEMOVE_FLICKING_' + that['settings']['key'], function(e) {
						//console.log('[정보] flicking MOUSEMOVE');
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						var target = event && event.target; // event 가 발생한 element
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches || event.changedTouches;
						var left, top;
						var is = true;
						var translate = {
							'element': that.elements.target,
							'duration': 0
						};

						// event.currentTarget; // event listener element (event 실행 element)
						// event.target; // event 가 발생한 element
						// event.currentTarget.contains(event.target); // 특정 노드가 다른 노드 내에 포함되었는지 여부

						// 현재 이벤트의 기본 동작을 중단한다.
						if(that.settings.flow === 'vertical') {
							module.preventDefault(event);
						}

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

						// 슬라이드 영역 외 element 검사
						/*if(!that.elements.target.contains(event.target)) {
							that.slide({'index': that.index, 'duration': Number(that.settings.speed) / 1000});
							return false;
						}*/

						// 사용자 터치가 브라우저 스크롤인지 슬라이드 이동 목적인지 확인하여 실행(안정화)
						if(that.settings.flow === 'horizontal' && Math.abs(left - that['start']['left']) > Math.abs(top - that['start']['top'])) {
							translate['left'] = (left - that['start']['left']) + that.current;
						}else if(that.settings.flow === 'vertical' && Math.abs(top - that['start']['top']) > Math.abs(left - that['start']['left'])) {
							translate['top'] = (top - that['start']['top']) + that.current;
						}else {
							is = false;
						}
						if(is) {
							// 현재 이벤트의 기본 동작을 중단한다. (슬라이드가 작동중일 때 모바일의 기본이벤트인 스크롤 작동을 중단시킨다.)
							module.preventDefault(event);
							// slide 이동
							module.setAnimate(translate);
						}
					});
					
					// up 이벤트
					$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_FLICKING_' + that['settings']['key'], function(e) {
						//console.log('[정보] flicking MOUSEUP');
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						var target = event && event.target; // event 가 발생한 element
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.changedTouches; // touchend
						var time;
						var left, top;
						var index, duration;
						var standard = { // 기준값 (이동)
							'time': 100, 
							'move': 30, // 최소/최대 이동범위
							'size': 6 // 화면 분할 기준
						};
						var isChildren = function(element) {
							var i, max;
							for(i=0, max=that.total; i<max; i++) {
								if(that.elements.children[i].isEqualNode(element)) {
									return true;
								}
							}
							return false;
						};

						// event.currentTarget; // event listener element (event 실행 element)
						// event.target; // event 가 발생한 element

						// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 슬라이드 내부 a 태그등이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
						//module.preventDefault(event);

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
						index = that.index;
						duration = Number(that.settings.speed) / 1000; /* 300 / 1000 */

						// 이동 가능한지 검사
						if(that.settings.flow === 'horizontal' && ((Math.abs(left) > Math.abs(top)/*좌우 이동값이 더 큰 경우*/ && (time <= standard.time && standard.move <= Math.abs(left)/*마우스를 빠르게 이동한 경우*/)) || (that.width.value / standard.size) < Math.abs(left)/*슬라이드 크기 기준 어느정도 이동이 발생했을 때*/)) {
							if(index < that.total && left < 0) { // 다음
								index++;
							}else if(1 < index && left > 0) { // 이전
								index--;
							}
							// 슬라이드 속도
							duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
						}else if(that.settings.flow === 'vertical' && ((Math.abs(top) > Math.abs(left)/*상하 이동값이 더 큰 경우*/ && (time <= standard.time && standard.move <= Math.abs(top)/*마우스를 빠르게 이동한 경우*/)) || (that.height.value / standard.size) < Math.abs(top)/*슬라이드 크기 기준 어느정도 이동이 발생했을 때*/)) {
							if(index < that.total && top < 0) { // 다음
								index++;
							}else if(1 < index && top > 0) { // 이전
								index--;
							}
							// 슬라이드 속도
							duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
						}else if(that.settings.edge === true && Math.abs(left) < standard.move && Math.abs(top) < standard.move && (that.elements.target.isEqualNode(target)/*슬라이드 영역*/ || (that.elements.target.contains(target)/*바로하위자식*/ && isChildren(target)))) {
							// 슬라이드 좌/우 또는 상/하 끝부분을 클릭(터치) 했을 경우
							console.log('current slide', that.elements.children[that.index-1]);
							console.log('rect', rect);
							console.log('start', that['start']);
							console.log('end', that['end']);
							console.log(rect.left <= that['end']['left']);
							console.log(that['end']['left'] <= rect.left+standard.move);
							console.log(rect.right-standard.move <= that['end']['left']);
							console.log(that['end']['left'] <= rect.right);
							if(that.settings.flow === 'horizontal') {
								if(rect.left <= that['end']['left'] && that['end']['left'] <= rect.left+standard.move) { // 좌측기준
									index--;
								}else if(rect.right-standard.move <= that['end']['left'] && that['end']['left'] <= rect.right) { // 우측기준
									index++;
								}
							}else if(that.settings.flow === 'vertical') {
								if(rect.top <= that['end']['top'] && that['end']['top'] <= rect.top+standard.move) { // 상단기준 
									index--;
								}else if(rect.bottom-standard.move <= that['end']['top'] && that['end']['top'] <= rect.bottom) { // 하단기준 
									index++;
								}
							}
						}
						console.log('slide element', that.elements.target);
						console.log('target', target);

						/*
						// 로그
						console.log('[실행정보] 플로킹');
						console.log('index: ' + that.index);
						console.log('index: ' + index);
						console.log('duration: ' + duration);
						console.dir(that['start']);
						console.dir(that['end']);
						*/

						// 슬라이드 이동 (transitionend 이벤트 발생됨)
						that.slide({'index': index, 'duration': duration});

						// 이벤트 정지
						$(window).off('.EVENT_MOUSEMOVE_FLICKING_' + that['settings']['key']);
						$(window).off('.EVENT_MOUSEUP_FLICKING_' + that['settings']['key']);

						// auto
						that.auto({'mode': 'start'});

						// init
						that.init();
					});
				});

				// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
				// 또는 addEventListener 를 사용하여, event.target 를 검사하여, 해당되는 element의 경우에만 콜백을 실행해야 한다.
				// transition 값이 여러개의 경우 각각의 프로퍼티별로 콜백이 실행된다. (left/top 두개 트랜지션이 설정되었을 경우, left/top 각각 콜백이 두번 실행된다.)
				if(typeof that['settings']['listeners']['transitionend'] === 'function') {
					$(that.elements.target).off(env['event']['transitionend'] + '.EVENT_TRANSITION_FLICKING_' + that['settings']['key']).on(env['event']['transitionend'] + '.EVENT_TRANSITION_FLICKING_' + that['settings']['key'], function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						var currentTarget = event.currentTarget; // event listener element
						var target =  event.target || event.srcElement; // event 가 발생한 element
						var propertyName = event.propertyName; // 트랜지션 실행된 프로퍼티명 - horizontal/vertical 설정 값에 따라 left/top 둘 중 하나의 값

						/*console.log(event);
						console.log(currentTarget);
						console.log(target);*/
						if(currentTarget.isEqualNode(target)) {
							that['settings']['listeners']['transitionend'].call(that, that.elements.target);
						}
					});
				}
			}

			return that;
		},
		off: function() {
			var that = this;
			$(window).off('.EVENT_MOUSEMOVE_FLICKING_' + that['settings']['key']);
			$(window).off('.EVENT_MOUSEUP_FLICKING_' + that['settings']['key']);
			$(that.elements.target).off('.EVENT_MOUSEDOWN_FLICKING_' + that['settings']['key']);
			$(that.elements.target).off('.EVENT_TRANSITION_FLICKING_' + that['settings']['key']);
			return that;
		},
		// 슬라이드 자동 플리킹 설정
		auto: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var mode = /^(start|stop)$/i.test(parameter['mode']) && parameter['mode'].toLowerCase() || 'stop';

			window.clearTimeout(that.time.auto);
			if(mode === 'start' && that.settings.auto > 0) {
				that.time.auto = window.setTimeout(function() {
					if(that.index < that.total) {
						that.slide({'index': 'next'});
					}else {
						that.slide({'index': 1});
					}					
				}, that.settings.auto);
			}

			return that;
		},
		// 마우스 휠
		wheel: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var mode = /^(on|off)$/i.test(parameter['mode']) && parameter['mode'].toLowerCase() || 'off';

			$(that.elements.target).off('.EVENT_MOUSEWHEEL_FLICKING_' + that['settings']['key']);
			if(mode === 'on' && that.settings.wheel === true) {
				$(that.elements.target).on(env['event']['wheel'] + '.EVENT_MOUSEWHEEL_FLICKING_' + that['settings']['key'], function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					var scroll;

					// 현재 이벤트의 기본 동작을 중단한다.
					module.preventDefault(event);

					//
					if(event.wheelDelta) {
						scroll = event.wheelDelta / 3600; // Chrome / Safari
					}else if(event.detail) {
						scroll = event.detail / -90; // Mozilla
					}else {
						return false;
					}

					//
					scroll = 1 + scroll; // Zoom factor: 0.9 / 1.1
					if(scroll > 1) { // prev
						that.slide({'index': 'prev'});
					}else if(scroll < 1) { // next
						that.slide({'index': 'next'});
					}else {
						return false;
					}
				});
			}
		}
	};

	// public return
	return {
		search: function(key) {
			return module.instance[key] || false;
		},
		setup: function(settings) {
			var instance;

			settings['key'] = settings['key'] || 'flicking'; // 중복생성 방지 key 검사
			if(settings['key'] && this.search(settings['key'])) {
				instance = this.search(settings['key']);
				if(instance.change/* && JSON.stringify(instance.settings) !== JSON.stringify(settings)*/) {
					instance.change(settings);
				}
			}else {
				instance = new Flicking(settings);
				if(settings['key'] && instance) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		on: function(key) { // 전체 또는 해당 key
			if(key) {
				this.search(key) && this.search(key).on();
			}else {
				for(key in module.instance) {
					if(module.instance.hasOwnProperty(key)) {
						module.instance[key].on();
					}
				}
			}
		},
		off: function(key) { // 전체 또는 해당 key
			if(key) {
				this.search(key) && this.search(key).off();
			}else {
				for(key in module.instance) {
					if(module.instance.hasOwnProperty(key)) {
						module.instance[key].off();
					}
				}
			}
		}
	};

}, this);