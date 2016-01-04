/*
Support (클라이언트 환경정보, DOM제어 등)

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
IE9 이상 (트랜지션, 애니메이션 등의 사용은 IE10 이상)
querySelectorAll: Chrome 1, Firefox 3.5, Internet Explorer 8, Opera 10, Safari 3.2
element.classList: Chrome 8.0, Firefox 3.6, Internet Explorer 10, Opera 11.50, Safari 5.1
getBoundingClientRect(): width/height IE9부터 지원
box-sizing: border-box; IE8 이상 (boder 효과가 화면상에 안보일 수 있으니 주의한다.)

@webapi 참고
https://developer.mozilla.org/en-US/docs/Web/API
http://www.quirksmode.org/js/detect.html

-
추후 웹스토리지(로컬스토리지)에 현재 코드를 저장하여, 보다 빠른 로딩경험을 제공하자.
*/

;(function(factory, global) {

	if(typeof global === 'undefined' || global !== window) {
		return false;
	}else {
		// 클라이언트 환경정보(브라우저 버전 등)를 우선 확인한다.
		global.api = (function() {
			'use strict'; // ES5

			// 클라이언트 브라우저 환경
			var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
			var platform = navigator.platform;
			var nameOffset, verOffset;
			var key;
			var element = document.createElement('div');
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
			// 3D지원여부 판단자료: ['perspective', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
		 	var environment = { // PC, 사용자 환경
				//"zindex": 100,
				"check": { // true, false 
					"mobile": (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4))),
					"touch": ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
					"transform": false,
					"transition": false/*('transition' in element.style || 'WebkitTransition' in element.style || 'MozTransition' in element.style || 'OTransition' in element.style || 'msTransition' in element.style)*/,
					"animation": false/*('animationName' in element.style || 'WebkitAnimationName' in element.style || 'MozAnimationName' in element.style || 'OAnimationName' in element.style || 'msAnimationName' in element.style || 'KhtmlAnimationName' in element.style)*/,
					"fullscreen": (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled)
				},
				"device": null, // pc | mobile | tablet (해상도에 따라 설정가능)
				"screen": { // browser 사이즈가 아닌 해상도 값
					"width": screen.availWidth/*Windows Taskbar 제외*/ || screen.width || Math.round(window.innerWidth), 
					"height": screen.availHeight/*Windows Taskbar 제외*/ || screen.height || Math.round(window.innerHeight)
				},
				"browser": {
					"name": null, // chrome | safari | opera | firefox | explorer (브라우저 구분)
					"version": null,
					"scrollbar": (function() { // 브라우저별 스크롤바 폭 (모바일브라우저 주의)
						var div = document.createElement("div");
						var scrollbar = 0;
						div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
						document.documentElement.appendChild(div);
						scrollbar = div.offsetWidth - div.clientWidth;
						document.documentElement.removeChild(div);
						return scrollbar;
					})()
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
					//"prefix": '', // 벤더 프리픽스
					//"transform": ''
				},
				// grid, block 값은 추후 api.grid.js 옮겨서 사용자가 임의로 수정하지 못하도록 하자
				"grid": { 
					"width": 0, // 실제 해당도 값에 따른 해상도 기준값(320, 640, 960, 1280~)
					"width_count": 0 // 해상도 기준 가로로 들어갈 수 있는 block 개수
				},
				"block": { 
					"max_width_size": 3, // block 하나의 최대 가로 사이즈
					"width": 90, // block size(px) 1개 기준 width 값
					"height": 90, // block size(px) 1개 기준 height 값
					//"margin": 5, // block margin (값을 변경할 경우 CSS 해당 px 값도 변경해 주어야 한다.)
					"margin_width": 5, // 좌우 여백
					"margin_height": 5, // 상하 여백
					"outer_width": 0, // block size 1개 width 기준 + marign 값
					"outer_height": 0 // block size 1개 height 기준 + marign 값
				}
			};
			// 트랜스폼
			for(key in transforms) {
				if(element.style[key] !== undefined) {
					environment['check']['transform'] = true;
					//environment['css']['transform'] = transforms[key];
					break;
				}
			}
			// 트랜지션
			for(key in transitions) {
				if(element.style[key] !== undefined) {
					environment['check']['transition'] = true;
					environment['event']['transitionend'] = transitions[key];
					break;
				}
			}
			// 애니메이션 확인
			for(key in animations) {
				if(element.style[key] !== undefined) {
					environment['check']['animation'] = true;
					environment['event']['animationstart'] = animations[key][0];
					environment['event']['animationiteration'] = animations[key][1];
					environment['event']['animationend'] = animations[key][2];
					break;
				}
			}

			// device
			environment['device'] = 'pc';
			if(/android/i.test(userAgent)) { // 안드로이드
				// mobile 없으면 태블릿임
				if(/mobile/i.test(userAgent)) {
					environment['device'] = 'mobile';
				}else {
					environment['device'] = 'tablet';
				}
			}else if(/(iphone|ipad|ipod)/i.test(userAgent)) { // 애플
				if(/ipad/i.test(userAgent)) {
					environment['device'] = 'tablet';
				}else {
					environment['device'] = 'mobile';
				}
			}else if(environment.check.mobile) {
				environment['device'] = 'mobile';
			}else if(/(MacIntel|MacPPC)/i.test(platform)) {
				environment['device'] = 'pc';
			}else if(/(win32|win64)/i.test(platform)) {
				environment['device'] = 'pc';
			}

			/*
			// agent 값보다 스크린 크기를 우선 적용하여 태블릿인지 모바일인지 여부를 결정한다.
			// 테블렛인데 가로 길이가 미달이면 모바일로 인식하게 함
			if((environment['device'] = 'tablet') && environment['screen']['width'] && environment.screen.height && (Math.min(environment['screen']['width'], environment.screen.height) < 768)) {
				environment['device'] = 'mobile';
			}
			// 모바일인데 가로 길이가 넘어가면 테블렛으로 인식하게 함
			if((environment['device'] = 'mobile') && environment['screen']['width'] && environment.screen.height && (Math.min(environment['screen']['width'], environment.screen.height) >= 768)) {
				environment['device'] = 'tablet';
			}
			*/

			// browser (if문 순서 중요함)
			environment['browser']['name'] = navigator.appName;
			environment['browser']['version'] = String(parseFloat(navigator.appVersion));
			if((verOffset = userAgent.indexOf("opr/")) != -1) {
				environment['browser']['name'] = "opera";
				environment['browser']['version'] = userAgent.substring(verOffset + 4);
			}else if((verOffset = userAgent.indexOf("opera")) != -1) {
				environment['browser']['name'] = "opera";
				environment['browser']['version'] = userAgent.substring(verOffset + 6);
				if((verOffset = userAgent.indexOf("version")) != -1) {
					environment['browser']['version'] = userAgent.substring(verOffset + 8);
				}
			}else if((verOffset = userAgent.indexOf("msie")) != -1) {
				environment['browser']['name'] = "explorer";
				environment['browser']['version'] = userAgent.substring(verOffset + 5);
			}else if((verOffset = userAgent.indexOf("chrome")) != -1) {
				environment['browser']['name'] = "chrome";
				environment['browser']['version'] = userAgent.substring(verOffset + 7);
			}else if((verOffset = userAgent.indexOf("safari")) != -1) {
				environment['browser']['name'] = "safari";
				environment['browser']['version'] = userAgent.substring(verOffset + 7);
				if((verOffset = userAgent.indexOf("version")) != -1) {
					environment['browser']['version'] = userAgent.substring(verOffset + 8);
				}
			}else if((verOffset = userAgent.indexOf("firefox")) != -1) {
				environment['browser']['name'] = "firefox";
				environment['browser']['version'] = userAgent.substring(verOffset + 8);
			}else if((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) { 
				environment['browser']['name'] = userAgent.substring(nameOffset, verOffset);
				environment['browser']['version'] = userAgent.substring(verOffset + 1);
				if(environment['browser']['name'].toLowerCase() == environment['browser']['name'].toUpperCase()) {
					environment['browser']['name'] = navigator.appName;
				}
			}
			if((verOffset = environment['browser']['version'].indexOf(';')) != -1) {
				environment['browser']['version'] = environment['browser']['version'].substring(0, verOffset);
			}
			if((verOffset = environment['browser']['version'].indexOf(' ')) != -1) {
				environment['browser']['version'] = environment['browser']['version'].substring(0, verOffset);
			}

			// event
			if(environment['check']['touch'] === true) {
				environment['event']['down'] = 'touchstart';
				environment['event']['move'] = 'touchmove';
				environment['event']['up'] = 'touchend';
				environment['event']['click'] = (window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click';
			}

			// block
			environment['block']['outer_width'] = environment['block']['width'] + (environment['block']['margin_width'] * 2);
			environment['block']['outer_height'] = environment['block']['height'] + (environment['block']['margin_height'] * 2);
			
			// grid
			// 해상도 대비(모바일의 경우 width, height 중 작은값) 최대 들어갈수 있는 블록 개수가 grid의 가로 최종값이 된다.
			if(environment['device'] === 'pc') {
				environment['grid']['width'] = Math.floor(environment['screen']['width'] / environment['block']['outer_width']) * environment['block']['outer_width'];
			}else {
				environment['grid']['width'] = Math.floor(Math.min(environment['screen']['width'], environment['screen']['height']) / environment['block']['outer_width']) * environment['block']['outer_width'];	
			}
			/*if(0 <= environment['screen']['width'] && environment['screen']['width'] < 640) { // 0 ~ 639
				//environment['grid']['width'] = 320;
				environment['grid']['width'] = 300; // PC 스크롤바 가로사이즈를 생각한 값
			}else if(640 <= environment['screen']['width'] && environment['screen']['width'] < 960) { // 640 ~ 959
				//environment['grid']['width'] = 640;
				environment['grid']['width'] = 600;
			}else if(960 <= environment['screen']['width'] && environment['screen']['width'] < 1280) { // 960 ~ 1279
				//environment['grid']['width'] = 960;
				environment['grid']['width'] = 900;
			}else if(1280 <= environment['screen']['width']) { // 1280 ~ 와이드
				// 유동적 계산 - 추후 적용하자
				// 1. 전체 사이즈 대비 1개(60px)가 해상도의 %(퍼센트)로 계산 했을 때 몇 픽셀인지 계산
				// 2. margin(10px)도 해당도의 %(퍼센트)로 계산 했을 때 몇 픽셀인지 계산
				// 3. 두 픽셀을 더해서 해상도 대비 최대 몇개의 story가 가로 사이즈로 들어갈 수 있는지 출력
				//environment['grid']['width'] = 1280;
				environment['grid']['width'] = 1200;
			}*/
			environment['grid']['width_count'] = environment['grid']['width'] / (environment['block']['width'] + (environment['block']['margin_width'] * 2)); // block.margin_width * 2 이유 : 여백이 왼쪽, 오른쪽이 있기 때문

			// 라이브러리를 확장으로 사용할 수 있도록 한다.
			/*var extend = function extend(obj) {
				var key;
				if(typeof obj === 'object') {
					for(key in obj) {
						extend[key] = obj[key];
					}
				}
			};*/
			/*
			api.extend.set({
				'grid': {
					'Display': {
						'test': function() {
							alert('test');
						}
					}
				}
			});
			api.extend.get('grid.Display');
			*/
			var extend = {
				set: function(obj) {
					var key;
					for(key in obj) {
						if(!/set|get/ig.test(key)) {
							this[key] = obj[key];
						}
					}
				},
				get: function(chaining) {
					var arr;
					var i, max;
					var obj;
					if(typeof chaining === 'string' && chaining.length > 0) {
						arr = chaining.split('.');
						i = 0;
						max = arr.length;
						if(obj = this[arr[i]]) {
							do {
								i++;
								if(obj[arr[i]]) {
									obj = obj[arr[i]];
								}else {
									break;
								}
							}while(i < max);
						}
						
						return obj;
					}
					return false
				}
			};

			// 브라우저 버전체크
			if(environment['browser']['name'] === 'explorer' && environment['browser']['version'] < 8.0) {
				// 브라우저 지원범위에 따른 최소 기능만 제공
				return {
					"env": environment,
					"extend": extend
				};
			}

			// 기능 조립
			return factory(global, environment, extend);
		})();
	}

})(function(global, environment, extend, undefined) {

	'use strict'; // ES5

	// isArray (IE9부터 지원)
	/*if(!Array.isArray) {
		Array.isArray = function(arg) {
			return Object.prototype.toString.call(arg) === '[object Array]';
		};
	}*/

	// 정규식
	var regexp = {
		pixel_unit_list: /width$|height$|top|right|bottom|left|fontSize|letterSpacing|lineHeight|^margin*|^padding*/i, // 단위 px 해당되는 것
		num: /^[+-]?\d+(\.\d+)?$/ // 숫자
	};

	// 일반적인 고유키 생성 (id="" 속성의 경우 첫글자가 문자로 시작해야 한다.)
	var getKey = function() {
		/*
		-
		ES6
		심볼(Symbol)은 프로그램이 이름 충돌의 위험 없이 속성(property)의 키(key)로 쓰기 위해 생성하고 사용할 수 있는 값입니다.
		Symbol()을 호출하면 새로운 심볼 값이 생성됩니다. 이 값은 다른 어떤 값과도 다릅니다.
		*/
		var arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'/*,'0','1','2','3','4','5','6','7','8','9'*/];
		var date = new Date();
		return [arr[Math.floor(Math.random() * arr.length)], Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), date.getFullYear(), (Number(date.getMonth()) + 1), date.getDate()].join('');
	};

	// event name 크로스브라우저에 따른 자동 변경
	var setEventTypeChange = function(events) {
		if(typeof events === 'string' && /transitionend|animationstart|animationiteration|animationend/i.test(events.toLowerCase())) {
			events = events.toLowerCase(); // 주의! 이벤트명을 모두 소문자로 변경했을 때 작동하지 않는 이벤트가 있다. (DOMMouseScroll)
			if(/transitionend/i.test(events) && environment['event']['transitionend']) {
				events = environment['event']['transitionend'];
			}else if(/animationstart/i.test(events) && environment['event']['animationstart']) {
				events = environment['event']['animationstart'];
			}else if(/animationiteration/i.test(events) && environment['event']['animationiteration']) {
				events = environment['event']['animationiteration'];
			}else if(/animationend/i.test(events) && environment['event']['animationend']) {
				events = environment['event']['animationend'];
			}
		}
		return events;
	};

	// window.ScrollX, window.ScrollY 크로스 브라우저
	var getScrollXY = function() {
		// https://developer.mozilla.org/ko/docs/Web/API/Window/scrollY
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
		return {
			'x': supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft, 
			'y': supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop
		};
	};

	// 숫자/단위 분리 (예: 10px -> [0]=>10px, [1]=>10, [2]=>'px')
	var getNumberUnit = function(value) {
		var regexp_source_num = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
		var regexp_number = new RegExp("^(" + regexp_source_num + ")(.*)$", "i");
		var matches = regexp_number.exec(value);
		if(matches) {
			return matches;
		}else {
			return [value];
		}
	};

	// inner, outer 관련
	var getAugmentWidthHeight = function(elements, property) {
		var value = {
			'padding': 0,
			'border': 0,
			'margin': 0
		};
		var arr = [], i, max, tmp;

		//
		if(!elements || !elements instanceof DOM || !property || !(/^(width|height)$/i.test(property))) {
			return value;
		}

		// width, height 에 따라 추가할 위치
		if(property === 'width') {
			arr = ["Left", "Right"];
		}else if(property === 'height') {
			arr = ["Top", "Bottom"];
		}
		for(i=0, max=arr.length; i<max; i++) {
			// padding
			tmp = getNumberUnit(elements.style('padding' + arr[i]));
			value['padding'] += (tmp && tmp[1] && !isNaN(parseFloat(tmp[1])) && isFinite(tmp[1])) ? Number(tmp[1]) : 0; // 숫자형 검사
			// border
			tmp = getNumberUnit(elements.style('border' + arr[i] + 'Width'));
			value['border'] += (tmp && tmp[1] && !isNaN(parseFloat(tmp[1])) && isFinite(tmp[1])) ? Number(tmp[1]) : 0;
			// margin
			tmp = getNumberUnit(elements.style('margin' + arr[i]));
			value['margin'] += (tmp && tmp[1] && !isNaN(parseFloat(tmp[1])) && isFinite(tmp[1])) ? Number(tmp[1]) : 0;
		}
		
		return value;
	};

	// width, height 등 사이즈 정보 반환
	// extra: inner(padding), outer(border) 값 포함구분
	// is: margin 값 포함여부
	var getElementWidthHeight = function(elements, property, extra, is) {
		if(!elements || !elements instanceof DOM || !property || !(/^(width|height)$/i.test(property)) || (extra && !/^(inner|outer)$/i.test(extra))) return 0;
		//var is_border_box = (elements.style('boxSizing') === 'border-box') ? true : false;
		var is_display = (elements.style('display') === 'none') ? true : false;
		var queue = { 
			/*
			css property 기본값
			position: static
			visibility: visible
			display: inline | block
			*/
			'position': /^(static)$/i,
			'visibility': /^(visible)$/i,
			'display': /^(inline|block)$/i
		};
		var value = 0;
		var key, tmp;

		// display가 none 경우 width, height 추출에 오차가 발생한다.
		if(is_display === true) {
			// 현재 설정된 css 값 확인
			for(key in queue) {
				if(tmp = elements.style(key)) {
					if(queue[key].test(tmp)) { 
						// 현재 element에 설정된 style의 값이 queue 목록에 지정된 기본값(style property default value)과 동일하거나 없으므로 
						// 작업 후 해당 property 초기화(삭제)
						queue[key] = null;
					}else { 
						// 현재 element에 설정된 style의 값이 queue 목록에 지정된 기본값(style property default value)이 아니므로 
						// 현재 설정된 값을 저장(종료 후 현재값으로 재설정)
						queue[key] = tmp;
					}
				}
			}
			// display가 none 상태의 element 의 크기를 정확하게 추출하기 위한 임시 css 설정
			elements.style({'position': 'absolute', 'visibility': 'hidden', 'display': 'block'});
		}

		// 해당 property 값
		value = elements.get(0)['offset' + (property.substring(0, 1).toUpperCase() + property.substring(1))]; // offsetWidth, offsetHeight (border + padding + width 값, display: none 의 경우는 0 반환)
		if(value <= 0 || value == null) {
			// css로 값을 구한다.
			tmp = getNumberUnit(elements.style(property));
			value = (tmp && tmp[1] && !isNaN(parseFloat(tmp[1]))) && isFinite(tmp[1]) ? Number(tmp[1]) : 0;
			if(extra) {
				// inner, outer 추가
				tmp = getAugmentWidthHeight(elements, property);
				value += tmp['padding'];
				if(extra === 'outer') {
					value += tmp['border'];
					if(is === true) {
						value += tmp['margin'];
					}
				}
			}
		}else {
			// offset 값 가공 (margin, border, padding)
			tmp = getAugmentWidthHeight(elements, property);
			if(extra) {
				if(extra === 'inner') {
					value -= tmp['border'];
				}else if(extra === 'outer' && is === true) {
					value += tmp['margin'];
				}
			}else {
				value -= tmp['border'];
				value -= tmp['padding'];
			}
		}
		
		// 값 반환을 위해 임시 수정했던 style 복구
		if(is_display === true) {
			// queue
			elements.style(queue);
		}

		return value;
	};

	// DOM (event, style, attr, data, scroll 등)
	// var element = api.dom('<div>').style({'': '', '': ''}).attr({'': ''}).data({'': ''}).on('', function() { ... }).get();
	// WEB API 기능을 사전처럼 빠르게 인덱싱하는데 목적이 있다.
	function DOM(selector, context) {
		// return instance
		if(!(this instanceof DOM)) {
			return new DOM(selector, context);
		}

		var match1, match2, elements, i, max;
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
			if(selector.nodeType || selector === window) { // DOMElement, window (querySelectorAll 반환값 nodeType 은 undefined)
				this.elements[0] = selector;
			}else if('elements' in selector) {
				return selector;
			}else if(Object.prototype.toString.call(selector) === '[object Array]'/*Array.isArray(selector)*/) { // array list (api.dom 으로 리턴된 것)
				this.elements = selector;
			}else if(Object.keys(selector).length > 0) { // object list (querySelectorAll 으로 리턴된 것)
				max = 0;
				for(i in selector) {
					if(selector.hasOwnProperty(i) && selector[i].nodeType) {
						this.elements[max] = selector[i];
						max++;
					}
				}
			}else {
				//console.log('[오류] dom search error');
			}
		}else if(typeof selector === 'string') { 
			match1 = /<(\w+:\w+|\w+)[^>]*/.exec(selector); // tag create 확인 정규식 (<svg:g> 또는 <div> 형식)
			//match1 = /<(\w+)[^>]*/.exec(selector); // tag create 확인 정규식 (createElementNS 사용안할경우)
			if(match1 && match1[1]) { // create element
				match2 = /(\w+):(\w+)/.exec(selector);
				switch(match2 && match2[1] && match2[2] && match2[1].toLowerCase()) {
					case 'xhtml':
						this.elements[0] = document.createElementNS("http://www.w3.org/1999/xhtml", match2[2]);
						break;
					case 'math':
						this.elements[0] = document.createElementNS("http://www.w3.org/1998/Math/MathML", match2[2]);
						break;
					case 'svg':
						this.elements[0] = document.createElementNS("http://www.w3.org/2000/svg", match2[2]);
						break;
					case 'text':
						// text node
						// http://www.mediaevent.de/javascript/DOM-Neue-Knoten.html
						this.elements[0] = document.createTextNode(match2[2]);
						break;
					default:
						// element node
						this.elements[0] = document.createElement(match1[1]);
						break;
				}
			}else { // search element
				// document.querySelectorAll(x); // IE8이상 사용가능 ('.testClass + p' selector 형태는 IE9이상 사용가능) 
				elements = (context || document).querySelectorAll(selector); // querySelectorAll: length 있음, querySelector: length 없음
				if(elements instanceof NodeList || elements instanceof HTMLCollection) {
					for(i=0, max=elements.length; i<max; i++) {
						this.elements[i] = elements[i];
					}
				}
			}
		}

		return this;
	};

	// DOM prototype
	DOM.fn = DOM.prototype = {
		// element return
		get: function(index) {
			if(this.elements && this.elements.length > 0) {
				if(typeof index === 'number' && this.elements[index]) {
					return this.elements[index];
				}else {
					return this.elements;
				}
			}
			return false;
		},
		// child node search
		find: function(selector) {
			return DOM(selector, this.elements[0] || document);
		},
		// parent node search
		closest: function(selector, context) {
			// document.querySelector(x); // IE8이상 사용가능 ('.testClass + p' selector 형태는 IE9이상 사용가능)  
			// x.parentNode; // 표준
			var i, max = (this.elements && this.elements.length) || 0;
			var context = context || document.documentElement; // documentElement: <html />
			var element, search;

			if(!max) {
				return this;
				//return false;
			}else if(typeof selector === 'string') {
				for(i=0; i<max; i++) { // this.elements[] 연관배열
					for(search = this.elements[i].parentNode; search && search !== context; search = search.parentNode) { 
						// 현재 element 부터 검사하기 위해 
						// 현재 노드의 parentNode 를 search 초기값으로 바인딩하고
						// search.querySelector() 로 확인 한다.
						element = search.querySelector(selector);
						if(element) {
							this.elements[0] = element;
							return this;
						}
					}
				}
			}

			return this;
		},
		// 자식요소 리스트
		children: function() {
			// x.hasChildNodes(); // 표준
			// x.childNodes[1]; // IE9이상 사용가능 (IE8이하 부분지원), TextNode 까지 검색
			// x.children[1]; // IE9이상 사용가능 (IE8이하 부분지원)
			// getElementsByTagName('*') 
			if(this.elements && this.elements.length > 0 && this.elements[0].hasChildNodes()) { // true | false
				return this.elements[0].children;
			}
		},
		//
		getClass: (function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if('classList' in document.createElement('div')) {
				return function() {
					if(this.elements && this.elements.length > 0) {
						return this.elements[0].classList;
					}
				}
			}else {
				//console.log('[정보] classList 미지원 (getClass)');
				return function() {
					if(this.elements && this.elements.length > 0) {
						return this.elements[0].className.split(/\s+/);
					}
				}
			}
		})(),
		hasClass: function(name) { 
			// x.className; // 표준
			var regexp;

			if(this.elements && this.elements.length > 0 && typeof name === 'string') {
				regexp = new RegExp('(?:\\s|^)' + name + '(?:\\s|$)');				
				return !!this.elements[0].className.match(regexp); // !! 느낌표가 2개 이유는 type 를 boolean 으로 만들기 위함
			}

			return false;
		},
		addClass: (function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if('classList' in document.createElement('div')) {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr = name.split(/\s+/);
					
					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.elements[i].classList.add(arr[key]); // add(): 한번에 하나의 클래스만 입력 가능하다. 즉, 띄어쓰기로 여러 클래스 입력 불가능
							}
						}
					}

					return this;
				};
			}else {
				//console.log('[정보] classList 미지원 (addClass)');
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr = name.split(/\s+/);
					
					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						for(i=0; i<max; i++) {
							for(key in arr) {
								if(!(!!this.elements[i].className.match(new RegExp('(\\s|^)' + arr[key] + '(\\s|$)')))) {
									this.elements[i].className += " " + arr[key];
								}
							}
						}
					}

					return this;
				};
			}
		})(),
		removeClass: (function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if('classList' in document.createElement('div')) {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr = name.split(/\s+/);

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.elements[i].classList.remove(arr[key]); // remove(): 한번에 하나의 클래스만 삭제 가능하다. 즉, 띄어쓰기로 여러 클래스 삭제 불가능
							}
						}
					}

					return this;
				};
			}else {
				//console.log('[정보] classList 미지원 (removeClass)');
				return function(name) {
					var regexp;
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr = name.split(/\s+/);

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						for(i=0; i<max; i++) {
							for(key in arr) {
								regexp = new RegExp('(?:\\s|^)' + arr[key] + '(?:\\s|$)');
								this.elements[i].className = this.elements[i].className.replace(regexp, ' ');
							}
						}
					}

					return this;
				};
			}
		})(),
		toggleClass: (function() {
			// x.classList; // IE10이상 사용가능
			if('classList' in document.createElement('div')) {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr = name.split(/\s+/);

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') { 
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.elements[i].classList.toggle(arr[key]);
							}
						}
					}

					return this;
				};
			}else {
				//console.log('[정보] classList 미지원 (toggleClass)');
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr = name.split(/\s+/);

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') { 
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.hasClass.call(this, arr[key]) ? this.removeClass.call(this, arr[key]) : this.addClass.call(this, arr[key]);
							}
						}
					}

					return this;
				};
			}
		})(),
		// 
		html: function(value) {
			// x.outerHTML; // IE4이상 사용가능, IE외 다른 브라우저 사용가능여부 체크필요
			// x.innerHTML; // 표준
			var i, max = (this.elements && this.elements.length) || 0;
			var dummy;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				//return this[i].outerHTML;
				//return this[0].innerHTML;
				if(this.elements[0].outerHTML) {
					return this.elements[0].outerHTML;
				}else {
					dummy = document.createElement("div");
					dummy.appendChild(this.elements[0].cloneNode(true));
					return dummy.innerHTML;
				}
			}else if(typeof value === 'string') { // set
				for(i=0; i<max; i++) {
					this.elements[i].innerHTML = value;
				}
			}

			return this;
		},
		text: function(value) {
			// x.textContent; // 표준
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				return this.elements[0].textContent;
			}else if(typeof value === 'string') { // set
				for(i=0; i<max; i++) {
					this.elements[i].textContent = value;
				}
			}

			return this;
		},
		val: function(value) { 
			// x.value; // IE8이상 공식지원 (IE6, IE7 부분적 사용가능)
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				return this.elements[0].value;
			}else if(typeof value === 'string') { // set
				for(i=0; i<max; i++) {
					this.elements[i].value = value;
				}
			}

			return this;
		},
		// stylesheet
		// jQuery 와 다르게 style 메소드로 명명한 이유는 jQuery css 메소드는 내부에서 크로스브라우저, 부가적인 기능처리 등으로 코드 복잡도 높고와 사용 효율성은 낮아,
		// 개발자가 직접 javascript style 속성값을 값을 주도록 유도하기위해 심플하게 작업했다. (라이브러리가 너무 많은 기능을 하기보다, API형태에 맞춘다.)
		style: function(parameter) {
			// x.style.cssText; // 표준
			// x.currentStyle[styleProp];
			// document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
			var i, key, max = (this.elements && this.elements.length) || 0;

			/*
			// transition, animation 처리 방법
			element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = '1s';
			element.style.webkitAnimationDelay = element.style.MozAnimationDelay = element.style.msAnimationDelay = element.style.OAnimationDelay = element.style.animationDelay = '1s';
			*/
			if(!max || !this.elements[0].style) {
				return this;
				//return false;
			}else if(typeof parameter === 'string' && parameter in this.elements[0].style) { // get
				return this.elements[0].style[parameter];
			}else if(typeof parameter === 'object') { // set
				for(i=0; i<max; i++) {
					for(key in parameter) {
						if(key in this.elements[i].style) {
							if((typeof parameter[key] === 'string' && parameter[key].replace(/(^\s*)|(\s*$)/g, "") === '') || parameter[key] === null) { // 해당 css 프로퍼티 초기화여부 확인
								// 초기화시 css default value 를 설정해 주는 것이 가장 정확함
								if(this.elements[i].style.removeProperty) {
									this.elements[i].style.removeProperty(key);
								}else if(this.elements[i].style.removeAttribute) { // IE9 이상
									this.elements[i].style.removeAttribute(key);
								}else {
									this.elements[i].style[key] = null;
								}
							}else {
								// 단위(예:px)까지 명확하게 입력해줘야 한다.
								this.elements[i].style[key] = parameter[key];
							}
						}
					}
				}
			}

			return this;
		},
		//
		width: function(value) {
			var i, key, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				if(this.elements[0] === window) { // window
					return window.innerWidth || document.documentElement.clientWidth;
				}else if(this.elements[0].nodeType === 9) {
					return Math.max(
						document.body.scrollWidth, document.documentElement.scrollWidth,
						document.body.offsetWidth, document.documentElement.offsetWidth,
						document.documentElement.clientWidth
					);
				}else {
					return getElementWidthHeight(this, 'width');
				}
			}else if(typeof value === 'string' || typeof value === 'number') { // set
				for(i=0; i<max; i++) {
					if(!this.elements[i].nodeType || !this.elements[i].style) {
						continue;
					}else {
						// 단위(예:px)까지 명확하게 입력해줘야 한다.
						this.elements[i].style.width = value;
					}
				}
			}

			return this;
		},
		innerWidth: function() { // border 안쪽 크기 (padding 포함)
			if(!this.elements || !this.elements.length) {
				return this;
				//return false;
			}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { // window, document
				return this.width();
			}else {
				return getElementWidthHeight(this, 'width', 'inner');
			}
		},
		outerWidth: function(is) { // border 포함 크기 (padding + border 포함, 파라미터가 true 경우 margin 값까지 포함)
			if(!this.elements || !this.elements.length) {
				return this;
				//return false;
			}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { // window, document
				return this.width();
			}else {
				return getElementWidthHeight(this, 'width', 'outer', is);
			}
		},
		height: function(value) {
			var i, key, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				if(this.elements[0] === window) { // window
					return window.innerHeight || document.documentElement.clientHeight;
				}else if(this.elements[0].nodeType === 9) {
					return Math.max(
						document.body.scrollHeight, document.documentElement.scrollHeight,
						document.body.offsetHeight, document.documentElement.offsetHeight,
						document.documentElement.clientHeight
					);
				}else {
					return getElementWidthHeight(this, 'height');
				}
			}else if(typeof value === 'string' || typeof value === 'number') { // set
				for(i=0; i<max; i++) {
					if(!this.elements[i].nodeType || !this.elements[i].style) {
						continue;
					}else {
						// 단위(예:px)까지 명확하게 입력해줘야 한다.
						this.elements[i].style.height = value;
					}
				}
			}

			return this;
		},
		innerHeight: function() { // border 안쪽 크기 (padding 포함)
			if(!this.elements || !this.elements.length) {
				return this;
				//return false;
			}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { // window, document
				return this.height();
			}else {
				return getElementWidthHeight(this, 'height', 'inner');
			}
		},
		outerHeight: function(is) { // border 포함 크기 (padding + border 포함, 파라미터가 true 경우 margin 값까지 포함)
			if(!this.elements || !this.elements.length) {
				return this;
				//return false;
			}else if(this.elements[0] === window || this.elements[0].nodeType === 9) { // window, document
				return this.height();
			}else {
				return getElementWidthHeight(this, 'height', 'outer', is);
			}
		},
		// attribute
		attr: function(parameter) { 
			// x.getAttribute(y); // IE8이상 사용가능
			// x.setAttribute(y, z); // IE8이상 사용가능
			var i, key, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
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
		removeAttr: function(name) {
			// x.removeAttribute(y); // 표준
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof name === 'string') { 
				for(i=0; i<max; i++) {
					this.elements[i].removeAttribute(name);
				}
			}

			return this;
		},
		hasAttr: function(name) {
			// x.hasAttribute(y); // IE8이상 사용가능
			if(this.elements && this.elements.length > 0 && typeof name === 'string') {
				return this.elements[0].hasAttribute(name);
			}
		},
		// property
		prop: function(parameter) { 
			var i, key, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof parameter === 'string') { // get
				return this.elements[0][parameter];
			}else if(typeof parameter === 'object') { // set
				for(i=0; i<max; i++) {
					for(key in parameter) {
						this.elements[i][key] = parameter[key];
					}
				}
			}

			return this;
		},
		removeProp: function(name) {
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof name === 'string') {
				for(i=0; i<max; i++) {
					this.elements[i][name] = undefined;
					delete this.elements[i][name];
				}
			}

			return this;
		},
		// 
		remove: function() {
			// x.removeChild(y); // 표준
			// x.parentNode; // 표준
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof name === 'string') {
				for(i=0; i<max; i++) {
					if(this.elements[i].parentNode) {
						this.elements[i].parentNode.removeChild(this.elements[i]);
					}
				}
			}
		},
		clone: function(is) { // jQuery 처럼 이벤트 복사는 api.dom 을 통해 설정된 이벤트 리스트(storage)에 한해 설계가능하다
			// x = y.cloneNode(true | false); // 표준
			// is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)
			if(this.elements && this.elements.length > 0 && this.elements[0].nodeType) {
				// id를 가진 node를 복사할 때 주의하자(페이지내 중복 id를 가진 노드가 만들어 지는 가능성이 있다)
				return this.elements[0].cloneNode(is || true);
			}
		},
		//
		prepend: function(parameter) {
			// x.insertBefore(y,z); // 표준
			// x.firstChild; // IE9이상 사용가능
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}
						
			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].nodeType === 1 || this.elements[i].nodeType === 9 || this.elements[i].nodeType === 11) {
						this.elements[i].insertBefore(element, this.elements[i].firstChild);
					}
				}
			}

			return this;
		},
		append: function(parameter) {
			// x.appendChild(y); // 표준
			var i, max = (this.elements && this.elements.length) || 0;
			var element;
			
			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}

			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].nodeType === 1 || this.elements[i].nodeType === 9 || this.elements[i].nodeType === 11) {
						this.elements[i].appendChild(element);
					}
				}
			}

			return this;
		},
		// 어떤 요소의 위치에 노드를 삽입
		after: function(parameter) {
			// x.insertBefore(y,z); // 표준
			// x.parentNode; // 표준
			// x.nextSibling; // IE9이상 사용가능
			var i, max = (this.elements && this.elements.length) || 0;
			var element;
			
			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}

			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].parentNode) {
						this.elements[i].parentNode.insertBefore(element, this.elements[i].nextSibling);
					}
				}
			}

			return this;
		},
		before: function(parameter) {
			// x.insertBefore(y,z); // 표준
			// x.parentNode; // 표준

			// api.dom(기준이 되는 대상).before(이동할 대상);
			// 기준이 되는 element 바로 전으로 이동할 element가 이동(또는 삽입)한다.
			// querySelectorAll 또는 api.dom() length 가 있으나, querySelector 는 length 가 없다.
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}

			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].parentNode) {
						this.elements[i].parentNode.insertBefore(element, this.elements[i]);
					}
				}
			}

			return this;
		},
		insertBefore: function(parameter) {
			// x.insertBefore(y,z); // 표준
			// x.parentNode; // 표준

			// api.dom(이동할 대상).insertBefore(기준이 되는 대상);
			// 이동할 element가, 기준이 되는 element 바로 전으로 이동(또는 삽입)한다.
			// querySelectorAll 또는 api.dom() length 가 있으나, querySelector 는 length 가 없다.
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}

			if(element) {
				for(i=0; i<max; i++) {
					if(element.parentNode) {
						element.parentNode.insertBefore(this.elements[i], element);
					}
				}
			}

			return this;
		},
		// 지정한 콘텐츠로 대체
		replaceWith: function(parameter) {
			// x.replaceChild(y,z); // 표준
			// x.parentNode; // 표준
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}

			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].parentNode) {
						this.elements[i].parentNode.replaceChild(element, this.elements[i]);
					}
				}
			}

			return this;
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
				var capture = (typeof capture === 'undefined') ? false : capture;
				var arr = [];
				var key, callback;
				var i, max = (this.elements && this.elements.length) || 0;

				// 이벤트 키
				arr = events.split('.');
				if(arr.length > 1) {
					events = arr.shift();
				}
				key = arr.join('');

				// event type(name) change
				events = setEventTypeChange(events);

				// 이벤트 설정
				for(i=0; i<max; i++) {
					// 콜벡
					callback = function() {
						handlers.apply(this, Array.prototype.slice.call(arguments));
					};
					event_function.call(this.elements[i], events, callback, capture);
					
					// 실행 정보 저장
					if(typeof this.elements[i]['storage'] != 'object') {
						this.elements[i].storage = {};
					}
					this.elements[i].storage[key] = {
						"events": events,
						"handlers": callback,
						"capture": capture
					};
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
				var key;
				var i, max = (this.elements && this.elements.length) || 0;

				// 이벤트 키
				arr = events.split('.');
				if(arr.length > 1) {
					events = arr.shift();
				}
				key = arr.join('');

				// event type(name) change
				events = setEventTypeChange(events);

				// 이벤트 해제
				for(i=0; i<max; i++) {
					if(typeof this.elements[i]['storage'] === 'object' && this.elements[i].storage[key]) {
						event_function.call(this.elements[i], this.elements[i].storage[key].events, this.elements[i].storage[key].handlers, this.elements[i].storage[key].capture);	
						delete this.elements[i].storage[key]; // 저장된 이벤트 정보 제거
					}
				}

				return this;
			};

			return return_function;
		})(),
		one: function(events, handlers, capture) {
			var that = this;
			// new Date().getUTCMilliseconds();
			// new Date().getTime() + Math.random();
			var key = getKey();
			var callback = function() {
				// off
				that.off('.' + key);
				// handlers
				handlers.apply(this, Array.prototype.slice.call(arguments));
			};
			// on
			that.on(events + '.' + key, callback, capture);
		},
		// data
		data: (function() {
			// x.dataset; // IE11이상 사용가능

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
						//return false;
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
						//return false;
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
		},
		// 특정 노드가 다른 노드 내에 포함되었는지 여부
		// 사용예: api.dom('#test').contains(event.target)
		contains: function(parameter) {
			// x.contains(y); // 표준
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return is;
			}else if(parameter.elements && typeof parameter.elements === 'object') {
				element = parameter.elements[0];
			}else if(typeof parameter === 'object' && parameter.nodeType) {
				element = parameter;
			}

			if(element) {
				for(i=0; i<max; i++) {
					// this.elements[i] 내부에 element 가 포함되어 있는지 확인
					if(this.elements[i] && this.elements[i].contains(element)) {
						return true;
					}
				}
			}

			return false;
		}
	};

	// 터치 이벤트 종류에 따른 콜백
	DOM.touch = {
		'on': function(selector, handlers) {
			/*
			// 핵심은 up 이 발생하고, 특정시간 이후까지 down이 발생하지 않았을 때, 클릭이 몇번발생했는지 카운트를 시작한다.
			api.dom.touch.on('#ysm', 
				{
					'one': function(e) {
						console.log('one touch');
					},
					'two': function(e) {
						console.log('two touch');
					},
					'delay': function(e) {
						console.log('delay touch');
					}
				}
			);
			또는
			api.dom.touch.on('#ysm', function() {
				...
			});
			*/
			
			// 유효한 터치영역
			//var radius = Math.min(DOM(selector).width(), DOM(selector).height(), 20); 
			var radius = 20;

			if(typeof selector !== 'undefined' && (typeof handlers === 'object' || typeof handlers === 'function')) {
				DOM(selector).on(environment['event']['down'] + '.EVENT_MOUSEDOWN_api_dom_touch', function(e) {
					var event = e || window.event;
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.touches; // touchstart
					var that = this;

					// 현재 이벤트의 기본 동작을 중단한다. (기본 이벤트를 중단시키면 스크롤이 작동을 안한다.)
					// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.

					// 멀티터치 방지
					if(touch && touch.length && 1 < touch.length) {
						return;
					}

					// 이벤트 종료
					DOM(window).off('.EVENT_MOUSEMOVE_api_dom_touch');
					DOM(window).off('.EVENT_MOUSEUP_api_dom_touch');

					// 필수 정보
					that.touchCount = that.touchCount || 0; // 터치 횟수
					that.touchTimeDelay = that.touchTimeDelay || null; // delay check 관련 setTimeout
					that.touchTimeCount = that.touchTimeCount || null; // 터치 횟수 카운트 시작 관련 setTimeout
					that.touchCheck = that.touchCheck || {};
					if(touch) {
						radius = 30;
						that.touchCheck[that.touchCount] = {
							'start': {
								'top': touch[0].screenY,
								'left': touch[0].screenX
							},
							'end': {
								'top': touch[0].screenY,
								'left':  touch[0].screenX
							}
						};
					}else {
						radius = 20;
						that.touchCheck[that.touchCount] = {
							'start': {
								'top': event.screenY,
								'left': event.screenX
							},
							'end': {
								'top': event.screenY,
								'left':  event.screenX
							}
						};
					}
					that.touchCheck['time'] = {};
					that.touchCheck['time']['start'] = new Date().getTime();
					
					// delay
					window.clearTimeout(that.touchTimeCount);
					that.touchTimeDelay = window.setTimeout(function() {
						if(handlers['delay'] && typeof handlers['delay'] === 'function') {
							handlers['delay'].call(that, e);
						}
					}, 1000);

					DOM(window).on(environment['event']['move'] + '.EVENT_MOUSEMOVE_api_dom_touch', function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches || event.changedTouches;

						if(touch) {
							that.touchCheck[that.touchCount]['end']['top'] = touch[0].screenY;
							that.touchCheck[that.touchCount]['end']['left'] = touch[0].screenX;
						}else {
							that.touchCheck[that.touchCount]['end']['top'] = event.screenY;
							that.touchCheck[that.touchCount]['end']['left'] = event.screenX;
						}

						// delay 정지
						if(Math.abs(that.touchCheck[0]['start']['top'] - that.touchCheck[that.touchCount]['end']['top']) > radius || Math.abs(that.touchCheck[0]['start']['left'] - that.touchCheck[that.touchCount]['end']['left']) > radius) {
							window.clearTimeout(that.touchTimeDelay);
						}
					});

					DOM(window).on(environment['event']['up'] + '.EVENT_MOUSEUP_api_dom_touch', function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.changedTouches; // touchend
						
						// 이벤트 종료
						DOM(window).off('.EVENT_MOUSEMOVE_api_dom_touch');
						DOM(window).off('.EVENT_MOUSEUP_api_dom_touch');

						//					
						that.touchCount += 1;
						that.touchCheck['time']['end'] = new Date().getTime();

						// click check: 지정된 시간까지 다음 클릭이 발생하지 않는다면, count 값을 확인하여 해당 콜백을 실행한다.
						window.clearTimeout(that.touchTimeDelay);
						if(typeof that.touchCheck === 'object' && that.touchCheck[that.touchCount-1]) {
							that.touchTimeCount = window.setTimeout(function() {
								var start = that.touchCheck[0]['start'];
								var end = that.touchCheck[that.touchCount-1]['end'];
								var time = Number(that.touchCheck['time']['end']) - Number(that.touchCheck['time']['start']);
								// handlers(callback) 실행
								if(time <= 180 && Math.abs(start['top'] - end['top']) <= radius && Math.abs(start['left'] - end['left']) <= radius) {
									if(that.touchCount === 1) {
										if(typeof handlers === 'function') {
											handlers.call(that, e);
										}else if(handlers['one'] && typeof handlers['one'] === 'function') {
											handlers['one'].call(that, e);
										}
									}else if(that.touchCount === 2) {
										if(handlers['two'] && typeof handlers['two'] === 'function') {
											handlers['two'].call(that, e);
										}
									}
								}
								that.touchCount = 0;
								that.touchCheck = {};
							}, 200);
						}
					});
				});
			}
		},
		'off': function(selector) {
			if(typeof selector !== 'undefined') { 
				DOM(selector).off('.EVENT_MOUSEDOWN_api_dom_touch');
			}
		}
	};

	// extend
	DOM.extend = DOM.fn.extend = function(parameter) {
		var value = typeof parameter === 'object' ? parameter : {};
		var key;
		for(key in value) {
			if(this.hasOwnProperty(key)) {
				// 동일한 함수(또는 메소드)가 있으면 건너뛴다
				continue;
			}
			// this : DOM.extend( ... ), DOM.fn.extend( ... ) 분리
			// api.dom.test = function() { ... }   <- 같은 기능 ->   api.dom.extend({'test': function() { ... }})
			// api.dom.fn.test = function() { ... }   <- 같은 기능 ->   api.dom.fn.extend({'test': function() { ... }})
			this[key] = value[key];
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// document Ready
	var documentReady = function(callback) { 
		if(typeof callback === 'function') {
			if(document.readyState === "interactive" || document.readyState === "complete") {
				// IE8 등에서 window.setTimeout 파라미터로 바로 함수값을 넣으면 오류가 난다.
				// 그러므로 function() {} 무명함수로 해당 함수를 실행시킨다.
				window.setTimeout(function() {
					callback();
				});
			}else if(document.addEventListener) { // Mozilla, Opera, Webkit 
				document.addEventListener("DOMContentLoaded", callback, false);
			}else if(document.attachEvent) { // IE
				document.attachEvent("onreadystatechange", function(e) {
					if(document.readyState === "complete") {
						callback.call(this, e);
					}
				});
			}
		}
	};

	// document mousedown 이벤트 콜백 (레이어 닫기 등)
	var DocumentTouch = function() {
		var that = this;
		that.callback = [];
		that.func = function(event) { // mouseup 이벤트 헨들러 (mouseup 가 발생하면 실행)
			var event = event || window.event;
			var index;
			for(index in that.callback) { // 콜백 배열 실행
				that.callback[index].call(this, event);
			}
		};
		// 실행(대기)
		if(document.readyState === "interactive" || document.readyState === "complete") {
			// IE8 등에서 window.setTimeout 파라미터로 바로 함수값을 넣으면 오류가 난다.
			// 그러므로 function() {} 무명함수로 해당 함수를 실행시킨다.
			window.setTimeout(function() {
				that.on();
			});
		}else if(document.addEventListener) { // Mozilla, Opera, Webkit 
			document.addEventListener("DOMContentLoaded", function() {
				that.on();
			}, false);
		}else if(document.attachEvent) { // IE
			document.attachEvent("onreadystatechange", function() {
				if(document.readyState === "complete") {
					that.on();
				}
			});
		}
	};
	DocumentTouch.prototype = {
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
		on: (function() { // up 이벤트 작동
			if(typeof window.addEventListener === 'function') {
				return function() {
					window.addEventListener(environment['event']['up'], this.func, false);
				}
			}else if(typeof document.attachEvent === 'function') { // IE
				return function() {
					document.attachEvent('on' + environment['event']['up'], this.func);
				}
			}else {
				return function() {};
			}
		})(),
		off: (function() { // up 이벤트 정지
			if(typeof window.removeEventListener === 'function') {
				return function() {
					window.removeEventListener(environment['event']['up'], this.func, false);
				}
			}else if(typeof document.detachEvent === 'function') { // IE
				return function() {
					document.detachEvent('on' + environment['event']['up'], this.func);
				}
			}
		})()
	};

	// document 리사이즈될 때 콜백 실행
	var DocumentResize = function() {
		var that = this;
		that.callback = [];
		that.time = null;
		that.func = function(event) { // resize 이벤트 헨들러 (resize 가 발생하면 실행)
			var event = event || window.event;
			var index;
			window.clearTimeout(that.time);
			that.time = window.setTimeout(function(){ 
				for(index in that.callback) { // 콜백 배열 실행
					that.callback[index].call(this, event);
				}
			}, 500);
		};
		//
		that.on();
	};
	DocumentResize.prototype = {
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
					window.addEventListener(environment['event']['resize'], this.func, false);
				}
			}else if(typeof document.attachEvent === 'function') { // IE
				return function() {
					document.attachEvent('on' + environment['event']['resize'], this.func);
				}
			}else {
				return function() {};
			}
		})(),
		off: (function() { // resize 이벤트 정지
			if(typeof window.removeEventListener === 'function') {
				return function() {
					window.removeEventListener(environment['event']['resize'], this.func, false);
				}
			}else if(typeof document.detachEvent === 'function') { // IE
				return function() {
					document.detachEvent('on' + environment['event']['resize'], this.func);
				}
			}
		})()
	};
	
	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// requestAnimationFrame, cancelAnimationFrame
	var setRequestAnimFrame = (function() { 
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
	})();
	var setCancelAnimFrame = (function() {
		return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
	})();
	var setAnimationFrameQueue = function(queue) {
		/*
		-
		사용예
		api.animationFrameQueue({'element': '.h2', 'style': {'left': '100px', 'top': '100px', 'width': '100px', 'height': '100px'}});
		api.animationFrameQueue([{'element': api.dom('#h2'), 'style': {'left': '100px', 'top': '100px'}}, {...}, ... ]);
		*/
		if(typeof queue != 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}
		var request = null;

		(function call(queue) {
			var parameter = queue.shift();
			var element = DOM(parameter['element']); // 대상 element
			var original = element.get();
			var style = parameter['style']; // 애니메이션을 적용할 CSS값 - {CSS 속성: 값}
			var duration = parameter['duration'] || 800; // 애니메이션 진행시간
			//var easing = 'swing';
			var complete = parameter['complete'];

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
					start = original[i]['style'][key]; // 기존 설정값
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
				//
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
								console.log('[경고] 단위 없음');
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
					request = setRequestAnimFrame(frame);
				}else {
					setCancelAnimFrame(request);
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
				setCancelAnimFrame(request);
				setFrame();
			}
		})(queue);
	};

	// 애니메이션 순차 실행 (이미 실행되고 있는 element는 대기 후 실행)
	// element.style 로 애니메이션을 주는 것이 아닌, 애니메이션값이 있는 class 값을 toggle 하는 방식이다.
	// https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support
	var setAnimationQueue = function(queue) {
		/*
		-
		사용예
		api.animationQueue([{'element': api.dom('#view'), 'animation': 'pt-page-moveToRight'}, {'element': api.dom('#list'), 'animation': 'pt-page-moveToRight'}]);
		api.animationQueue({'element': api.dom('#view'), 'animation': 'pt-page-moveToLeft', 'complete': function() { ... }});
		*/
		if(typeof queue != 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}

		(function call(queue) {
			var parameter = queue.shift();
			var element = DOM(parameter['element']); // 대상 element
			var animation = parameter['animation']; // animation 적용 class name
			var complete = parameter['complete']; // 애니메이션 종료 후 콜백 (complete)
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
						element.off(environment['event']['animationend'] + '.EVENT_ANIMATIONEND_queue');
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
				if(element.prop('animationState') != 'running') { 
					//console.log('[정보] 애니메이션 실행');
					window.clearInterval(time);
					element.prop({'animationState': 'running'});
					element.addClass(animation).on(environment['event']['animationend'] + '.EVENT_ANIMATIONEND_queue', handler);
				}else {
					// 현재 실행중인 애니메이션이 존재 (대기 후 이전 애니메이션이 종료되면 실행)
					//console.log('[정보] 애니메이션 대기');
					//console.log('animationState: ' + element.prop('animationState'));
				}
			}, 1);
		})(queue);
	};

	// 트랜지션 순차실행 
	// 트랜지션을 지원하지 않는 브라우저에서는 requestAnimationFrame, cancelAnimationFrame 으로 실행한다.
	var setTransitionQueue = function(queue) {
		/*
		-
		사용예
		api.transitionQueue({'element': api.dom('#view'), 'transition': {'left': '100px', 'top': '100px'}});
		api.transitionQueue([{'element': api.dom('#view'), 'transition': {'left': '100px', 'top': '100px'}}, {...}, ... ]);
		*/
		if(typeof queue != 'object') {
			return false;
		}else if(!Array.isArray(queue)) {
			queue = [queue];
		}
		var state = { // 애니메니션 종료 후 적용할 style
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
			var parameter = queue.shift();
			var element = DOM(parameter['element']); // 대상 element
			var original = element.get();
			var transition = parameter['transition']; // 트랜지션을 적용할 CSS값 - {CSS 속성: 값}
			var duration = parameter['duration'] || 600; 
			var easing = parameter['easing'] || 'ease'; 
			var delay = parameter['delay'] || 0; // 효과가 시작할 때까지의 딜레이
			var complete = parameter['complete']; // 애니메이션 종료 후 콜백 (complete)

			//
			var i, key, tmp;
			var properties = {};
			var handler;

			// transition 값 확인
			for(key in transition) {
				if(!/^(animation*|transition*)/i.test(key)) { // animation, transition 관련작업은 제외됨
					properties[key] = transition[key];
				}
			}

			// 
			for(i in original) {
				if(typeof original[i]['storage'] != 'object') {
					original[i]['storage'] = {};
				}
				// 현재 상태값 저장
				if(typeof original[i]['storage']['transition'] != 'object') {
					original[i]['storage']['transition'] = {};
					for(key in state) {
						tmp = original[i]['style'][key];
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

			//
			handler = function(event) {
				var event = event || window.event;
				var original = this;
				var i, key;
				//console.log('[정보] 트랜지션 종료');
				//
				for(i in original) {
					for(key in original[i]['storage']['transition']) {
						original[i]['style'][key] = original[i]['storage']['transition'][key];
					}
				}
				element.off(environment['event']['transitionend'] + '.EVENT_TRANSITION_queue');
				
				// complete 실행
				if(typeof complete === 'function') {
					complete.call(this, event);
				}
				// 다음 실행할 queue 가 존재할 경우
				if(queue.length) {
					//console.log('[정보] next queue 실행');
					call(queue);
				}
			};

			// 이벤트
			element.style(properties).on(environment['event']['transitionend'] + '.EVENT_TRANSITION_queue', handler, true);
		})(queue);
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// public return
	return {
		"version": 0.1,
		"key": getKey,
		"dom": DOM,
		"document": {
			'ready': documentReady,
			'touch': new DocumentTouch(),
			'resize': new DocumentResize()
		},
		"animationFrameQueue": setAnimationFrameQueue,
		"animationQueue": setAnimationQueue,
		"transitionQueue": setTransitionQueue,
		"env": environment,
		"extend": extend
	};

}, this);
