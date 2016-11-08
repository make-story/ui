/*
Flicking

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE9 이상
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
		// 트랜지션
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
		// event
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
		}
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
			setTranslate: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var target = parameter['target'];
				var duration = parameter['duration'];
				var translateX = parameter['translateX'] || 0;
				var translateY = parameter['translateY'] || 0;

				try {
					target.style.webkitTransitionDuration = target.style.MozTransitionDuration = target.style.msTransitionDuration = target.style.OTransitionDuration = target.style.transitionDuration = duration + 's';
					target.style.webkitTransform = 'translate(' + translateX + 'px, ' + translateY + 'px)' + 'translateZ(0)';
					target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translate(' + translateX + 'px, ' + translateY + 'px)';
					return true;
				}catch(e) {
					console.log(e);
					return false;	
				}
			},
			setAnimate: function(parameter) {

			},
			// 현재 이벤트의 기본 동작을 중단한다.
			stopCapture: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
			},
			// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
			stopBubbling: function(e) {
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
			'flow': 'horizontal', // 플리킹 방향 (horizontal, vertical)
			'width': 'auto', // 슬라이드 width 값 설정 (auto: 슬라이드가 target 가운데 위치하도록 wrap width 값에 따라 자동설정)
			'height': 'auto', // 슬라이드 height 값 설정
			'speed': 300, // 슬라이드 속도
			'touch': true, // 클릭 또는 터치 슬라이드 작동여부
			'auto': 0, // 자동 슬라이드 작동여부 (0 이상의 값이 입력되면 작동합니다.)
			'wheel': false, // 마우스 휠 이벤트 작동여부
			'callback': { // 플리킹 작동 callback (선택)
				'init': null,
				'next': null,
				'prev': null,
				'slidechange': null,
				'append': null,
				'remove': null
			},
			'transitionend': null
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.total = 0; // 총 슬라이드 수
		that.index = 1; // 현재 출력되고 있는 슬라이드 (1부터 시작)
		that.width = {}; // 플리킹 wrap width value, unit 값
		that.height = {}; // 플리킹 wrap height value, unit 값
		that.translate = 0; // container 의 현재 translateX 값
		that.time = null; // 자동슬라이드 time key
		
		// target
		that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
		that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));
		that.elements.parent = that.elements.target.parentNode; // target 상위 element
		that.elements.children = that.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
		that.total = that.elements.children.length || 0;

		// init
		that.init();
		that.wrap();
		that.view();
		that.on();
		that.auto({'mode': 'start'});
		that.wheel({'mode': 'on'});

		// callback
		if(typeof that.settings.callback.init === 'function') {
			that.settings.callback.init.call(that, that.elements.target);
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
		// 플리킹(target) width, style 등 설정
		wrap: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var parent = that.elements.parent;
			var target = that.elements.target;
			var flow = that.settings.flow;
			var tmp;
			var style = {
				'parent': {},
				'target': {}
			};
			var translate = {
				'target': target,
				'duration': Number(that.settings.speed) / 1000
			};

			// resize event off
			$(window).off('resize.EVENT_RESIZE_FLICKING_' + that['settings']['key']);
			
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

			// 사용자가 임의로 width /  height 를 설정
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

			// auto (parent element의 width / height 를 구함)
			if(that.settings.width === 'auto' || that.settings.height === 'auto') {
				// target 상위 parent element 의 정확한 값을 구하기 위해 플리킹 wrap 의 width / height 초기화
				// float해제방식: overflow: hidden; 또는 부모요소 inline-block
				$(target).css({'width': '0px', 'height': '0px', 'overflow': 'hidden'});
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
				// resize event on
				(function() {
					var time = null;
					$(window).on('resize.EVENT_RESIZE_FLICKING_' + that['settings']['key'], function(e) {
						window.clearTimeout(time);
						time = window.setTimeout(function(){ 
							that.wrap();
							that.view();
						}, 60);
					});
				})();
			}

			// style / translate
			style['parent']['overflow'] = 'hidden';
			style['target']['height'] = 'auto';
			if(that.settings.flow === 'vertical') {
				//style['parent']['overflow-x'] = 'visible';
				//style['parent']['overflow-y'] = 'hidden';
				style['target']['width'] = that.width.value + 'px';
				translate['translateY'] = that.translate = (that.height.value * (that.index - 1)) * -1;
			}else {
				//style['parent']['overflow-x'] = 'hidden';
				//style['parent']['overflow-y'] = 'visible';
				style['target']['width'] = (that.width.value * that.total) + 'px';
				translate['translateX'] = that.translate = (that.width.value * (that.index - 1)) * -1;
			}
			$(parent).css(style['parent']);
			$(target).css(style['target']);
			module.setTranslate(translate); // resize 콜백 발생시 슬라이드 위치 초기화
			
			return that;
		},
		// 슬라이드 width, style 등 설정
		view: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var index = parameter['index']; // 해당 슬라이드 index
			var element = parameter['element']; // 해당 슬라이드 element
			var i, max;
			var setStyle = function(element) {
				var width = 0, height = 0;
				var rect = {};
				var style = {}; // 슬라이드 기본 style 설정 값
				var margin = 0; // 가운데 정렬을 위한 양쪽 여백

				if(element) {
					element = $(element);
					// 슬라이드의 width / height 값 계산(정확한 width / height 값 반환을 위해 float: left 설정, max-width 값 초기화)
					// 플리킹을 위한 기본 style 설정
					element.css({'float': 'left', 'position': 'relative', 'display': 'block', 'min-width': 'none', 'max-width': 'none', 'min-height': 'none', 'max-height': 'none'}); 

					// border 값을 포함한 width / height 값
					width = Number(module.numberReturn(element.outerWidth()) || 0); 
					height = Number(module.numberReturn(element.outerHeight()) || 0); 
					if(element.get(0).getBoundingClientRect) { // chrome 에서는 정수가 아닌 실수단위로 정확한 값을 요구하므로 getBoundingClientRect 사용
						rect = element.get(0).getBoundingClientRect(); // width/height: IE9 이상 지원
						if('width' in rect || 'height' in rect) { 
							width = rect.width || width;
							height = rect.height || height;
						}
					}

					// style (px, em, rem 에 따른 분기 작업필요)
					style['margin-left'] = '0px';
					style['margin-right'] = '0px';
					style['margin-top'] = '0px';
					style['margin-bottom'] = '0px';
					if(width <= 0 || that.width.value < width) {
						// 슬라이드 width 크기가 플리킹 wrap width 보다 클경우 강제 width 설정
						style['max-width'] = that.width.value + 'px';
					}else if(that.settings.width === 'auto') {
						// 양쪽 여백값 (슬라이드를 가운데 위치시키기 위함)
						style['margin-left'] = style['margin-right'] = ((that.width.value - width) / 2) + 'px'; 
					}else {
						//
						style['min-width'] = that.width.value + 'px';
					}
					if(that.settings.flow === 'vertical') {
						if(height <= 0 || that.height.value < height) {
							style['max-height'] = that.height.value + 'px';
						}else if(that.settings.height === 'auto'){
							style['margin-top'] = style['margin-bottom'] = ((that.height.value - height) / 2) + 'px'; 	
						}else {
							style['min-height'] = that.height.value + 'px';
						}
					}
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
				that.elements.children = that.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
				that.total = that.elements.children.length || 0; 
				$(that.elements.target).css({'width': (that.settings.flow === 'vertical' ? that.width.value : (that.width.value * that.total)) + 'px'}); 
				that.view({'index': that.total});

				// callback
				if(typeof that.settings.callback.append === 'function') {
					that.settings.callback.append.call(that, element);
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
							element = that.index && that.elements.children[that.index-1] || element;
							break;
						case 'last':
							element = that.total && that.elements.children[that.total-1] || element;
							break;
					}
				}
			}

			element = $(element).get(0);
			if(typeof element === 'object' && element.nodeType && element.parentNode.removeChild(element)) {
				that.elements.children = that.elements.target.children; // 슬라이드 elements (IE8 이하 사용 불가능)
				that.total = that.elements.children.length || 0; 
				$(that.elements.target).css({'width': (that.settings.flow === 'vertical' ? that.width.value : (that.width.value * that.total)) + 'px'}); 
				if(is) {
					that.slide({'index': 'prev'});
				}

				// callback
				if(typeof that.settings.callback.remove === 'function') {
					that.settings.callback.remove.call(that, that.elements.target);
				}
			}

			return that;
		},
		// 설정값 변경
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'callback':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.callback[tmp] = settings[key][tmp];
								}
							}
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
		// 슬라이드 위치 설정
		slide: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var index = parameter['index'] && typeof parameter['index'] === 'string' && String(parameter['index']).toLowerCase() || parameter['index']; // index 숫자이면 해당 index로 이동, next || prev 이면 해당 모드에 따라 이동
			var duration = parameter['duration'] ? parameter['duration'] : Number(that.settings.speed) / 1000;

			var is = false; // 이동이 발생했는지 여부
			var before = that.index; 
			var after = that.index;
			var translate = {
				'target': that.elements.target,
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
				translate['translateX'] = that.translate = (that.width.value * ((is ? after : before) - 1)) * -1;
			}else if(that.settings.flow === 'vertical') {
				translate['translateY'] = that.translate = (that.height.value * ((is ? after : before) - 1)) * -1;
			}
			module.setTranslate(translate);

			if(is) {
				// 값 변경
				that.index = after;
				// callback
				if(before < after && typeof that['settings']['callback']['next'] === 'function') { // next
					that['settings']['callback']['next'].call(that, that.elements.target);
				}else if(before > after && typeof that['settings']['callback']['prev'] === 'function') { // prev
					that['settings']['callback']['prev'].call(that, that.elements.target);
				}
				if(typeof that['settings']['callback']['slidechange'] === 'function') { // slidechange
					that['settings']['callback']['slidechange'].call(that, that.elements.target);
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
					var target = event && event.target; // event 가 발생한 element
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.touches; // touchstart

					// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.
					// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 스크롤이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
					if(!env['check']['touch'] && /[^input|select|textarea|button]/i.test(target.tagName)) {
						// PC에서는 마우스 이벤트 정확도(기능 정상작동)를 올리기 위해 정지
						module.stopCapture(event);
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
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches || event.changedTouches;
						var left, top;
						var is = false;
						var translate = {
							'target': that.elements.target,
							'duration': 0
						};

						// 현재 이벤트의 기본 동작을 중단한다.
						if(that.settings.flow === 'vertical') {
							module.stopCapture(event);
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

						// 사용자 터치가 스크롤인지 슬라이드인지 확인하여 안정화함
						if(that.settings.flow === 'horizontal' && Math.abs(left - that['start']['left']) > Math.abs(top - that['start']['top'])) {
							is = true;
							translate['translateX'] = (left - that['start']['left']) + that.translate;
						}else if(that.settings.flow === 'vertical' && Math.abs(top - that['start']['top']) > Math.abs(left - that['start']['left'])) {
							is = true;
							translate['translateY'] = (top - that['start']['top']) + that.translate;
						}
						if(is) {
							// 현재 이벤트의 기본 동작을 중단한다. (슬라이드가 작동중일 때 모바일의 기본이벤트인 스크롤 작동을 중단시킨다.)
							module.stopCapture(event);
							// slide 이동
							module.setTranslate(translate);
						}
					});
					
					// up 이벤트
					$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_FLICKING_' + that['settings']['key'], function(e) {
						//console.log('[정보] flicking MOUSEUP');
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.changedTouches; // touchend
						var time;
						var left, top;
						var index, duration;
						var is = false;

						// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 슬라이드 내부 a 태그등이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
						//module.stopCapture(event);

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
						if(that.settings.flow === 'horizontal' && ((Math.abs(left) > Math.abs(top) && (time <= 100 && 30 <= Math.abs(left)/*마우스를 빠르게 이동한 경우*/)) || (that.width.value / 6) < Math.abs(left)/*기준값 이상 이동한 경우*/)) {
							if(index < that.total && left < 0) { // 다음
								index++;
							}else if(1 < index && left > 0) { // 이전
								index--;
							}
							// 슬라이드 속도
							duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
						}else if(that.settings.flow === 'vertical' && ((Math.abs(top) > Math.abs(left) && (time <= 100 && 30 <= Math.abs(top)/*마우스를 빠르게 이동한 경우*/)) || (that.height.value / 6) < Math.abs(top)/*기준값 이상 이동한 경우*/)) {
							if(index < that.total && top < 0) { // 다음
								index++;
							}else if(1 < index && top > 0) { // 이전
								index--;
							}
							// 슬라이드 속도
							duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
						}

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
				if(typeof that['settings']['transitionend'] === 'function') {
					$(that.elements.target).on(env['event']['transitionend'] + '.EVENT_TRANSITION_FLICKING_' + that['settings']['key'], function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						if(that.elements.target.isEqualNode(event.target)) {
							that['settings']['transitionend'].call(that, that.elements.target);
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

			window.clearTimeout(that.time);
			if(mode === 'start' && that.settings.auto > 0) {
				that.time = window.setTimeout(function() {
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
					module.stopCapture(event);

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