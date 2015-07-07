/*
Core

브라우저 정보, 해상도, 사용자 정보 등 확인
브라우저 기능지원 여부: http://modernizr.com/download/

@version
0.1 (2015.04.09)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
http://www.opensource.org/licenses/MIT

@browser compatibility
IE10 이상
querySelectorAll: Chrome 1, Firefox 3.5, Internet Explorer 8, Opera 10, Safari 3.2
FormData: Chrome 7+, Firefox 4.0, Internet Explorer 10+, Oper 12+, Safari 5+
ECMAScript 5: Chrome 5, Firefox 4.0, Internet Explorer 10+, Oper 12, Safari 5
pointerEvents(HTML/XML content): Chrome 2.0, Firefox 3.6, Internet Explorer 11.0, Oper 15.0, Safari 4.0
*/

(function(api, global) {

	'use strict'; // ES5
	if(typeof global === undefined || global !== window) {
		return false;
	}
	return api(global);

})(function(global) {

	// JS정보: http://www.quirksmode.org/js/detect.html
	// 해상도, 이벤트, 모바일, 브라우저 환경

	'use strict'; // ES5

	// storage
	var storage = {
		'event': {}
	};
	
	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 클라이언드 브라우저 환경
	var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
	var platform = navigator.platform;
	var prefixes = {
		// "브라우저 지원종류": [css벤더프리픽스, transition 종료 후 이벤트, 애니메이션 시작 이벤트, 애니메이션이 반복될때 시작시마다  이벤트, 애니메이션 종료]
		'transform': ['', 'transitionend', 'animationstart', 'animationiteration', 'animationend'], 
		'WebkitTransform': ['-webkit-', 'webkitTransitionEnd', 'webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd'], 
		'MozTransform': ['-moz-', 'transitionend', 'animationstart', 'animationiteration', 'animationend'], 
		'OTransform': ['-o-', 'oTransitionEnd', 'oanimationstart', 'oanimationiteration', 'oanimationend'], 
		'msTransform': ['-ms-', 'MSTransitionEnd', 'MSAnimationStart', 'MSAnimationIteration', 'MSAnimationEnd']
	};
	// 3D지원여부 판단자료: ['perspective', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
	var element = document.createElement('div');
	var nameOffset, verOffset, key;

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 
 
	var core = {
		"check": { // true, false 
			"mobile": (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4))),
			"touch": ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
			"transform": false,
			"fullscreen": (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled)
		},
		"device": null, // pc | mobile | tablet (해상도에 따라 설정)
		"screen": { // browser 사이즈가 아닌 해상도
			"width": screen.availWidth/*Windows Taskbar 제외*/ || screen.width || Math.round(window.innerWidth), 
			"height": screen.availHeight/*Windows Taskbar 제외*/ || screen.height || Math.round(window.innerHeight)
		},
		"browser": {
			"name": null, // chrome | safari | opera | firefox | explorer (브라우저 구분)
			"version": null,
			"size": {
				"window": function() { // browser viewport
					return {
						"width": window.innerWidth || document.documentElement.clientWidth,
						"height": window.innerHeight || document.documentElement.clientHeight
					};
				},
				"document": function() { // HTML document
					return {
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
					};
				},
				"scrollbar": (function() { // 브라우저별 스크롤바 폭 (모바일브라우저 주의)
					var div = document.createElement("div");
					var scrollbar = 0;
					div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
					document.documentElement.appendChild(div);
					scrollbar = div.offsetWidth - div.clientWidth;
					document.documentElement.removeChild(div);
					return scrollbar;
				})() 
			}
		},
		"event": {
			// 마우스 또는 터치
			"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
			"down": 'mousedown',
			"move": 'mousemove',
			"up": 'mouseup',
			"click": "click",
			// 트랜지션, 애니메이션
			"transitionend": "transitionend",
			"animationstart": "animationstart",
			"animationiteration": "animationiteration",
			"animationend": "animationend"
		},
		"css": {
			"prefix": '' // 벤더 프리픽스
		},
		"grid": {
			"width": 0, // 실제 해당도 값에 따른 해상도 기준값(320, 640, 960, 1280~)
			"max_width_count": 0 // 해상도 기준 가로로 들어갈 수 있는 block 개수
		},
		"block": {
			"max_width_size": 4, // 하나의 block 최대 사이즈
			"margin": 5, // block margin (값을 변경할 경우 CSS 해당 px 값도 변경해 주어야 한다.)
			"width": 70, // block size(px) 1개 기준 width 값
			"height": 70, // block size(px) 1개 기준 height 값
			"outer_width": 0, // block size 1개 width 기준 + marign 값
			"outer_height": 0 // block size 1개 height 기준 + marign 값
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// check
	for(key in prefixes) {
		if(element.style[key] !== undefined) {
			core.check.transform = true; // CSS3 지원
			core.css.prefix = prefixes[key][0];
			core.event.transitionend = prefixes[key][1];
			core.event.animationstart = prefixes[key][2];
			core.event.animationiteration = prefixes[key][3];
			core.event.animationend = prefixes[key][4];
			break;
		}
	}

	// device
	core.device = 'pc';
	if(/android/i.test(userAgent)) { // 안드로이드
		// mobile 없으면 태블릿임
		if(/mobile/i.test(userAgent)) {
			core.device = 'mobile';
		}else {
			core.device = 'tablet';
		}
	}else if(/(iphone|ipad|ipod)/i.test(userAgent)) { // 애플
		if(/ipad/i.test(userAgent)) {
			core.device = 'tablet';
		}else {
			core.device = 'mobile';
		}
	}else if(core.check.mobile) {
		core.device = 'mobile';
	}else if(/(MacIntel|MacPPC)/i.test(platform)) {
		core.device = 'pc';
	}else if(/(win32|win64)/i.test(platform)) {
		core.device = 'pc';
	}
	// agent 값보다 스크린 크기를 우선 적용하여 태블릿인지 모바일인지 여부를 결정한다.
	// 테블렛인데 가로 길이가 미달이면 모바일로 인식하게 함
	if((core.device = 'tablet') && core.screen.width && core.screen.height && (Math.min(core.screen.width, core.screen.height) < 768)) {
		core.device = 'mobile';
	}
	// 모바일인데 가로 길이가 넘어가면 테블렛으로 인식하게 함
	if((core.device = 'mobile') && core.screen.width && core.screen.height && (Math.min(core.screen.width, core.screen.height) >= 768)) {
		core.device = 'tablet';
	}

	// browser (if문 순서 중요함)
	core.browser.name  = navigator.appName;
	core.browser.version = String(parseFloat(navigator.appVersion));
	if((verOffset = userAgent.indexOf("opr/")) != -1) {
		core.browser.name = "opera";
		core.browser.version = userAgent.substring(verOffset + 4);
	}else if((verOffset = userAgent.indexOf("opera")) != -1) {
		core.browser.name = "opera";
		core.browser.version = userAgent.substring(verOffset + 6);
		if((verOffset = userAgent.indexOf("version")) != -1) {
			core.browser.version = userAgent.substring(verOffset + 8);
		}
	}else if((verOffset = userAgent.indexOf("msie")) != -1) {
		core.browser.name = "explorer";
		core.browser.version = userAgent.substring(verOffset + 5);
	}else if((verOffset = userAgent.indexOf("chrome")) != -1) {
		core.browser.name = "chrome";
		core.browser.version = userAgent.substring(verOffset + 7);
	}else if((verOffset = userAgent.indexOf("safari")) != -1) {
		core.browser.name = "safari";
		core.browser.version = userAgent.substring(verOffset + 7);
		if((verOffset = userAgent.indexOf("version")) != -1) {
			core.browser.version = userAgent.substring(verOffset + 8);
		}
	}else if((verOffset = userAgent.indexOf("firefox")) != -1) {
		core.browser.name = "firefox";
		core.browser.version = userAgent.substring(verOffset + 8);
	}else if((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) { // In most other browsers, "name/version" is at the end of userAgent 
		core.browser.name = userAgent.substring(nameOffset, verOffset);
		core.browser.version = userAgent.substring(verOffset + 1);
		if(core.browser.name.toLowerCase() == core.browser.name.toUpperCase()) {
			core.browser.name = navigator.appName;
		}
	}
	if((verOffset = core.browser.version.indexOf(';')) != -1) {
		core.browser.version = core.browser.version.substring(0, verOffset);
	}
	if((verOffset = core.browser.version.indexOf(' ')) != -1) {
		core.browser.version = core.browser.version.substring(0, verOffset);
	}

	// event
	if(core.check.touch === true) {
		core.event.down = 'touchstart';
		core.event.move = 'touchmove';
		core.event.up = 'touchend';
		core.event.click = (window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click';
	}

	// grid
	if(0 <= core.screen.width && core.screen.width < 640) { // 0 ~ 639
		core.grid.width = 320;
	}else if(640 <= core.screen.width && core.screen.width < 960) { // 640 ~ 959
		core.grid.width = 640;
	}else if(960 <= core.screen.width && core.screen.width < 1280) { // 960 ~ 1279
		core.grid.width = 960;
	}else if(1280 <= core.screen.width) { // 1280 ~ 와이드
		// 유동적 계산 - 추후 적용하자
		// 1. 전체 사이즈 대비 1개(60px)가 해상도의 %(퍼센트)로 계산 했을 때 몇 픽셀인지 계산
		// 2. margin(10px)도 해당도의 %(퍼센트)로 계산 했을 때 몇 픽셀인지 계산
		// 3. 두 픽셀을 더해서 해상도 대비 최대 몇개의 story가 가로 사이즈로 들어갈 수 있는지 출력
		core.grid.width = 1280;
	}
	core.grid.max_width_count = core.grid.width / (core.block.width + (core.block.margin * 2)); //block.margin * 2 이유 : 여백이 왼쪽, 오른쪽이 있기 때문

	// block
	core.block.outer_width = core.block.width + (core.block.margin * 2);
	core.block.outer_height = core.block.height + (core.block.margin * 2);

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 
	/*
	// resize callback 관리
	var Resize = function() {
		var that = this;
		that.callback = [];
		that.time = null;
		that.func = function() {
			window.clearTimeout(that.time);
			that.time = window.setTimeout(function(){ 
				for(var index in that.callback) {
					that.callback[index]();
				}
			}, 500);
		};
		that.on();
	};
	Resize.prototype = {
		add: function(callback) { // callback 추가
			if(!callback || typeof callback !== 'function') return false;
			this.callback.push(callback);
		},
		del: function(callback) { // callback 제거
			if(!callback || typeof callback !== 'function') return false;
			var index = (this.callback.length > 0) ? this.callback.indexOf(callback) : -1; // 존재여부 확인
			if(index > -1) {
				this.callback.splice(index, 1); // 대기 리스트 요소 제거
			}
		},
		on: (function() { // resize 이벤트 작동
			if(typeof window.addEventListener === 'function') {
				return function() {
					window.addEventListener(core.event.resize, this.func, false);
				}
			}else if(typeof document.attachEvent === 'function') { // IE
				return function() {
					document.attachEvent('on' + core.event.resize, this.func);
				}
			}
		})(),
		off: (function() { // resize 이벤트 정지
			if(typeof window.removeEventListener === 'function') {
				return function() {
					window.removeEventListener(core.event.resize, this.func, false);
				}
			}else if(typeof document.detachEvent === 'function') { // IE
				return function() {
					document.detachEvent('on' + core.event.resize, this.func);
				}
			}
		})()
	};
	var instance_resize = new Resize();
	*/
	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// element (event, style, attr, data, scroll 등)
	// var element = api.element('<div>').style({'': '', '': ''}).attr({'': ''}).data({'': ''}).on('', function() { ... }).get();
	var Element = function(selector, context) {
		// return instance
		if(!(this instanceof Element)) {
			return new Element(selector);
		}

		var match, elements, i, max;
		this.elements = [];
		if(typeof selector === 'object') { 
			/*
			nodeType
			1 : Element 노드를 의미
			2 : Attribute 노드를 의미
			3 : Text 노드를 의미
			4 : CDATASection 노드를 의미
			5 : EntityReference 노드를 의미
			6 : Entity 노드를 의미
			7 : ProcessingInstruction 노드를 의미
			8 : Comment 노드를 의미
			9 : Document 노드를 의미
			10 : DocumentType 노드를 의미
			11 : DocumentFragment 노드를 의미
			12 : Notation 노드를 의미
			*/
			if(selector.nodeType || selector === window) { // DOMElement, window
				this.elements[0] = selector;
			}else if('elements' in selector) {
				return selector;	
			}else if(Object.prototype.toString.call(selector) === '[object Array]') { // array
				this.elements = selector;
			}
		}else if(typeof selector === 'string') { 
			match = /<(\w+)[^>]*>/.exec(selector);
			if(match && match[1]) { // create element
				this.elements[0] = document.createElement(match[1]);
			}else { // search element
				elements = (context || document).querySelectorAll(selector); // querySelectorAll: length 있음, querySelector: length 없음
				if(elements instanceof NodeList || elements instanceof HTMLCollection) {
					for(i=0, max=elements.length; i<max; i++) {
						this.elements[i] = elements[i];
					}
				}
			}
		}
	};
	Element.fn = Element.prototype = {
		// element return
		get: function(index) {
			if(this.elements && typeof this.elements === 'object' && this.elements.length > 0) {
				if(typeof index === 'number') {
					return this.elements[index];
				}else {
					return this.elements;
				}
			}else {
				return [];
			}
		},
		// event
		on: (function() {
			var event_function, return_function;

			// 초기화
			if(typeof window.addEventListener === 'function') {
				event_function = function(events, handlers, capture) {
					this.addEventListener(events, handlers, capture);
				}
			}else if(typeof document.attachEvent === 'function') { // IE
				event_function = function(events, handlers) {
					this.attachEvent('on' + events, handlers);
				}
			}

			// 리턴함수
			return_function = function(events, handlers, capture) {
				var events = events || undefined;
				var handlers = handlers || undefined;
				var capture = (typeof capture === undefined) ? false : capture;
				var arr = [];
				var key, callback;
				var i, max = (this.elements && this.elements.length) || 0;

				// 이벤트 정보
				arr = events.split('.');
				if(arr.length > 1) {
					events = arr.shift();
				}
				key = arr.join('');
				
				// storage
				storage.event[key] = [];

				// 이벤트 설정
				for(i=0; i<max; i++) {
					callback = function() {
						handlers.apply(this, Array.prototype.slice.call(arguments));
					};
					event_function.call(this.elements[i], events, callback, capture);
					storage.event[key].push({
						"element": this.elements[i],
						"events": events,
						"handlers": callback,
						"capture": capture
					});
				}

				return this;
			};

			return return_function;
		})(),
		off: (function() {
			var event_function, return_function;

			// 초기화
			if(typeof window.removeEventListener === 'function') {
				event_function = function(events, handlers, capture) {
					this.removeEventListener(events, handlers, capture);
				}
			}else if(typeof document.detachEvent === 'function') { // IE
				event_function = function(events, handlers) {
					this.detachEvent('on' + events, handlers);
				}
			}

			// 리턴함수
			return_function = function(events) {
				var events = events || undefined;
				var arr = [];
				var key, cache, index;

				// 이벤트 정보
				arr = events.split('.');
				if(arr.length > 1) {
					events = arr.shift();
				}
				key = arr.join('');

				// 이벤트 해제
				if(storage.event[key]) {
					cache = storage.event[key];
					for(index in cache) {
						event_function.call(cache[index].element, cache[index].events, cache[index].handlers, cache[index].capture);
					}
				}

				return this;
			};

			return return_function;
		})(),
		// stylesheet
		style: function(parameter) {
			var key;
			var i, max = (this.elements && this.elements.length) || 0;
			if(!max || !this.elements[0].style) {
				return this;
			}else if(typeof parameter === 'string' && parameter in this.elements[0].style) { // get
				return this.elements[0].style[parameter];
			}else if(typeof parameter === 'object') { // set
				for(i=0; i<max; i++) {
					for(key in parameter) {
						if(key in this.elements[i].style) {
							// 단위(예:px)까지 명확하게 입력해줘야 한다.
							this.elements[i].style[key] = parameter[key];
						}
					}
				}
			}
			return this;
		},
		// attribute
		attr: function(parameter) { 
			var key;
			var i, max = (this.elements && this.elements.length) || 0;
			if(!max) {
				return this;
			}else if(typeof parameter === 'string') { // get
				return this.elements[0].getAttribute(parameter);
			}else if(typeof parameter === 'object') { // set
				for(i=0; i<max; i++) {
					for(key in parameter) {
						this.elements[i].setAttribute(key, parameter[key]);
					}
				}
			}
			return this;
		},
		// data
		data: (function() {
			/*
			! 주의
			data-* 속성값에서 -(hyphen) 다음의 첫글자는 무조건 대문자로 들어가야 한다.
			http://www.sitepoint.com/managing-custom-data-html5-dataset-api/
			*/
			var setTheFirstLetter = function(value) {
				if(typeof value === 'string') {
					return value.replace(/-([a-z])/g, function(value) {
						return value[1].toUpperCase(); 
					});
				}
			};
			if('dataset' in document.createElement('div')) { // IE11 이상
				return function(parameter) {
					var key;
					var i, max = (this.elements && this.elements.length) || 0;
					if(!max) {
						return this;
					}else if(typeof parameter === 'string') { // get
						return this.elements[0].dataset[setTheFirstLetter(parameter)];
					}else if(typeof parameter === 'object') { // set
						for(i=0; i<max; i++) {
							for(key in parameter) {
								this.elements[i].dataset[setTheFirstLetter(key)] = parameter[key];
							}
						}
					}
					return this;
				};
			}else { // attr
				return function(parameter) {
					var key, convert = {};
					var i, max = (this.elements && this.elements.length) || 0;
					if(!max) {
						return this;
					}else if(typeof parameter === 'string') { // get
						return this.attr('data-' + parameter);
					}else if(typeof parameter === 'object') { // set
						for(key in parameter) {
							convert['data-' + key] = parameter[key];
						}
						this.attr(convert);
					}
					return this;
				};
			}
		})(),
		// scroll 정보 / 설정
		scroll: function(parameter) {
			var parameter = parameter || {};
			var key, property;
			var i, max = (this.elements && this.elements.length) || 0;
			var viewport;
			var getViewport = function() {
				if('pageXOffset' in window && 'pageYOffset' in window) {
					return {'left': window.pageXOffset, 'top': window.pageYOffset};
				}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
					return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
				}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
					return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
				}
			};
			
			if(max) {
				if(this.elements[0] === window || this.elements[0].nodeType === 9) { 
					// window, document
					viewport = getViewport();
					if('left' in parameter || 'top' in parameter) {
						window.scrollTo((typeof parameter.left !== 'undefined' ? parameter.left : (viewport.left || 0)), (typeof parameter.top !== 'undefined' ? parameter.top : (viewport.top || 0)));
					}else {
						return {'left': viewport.left, 'top': viewport.top};
					}
				}else { 
					// element
					if('left' in parameter || 'top' in parameter) {
						for(i=0; i<max; i++) {
							for(key in parameter) {
								property = 'scroll' + key.substring(0, 1).toUpperCase() + key.substring(1, key.length).toLowerCase(); // 첫글자 대문자
								if(property in this.elements[i]) {
									this.elements[i][property] = parameter[key];
								}
							}
						}
					}else {
						return {'left': this.elements[0].scrollLeft, 'top': this.elements[0].scrollTop};
					}
				}
			}
		}
	};

	// 터치 이벤트 종류에 따른 콜백
	Element.touch = function(selector, handlers) {
		/*
		// 핵심은 up 이 발생하고, 특정시간 이후까지 down이 발생하지 않으면, 클릭이 몇번발생했는지 카운트를 시작한다.
		api.element.touch('#ysm', 
			{
				'one': function() {
					console.log('one touch');
				},
				'two': function() {
					console.log('two touch');
				},
				'delay': function() {
					console.log('delay touch');
				}
			}
		);
		*/
		if(typeof selector !== 'undefined' && typeof handlers === 'object') {
			Element(selector).on(core['event']['down'], function(e) {
				var event = e || window.event;
				var that = this;

				// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
				if(event.stopPropagation) { 
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
				// 현재 이벤트의 기본 동작을 중단한다.
				if(event.preventDefault) { 
					event.preventDefault();
				}else {
					event.returnValue = false;
				}

				that.touchCount = that.touchCount || 0;
				that.touchTimeDelay = that.touchTimeDelay || null;
				that.touchTimeCount = that.touchTimeCount || null;
				
				// delay check
				window.clearTimeout(that.touchTimeCount);
				that.touchTimeDelay = window.setTimeout(function() {
					that.touchCount = -1;
					if(handlers.delay && typeof handlers.delay === 'function') {
						handlers.delay.call(that);
					}
				}, 1000);
			});
			Element(selector).on(core['event']['up'], function(e) {
				var event = e || window.event;
				var that = this;

				that.touchCount += 1;

				// click check: 지정된 시간까지 다음 클릭이 발생하지 않는다면, count 값을 확인하여 해당 콜백을 실행한다.
				window.clearTimeout(that.touchTimeDelay);
				that.touchTimeCount = window.setTimeout(function() {
					if(that.touchCount === 1) {
						if(handlers.one && typeof handlers.one === 'function') {
							handlers.one.call(that);
						}
					}else if(that.touchCount === 2) {
						if(handlers.two && typeof handlers.two === 'function') {
							handlers.two.call(that);
						}
					}
					that.touchCount = 0;
				}, 200);
			});
		}
	};

	// extend
	Element.extend = Element.fn.extend = function(parameter) {
		var value = typeof parameter === 'object' ? parameter : {};
		var key;
		for(var key in value) {
			if(this.hasOwnProperty(key)) {
				continue;
			}
			// this : Element.extend( ... ), Element.fn.extend( ... ) 분리
			// api.element.test = function() { ... }   <- 같은 기능 ->   api.element.extend({'test': function() { ... }})
			// api.element.fn.test = function() { ... }   <- 같은 기능 ->   api.element.fn.extend({'test': function() { ... }})
			this[key] = value[key];
		}
	};
	
	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	global.api = {
		"core": core,
		"element": Element
		/*"resize": instance_resize*/
	};

}, this);
