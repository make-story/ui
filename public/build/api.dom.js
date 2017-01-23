/*
BOM, DOM

브라우저 정보, 해상도, 사용자 정보 등 확인
브라우저 기능지원 여부: http://modernizr.com/download/

@date (버전관리)
2015.04.09

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
http://www.opensource.org/licenses/MIT

@browser compatibility
IE7 이상(IE7, IE8 부분지원하며, 트랜지션, 애니메이션 등의 사용은 IE10 이상)
querySelectorAll: Chrome 1, Firefox 3.5, Internet Explorer 8, Opera 10, Safari 3.2
element.classList: Chrome 8.0, Firefox 3.6, Internet Explorer 10, Opera 11.50, Safari 5.1
box-sizing: border-box; IE8 이상 (boder 효과가 화면상에 안보일 수 있으니 주의한다.)
localStorage, sessionStorage: IE8 이상

@webapi 참고
https://developer.mozilla.org/en-US/docs/Web/API
http://www.quirksmode.org/js/detect.html

-
추후 웹스토리지(로컬스토리지)에 현재 코드를 저장하여, 보다 빠른 로딩경험을 제공하자.
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;
	}else if(!global.api) {
		global.api = {};
	}

	// 일반적인 고유키 생성 (id="" 속성의 경우 첫글자가 문자로 시작해야 한다.)
	var getKey = function() {
		/*
		-
		ES6
		심볼(Symbol)은 프로그램이 이름 충돌의 위험 없이 속성(property)의 키(key)로 쓰기 위해 생성하고 사용할 수 있는 값입니다.
		Symbol()을 호출하면 새로운 심볼 값이 생성됩니다. 이 값은 다른 어떤 값과도 다릅니다.
		-
		랜덤, 날짜 결합
		var arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
		var date = new Date();
		return [arr[Math.floor(Math.random() * arr.length)], Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), date.getFullYear(), (Number(date.getMonth()) + 1), date.getDate(), date.getHours(), date.getMinutes()].join('');
		-
		페이스북 참고
		 1. 'f' + : 'f' 문자열에 뒤의 것을 더할 건데, // f
		 2. Math.random() : 0~1 사이의 랜덤한 수 생성에 // 0.13190673617646098 
		 3. * (1 << 30) : 2의 30승을 곱하고, // 0.13190673617646098 * 1073741824 = 141633779.5
		 4. .toString(16) : 16진수로 문자열로 표현한 후에, // Number(141633779.9).toString(16) = 87128f3.8
		 5. .replace('.', '') : 문자열에서 닷(소수점)을 제거한다. // 'f' + 87128f38 = f87128f38
		return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
		*/
		return ['api', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24); // MongoDB _id 24자 길이
	};

	// 클라이언트 브라우저 환경
	var agent = (global.navigator.userAgent || global.navigator.vendor || global.opera).toLowerCase();
	var platform = global.navigator.platform;
	var app_name = global.navigator.appName;
	var app_version = global.navigator.appVersion;
	var div = document.createElement('div');
 	var environment = { // PC, 사용자 환경
		//"zindex": 100,
		"check": { // true, false 
			"mobile": (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4))),
			"touch": ('ontouchstart' in window || global.navigator.MaxTouchPoints > 0 || global.navigator.msMaxTouchPoints > 0),
			//"orientationchange": 'onorientationchange' in window, // 모바일기기 회전
			"transform": false,
			"transition": false/*('transition' in div.style || 'WebkitTransition' in div.style || 'MozTransition' in div.style || 'OTransition' in div.style || 'msTransition' in div.style)*/,
			"animation": false/*('animationName' in div.style || 'WebkitAnimationName' in div.style || 'MozAnimationName' in div.style || 'OAnimationName' in div.style || 'msAnimationName' in div.style || 'KhtmlAnimationName' in div.style)*/,
			"fullscreen": (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled)
		},
		"monitor": null, // pc | mobile | tablet (해상도에 따라 설정가능) - check['mobile'] 가 있음에도 따로 구분한 이유는 기기기준과 해상도(모니터) 기준의 영역을 나누어 관리하기 위함
		"screen": { // browser 사이즈가 아닌 해상도 값
			"width": screen.availWidth/*Windows Taskbar 제외*/ || screen.width || Math.round(global.innerWidth), 
			"height": screen.availHeight/*Windows Taskbar 제외*/ || screen.height || Math.round(global.innerHeight)
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
			"down": "mousedown",
			"move": "mousemove",
			"up": "mouseup",
			//"click": ('ontouchstart' in window) ? 'touchstart' : (global.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click', // touchstart 를 사용할 경우 click 이벤트보다 먼저 작동하여, 예상과 다른 실행순서가 발생할 수 있다.
			"click": "click",
			"wheel": (function() {
				if(agent.indexOf('webkit') >= 0) { // Chrome / Safari
					return 'mousewheel';
				}else if(div.attachEvent) { // IE
					return 'mousewheel';
				}else if(div.addEventListener) { // Mozilla
					return 'DOMMouseScroll';
				}
				/*
				// 마우스휠 스크롤
				var scroll;
				if(event.wheelDelta) {
					scroll = event.wheelDelta / 3600; // Chrome / Safari
				}else if(event.detail) {
					scroll = event.detail / -90; // Mozilla
				}else {
					return false;
				}
				scroll = 1 + scroll; // Zoom factor: 0.9 / 1.1
				if(scroll > 1) { 
					// top
				}else if(scroll < 1) { 
					// bottom
				}else {
					return false;
				}
				*/
				return false;
			})(),
			// 트랜지션, 애니메이션
			"transitionend": "transitionend",
			"animationstart": "animationstart",
			"animationiteration": "animationiteration",
			"animationend": "animationend"
		},
		"css": {
			//"prefix": '', // 벤더 프리픽스
			//"transform": ''
		}
	};

	// transform, transition, animation
	(function() {
		// 3D지원여부 판단자료: ['perspective', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
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
				environment['check']['transform'] = true;
				//environment['css']['transform'] = transforms[key];
				break;
			}
		}

		// 트랜지션
		for(key in transitions) {
			if(div.style[key] !== undefined) {
				environment['check']['transition'] = true;
				environment['event']['transitionend'] = transitions[key];
				break;
			}
		}

		// 애니메이션
		for(key in animations) {
			if(div.style[key] !== undefined) {
				environment['check']['animation'] = true;
				environment['event']['animationstart'] = animations[key][0];
				environment['event']['animationiteration'] = animations[key][1];
				environment['event']['animationend'] = animations[key][2];
				break;
			}
		}
	})();

	// monitor
	if(/android/i.test(agent)) { // 안드로이드
		// mobile 없으면 태블릿임
		if(/mobile/i.test(agent)) {
			environment['monitor'] = 'mobile';
		}else {
			environment['monitor'] = 'tablet';
		}
	}else if(/(iphone|ipad|ipod)/i.test(agent)) { // 애플
		if(/ipad/i.test(agent)) {
			environment['monitor'] = 'tablet';
		}else {
			environment['monitor'] = 'mobile';
		}
	}else if(environment.check.mobile) {
		environment['monitor'] = 'mobile';
	}else if(/(MacIntel|MacPPC)/i.test(platform)) {
		environment['monitor'] = 'pc';
	}else if(/(win32|win64)/i.test(platform)) {
		environment['monitor'] = 'pc';
	}

	// agent 값보다 스크린 크기를 우선 적용하여 태블릿인지 모바일인지 여부를 결정한다.
	// 테블렛인데 가로 길이가 미달이면 모바일로 인식하게 함
	/*if((environment['monitor'] = 'tablet') && environment['screen']['width'] && environment['screen']['height'] && (Math.min(environment['screen']['width'], environment['screen']['height']) < 768)) {
		environment['monitor'] = 'mobile';
	}*/
	// 모바일인데 가로 길이가 넘어가면 테블렛으로 인식하게 함
	/*if((environment['monitor'] = 'mobile') && environment['screen']['width'] && environment['screen']['height'] && (Math.min(environment['screen']['width'], environment['screen']['height']) >= 768)) {
		environment['monitor'] = 'tablet';
	}*/

	// browser 
	(function() {
		var offset_name, offset_version;

		// if문 순서 중요함
		environment['browser']['name'] = app_name;
		environment['browser']['version'] = String(parseFloat(app_version));
		if((offset_version = agent.indexOf("opr/")) !== -1) {
			environment['browser']['name'] = "opera";
			environment['browser']['version'] = agent.substring(offset_version + 4);
		}else if((offset_version = agent.indexOf("opera")) !== -1) {
			environment['browser']['name'] = "opera";
			environment['browser']['version'] = agent.substring(offset_version + 6);
			if((offset_version = agent.indexOf("version")) !== -1) {
				environment['browser']['version'] = agent.substring(offset_version + 8);
			}
		}else if((offset_version = agent.indexOf("msie")) !== -1) {
			environment['browser']['name'] = "explorer";
			environment['browser']['version'] = agent.substring(offset_version + 5);
		}else if((offset_version = agent.indexOf("chrome")) !== -1) {
			environment['browser']['name'] = "chrome";
			environment['browser']['version'] = agent.substring(offset_version + 7);
		}else if((offset_version = agent.indexOf("safari")) !== -1) {
			environment['browser']['name'] = "safari";
			environment['browser']['version'] = agent.substring(offset_version + 7);
			if((offset_version = agent.indexOf("version")) !== -1) {
				environment['browser']['version'] = agent.substring(offset_version + 8);
			}
		}else if((offset_version = agent.indexOf("firefox")) !== -1) {
			environment['browser']['name'] = "firefox";
			environment['browser']['version'] = agent.substring(offset_version + 8);
		}else if((offset_name = agent.lastIndexOf(' ') + 1) < (offset_version = agent.lastIndexOf('/'))) { 
			environment['browser']['name'] = agent.substring(offset_name, offset_version);
			environment['browser']['version'] = agent.substring(offset_version + 1);
			if(environment['browser']['name'].toLowerCase() === environment['browser']['name'].toUpperCase()) {
				environment['browser']['name'] = app_name;
			}
		}

		if((offset_version = environment['browser']['version'].indexOf(';')) !== -1) {
			environment['browser']['version'] = environment['browser']['version'].substring(0, offset_version);
		}
		if((offset_version = environment['browser']['version'].indexOf(' ')) !== -1) {
			environment['browser']['version'] = environment['browser']['version'].substring(0, offset_version);
		}
	})();

	// event
	if(environment['check']['touch'] === true) {
		environment['event']['down'] = 'touchstart';
		environment['event']['move'] = 'touchmove';
		environment['event']['up'] = 'touchend';
		/*if(/(iphone|ipad|ipod)/i.test(agent)) { // touchend와 click 이벤트 실행 우선순위 문제발생
			environment['event']['click'] = 'touchend';
		}*/
	}

	// public return
	global.api.key = getKey;
	global.api.env = environment;
	if(environment['browser']['name'] !== 'explorer' || (environment['browser']['name'] === 'explorer' && environment['browser']['version'] > 6)) {
		// 브라우저 버전에 따라 추가 기능제공
		factory(global);
	}

})(function(global, undefined) {

	'use strict'; // ES5

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

	// element 의 window	
	var getWindow = function(element) {
		return element !== null && element === element.window ? element : element.nodeType === 9 ? element.defaultView || element.parentWindow : global;
	};

	// element 의 docuemnt
	var getDocument = function(element) {
		// document.documentElement; // <html> element //표준
		return element && element.ownerDocument || global.document;
	};

	// event name 브라우저에 따른 자동 변경
	var setEventTypeChange = function(events) {
		if(typeof events === 'string' && /transitionend|animationstart|animationiteration|animationend/i.test(events.toLowerCase())) {
			events = events.toLowerCase(); // 주의! 이벤트명을 모두 소문자로 변경했을 때 작동하지 않는 이벤트가 있다. (DOMMouseScroll)
			if(/transitionend/i.test(events) && global.api.env['event']['transitionend']) {
				events = global.api.env['event']['transitionend'];
			}else if(/animationstart/i.test(events) && global.api.env['event']['animationstart']) {
				events = global.api.env['event']['animationstart'];
			}else if(/animationiteration/i.test(events) && global.api.env['event']['animationiteration']) {
				events = global.api.env['event']['animationiteration'];
			}else if(/animationend/i.test(events) && global.api.env['event']['animationend']) {
				events = global.api.env['event']['animationend'];
			}
		}
		return events;
	};

	// 숫자여부 
	var isNumeric = function(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	};

	// 숫자 분리
	var getNumber = function(value) {
		return isNumeric(value) ? value : String(value).replace(/[^+-\.\d]|,/g, '') || 0;
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

		// 소문자 변환
		property = property.toLowerCase();

		// width, height 에 따라 분기 (paddingLeft, paddingRight, paddingTop, paddingBottom, ...)
		if(property === 'width') {
			arr = ["Left", "Right"];
		}else if(property === 'height') {
			arr = ["Top", "Bottom"];
		}
		for(i=0, max=arr.length; i<max; i++) {
			// padding
			tmp = getNumberUnit(elements.css('padding' + arr[i]));
			value['padding'] += (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
			// border
			tmp = getNumberUnit(elements.css('border' + arr[i] + 'Width'));
			value['border'] += (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
			// margin
			tmp = getNumberUnit(elements.css('margin' + arr[i]));
			value['margin'] += (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
		}
		
		return value;
	};

	// width, height 등 사이즈 정보 반환
	// property: width, height
	// extra: inner(padding), outer(border) 값 포함구분
	// is: margin 값 포함여부
	var getElementWidthHeight = function(element, property, extra, is) {
		if(!element || !element instanceof DOM || !property || !(/^(width|height)$/i.test(property)) || (extra && !/^(inner|outer)$/i.test(extra))) {
			return 0;	
		} 
		var is_border_box = (element.css('boxSizing') === 'border-box') ? true : false; // IE와 웹킷간의 박스모델 스팩이 다르므로 구분해야 한다.
		var is_display = (element.css('display') === 'none') ? true : false;
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
		var rect = {};
		var key, tmp;

		// 소문자 변환
		property = property.toLowerCase();

		// display가 none 경우 width, height 추출에 오차가 발생한다.
		if(is_display === true) {
			// 현재 설정된 css 값 확인
			for(key in queue) {
				if(tmp = element.css(key)) {
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
			element.css({'position': 'absolute', 'visibility': 'hidden', 'display': 'block'});
		}

		// 해당 property 값
		value = element.get(0)['offset' + (property.substring(0, 1).toUpperCase() + property.substring(1))]; // offsetWidth, offsetHeight (border + padding + width 값, display: none 의 경우는 0 반환)
		if(element.get(0).getBoundingClientRect) { // chrome 에서는 정수가 아닌 실수단위로 정확한 값을 요구하므로 getBoundingClientRect 사용
			rect = element.get(0).getBoundingClientRect(); // width/height: IE9 이상 지원
			if(property in rect) {
				value = rect[property];
			}/*else if(property === 'width') {
				value = rect.right - rect.left;
			}else if(property === 'height') {
				value = rect.bottom - rect.top;
			}*/
		}
		if(value <= 0 || value === null) {
			// 방법1: css로 값을 구한다.
			tmp = getNumberUnit(element.css(property));
			value = (tmp && tmp[1] && isNumeric(tmp[1])) ? Number(tmp[1]) : 0;
			if(extra) {
				// inner, outer 추가
				tmp = getAugmentWidthHeight(element, property);
				value += tmp['padding'];
				if(extra === 'outer') {
					value += tmp['border'];
					if(is === true) {
						value += tmp['margin'];
					}
				}
			}
		}else {
			// 방법2: offset 값 가공 (margin, border, padding)
			tmp = getAugmentWidthHeight(element, property);
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
			element.css(queue);
		}

		return value;
	};

	// DOM (event, style, attr, data, scroll 등)
	// var element = api.dom('<div>').css({'': '', '': ''}).attr({'': ''}).data({'': ''}).on('', function() { ... }).get();
	function DOM(selector, context) {
		// return instance
		if(!(this instanceof DOM)) {
			return new DOM(selector, context);
		}

		var match1, match2, elements, i, max;
		this.elements = [];
		this.length = 0;
		if(selector) {
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
				if('elements' in selector) {
					return selector;
				}else if(selector.nodeType || selector === window) { // DOMElement, window (querySelectorAll 반환값 nodeType 은 undefined)
					this.elements[0] = selector;
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
					try {
						// document.querySelectorAll(x); // IE8이상 사용가능 ('.testClass + p' selector 형태는 IE9이상 사용가능) 
						elements = (context || document).querySelectorAll(selector); // querySelectorAll: length 있음, querySelector: length 없음
						if(elements instanceof NodeList || elements instanceof HTMLCollection) {
							for(i=0, max=elements.length; i<max; i++) {
								this.elements[i] = elements[i];
							}
						}
					}catch(e) {
						// IE7, 8 대응시 아래 코드 사용
						if(selector.charAt(0) === '#') { // id
							elements = document.getElementById(selector.slice(1)); // getElementById context 하위 검색 불가능
							try {
								if(elements && elements.nodeType) {
									this.elements[0] = elements;
								}
							}catch(e) {}
						}else { // tag
							elements = (context || document).getElementsByTagName(selector);
							try {
								if(elements && (elements.length || elements instanceof NodeList || elements instanceof HTMLCollection)) { // IE7 문제: NodeList, HTMLCollection
									for(i=0, max=elements.length; i<max; i++) {
										this.elements[i] = elements[i];
									}
								}
							}catch(e) {}
						}
					}
				}
			}
		}

		// this.elements -> this 연관배열 
		for(i=0, max=this.elements.length; i<max; i++) {
			this[i] = this.elements[i];
		}
		this.length = this.elements.length;

		return this;
	}

	// DOM prototype
	DOM.fn = DOM.prototype = {
		constructor: DOM, // constructor 를 Object 가 아닌 DOM 으로 변경
		// document ready
		ready: (function() {
			if(document.readyState === "interactive" || document.readyState === "complete") {
				// IE8 등에서 global.setTimeout 파라미터로 바로 함수값을 넣으면 오류가 난다.
				// 그러므로 function() {} 무명함수로 해당 함수를 실행시킨다.
				return function(callback) {
					global.setTimeout(function() {
						callback();
					});
				};
			}else if(document.addEventListener) { // Mozilla, Opera, Webkit 
				return function(callback) {
					document.addEventListener("DOMContentLoaded", callback, false);
				};
			}else if(document.attachEvent) { // IE
				return function(callback) {
					// https://developer.mozilla.org/ko/docs/Web/API/Document/readyState
					document.attachEvent("onreadystatechange", function(e) {
						if(document.readyState === "complete") {
							callback.call(this, e);
						}
					});
				};
			}
		})(),
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
			if(this.elements && this.elements.length > 0) {
				return DOM(selector, this.elements[0] || document);
			}
			return this;
		},
		// loop elements
		each: function(callback) { 	
			var i, max;

			if(this.elements && this.elements.length > 0 && typeof callback === 'function') {
				for(i=0, max=this.elements.length; i<max; i++) {
					// i:key, this.elements[i]:element
					if(callback.apply(this.elements[i], [i, this.elements[i]]) === false) { // return false 경우 break
						break;
					}
				}
			}
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
			// getElementsByTagName('*'); // 폴리필
			if(this.elements && this.elements.length > 0 && this.elements[0].hasChildNodes()) { // true | false
				return this.elements[0].children;
			}
		},
		//
		/*getClass: (function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if('classList' in document.createElement('div')) {
				return function() {
					if(this.elements && this.elements.length > 0) {
						return this.elements[0].classList;
					}
				};
			}else {
				return function() {
					if(this.elements && this.elements.length > 0 && this.elements[0].className) {
						return this.elements[0].className.split(/\s+/);
					}
				};
			}
		})(),*/
		getClass: function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if(this.elements && this.elements.length > 0) {
				if('classList' in this.elements[0]) {
					return this.elements[0].classList;
				}else if('className' in this.elements[0]) {
					return this.elements[0].className.split(/\s+/);
				}
			}
		},
		hasClass: function(name) { 
			// x.className; // 표준
			var regexp;

			if(this.elements && this.elements.length > 0 && typeof name === 'string' && this.elements[0].className) {
				regexp = new RegExp('(\\s|^)' + name + '(\\s|$)'); // new로 만들때에는 이스케이프문자 \는 \\로 해주어야 한다.
				return regexp.test(this.elements[0].className);
			}

			return false;
		},
		/*addClass: (function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if('classList' in document.createElement('div')) {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr;
					
					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.elements[i].classList.add(arr[key]); // add(): 한번에 하나의 클래스만 입력 가능하다. 즉, 띄어쓰기로 여러 클래스 입력 불가능
							}
						}
					}

					return this;
				};
			}else {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr;
					
					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
						for(i=0; i<max; i++) {
							for(key in arr) {
								if(!(!!this.elements[i].className.match(new RegExp('(\\s|^)' + arr[key] + '(\\s|$)')))) { // new로 만들때에는 이스케이프문자 \는 \\로 해주어야 한다.
									this.elements[i].className += " " + arr[key];
								}
							}
						}
					}

					return this;
				};
			}
		})(),*/
		addClass: function(name) {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			var i, key, max = (this.elements && this.elements.length) || 0;
			var arr;
			
			if(!max) {
				return this;
				//return false;
			}else if(typeof name === 'string') {
				arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
				for(i=0; i<max; i++) {
					for(key in arr) {
						if('classList' in this.elements[i]) {
							this.elements[i].classList.add(arr[key]); // add(): 한번에 하나의 클래스만 입력 가능하다. 즉, 띄어쓰기로 여러 클래스 입력 불가능
						}else if('className' in this.elements[i] && !(!!this.elements[i].className.match(new RegExp('(\\s|^)' + arr[key] + '(\\s|$)')))) { // new로 만들때에는 이스케이프문자 \는 \\로 해주어야 한다.
							this.elements[i].className += " " + arr[key];
						}
					}
				}
			}

			return this;
		},
		/*removeClass: (function() {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			if('classList' in document.createElement('div')) {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr;

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.elements[i].classList.remove(arr[key]); // remove(): 한번에 하나의 클래스만 삭제 가능하다. 즉, 띄어쓰기로 여러 클래스 삭제 불가능
							}
						}
					}

					return this;
				};
			}else {
				return function(name) {
					var regexp;
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr;

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') {
						arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
						for(i=0; i<max; i++) {
							for(key in arr) {
								regexp = new RegExp('(\\s|^)' + arr[key] + '(\\s|$)'); // new로 만들때에는 이스케이프문자 \는 \\로 해주어야 한다.
								this.elements[i].className = this.elements[i].className.replace(regexp, ' ');
							}
						}
					}

					return this;
				};
			}
		})(),*/
		removeClass: function(name) {
			// x.classList; // IE10이상 사용가능
			// x.className; // 표준
			var regexp;
			var i, key, max = (this.elements && this.elements.length) || 0;
			var arr;

			if(!max) {
				return this;
				//return false;
			}else if(typeof name === 'string') {
				arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
				for(i=0; i<max; i++) {
					for(key in arr) {
						if('classList' in this.elements[i]) {
							this.elements[i].classList.remove(arr[key]); // remove(): 한번에 하나의 클래스만 삭제 가능하다. 즉, 띄어쓰기로 여러 클래스 삭제 불가능
						}else if('className' in this.elements[i]) {
							regexp = new RegExp('(\\s|^)' + arr[key] + '(\\s|$)'); // new로 만들때에는 이스케이프문자 \는 \\로 해주어야 한다.
							this.elements[i].className = this.elements[i].className.replace(regexp, ' ');
						}
					}
				}
			}

			return this;
		},
		/*toggleClass: (function() {
			// x.classList; // IE10이상 사용가능
			if('classList' in document.createElement('div')) {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr;

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') { 
						arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.elements[i].classList.toggle(arr[key]);
							}
						}
					}

					return this;
				};
			}else {
				return function(name) {
					var i, key, max = (this.elements && this.elements.length) || 0;
					var arr;

					if(!max) {
						return this;
						//return false;
					}else if(typeof name === 'string') { 
						arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
						for(i=0; i<max; i++) {
							for(key in arr) {
								this.hasClass.call(this, arr[key]) ? this.removeClass.call(this, arr[key]) : this.addClass.call(this, arr[key]);
							}
						}
					}

					return this;
				};
			}
		})(),*/
		toggleClass: function(name) {
			// x.classList; // IE10이상 사용가능
			var i, key, max = (this.elements && this.elements.length) || 0;
			var arr;

			if(!max) {
				return this;
				//return false;
			}else if(typeof name === 'string') { 
				arr = name.split(/\s+/); // 띄어쓰기로 구분된 여러 클래스 분리
				for(i=0; i<max; i++) {
					for(key in arr) {
						if('classList' in this.elements[i]) {
							this.elements[i].classList.toggle(arr[key]);
						}else {
							this.hasClass.call(this, arr[key]) ? this.removeClass.call(this, arr[key]) : this.addClass.call(this, arr[key]);
						}
					}
				}
			}

			return this;
		},
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
			}else if(typeof value === 'string' || typeof value === 'number') { // set
				for(i=0; i<max; i++) {
					this.elements[i].innerHTML = value;
				}
			}

			return this;
		},
		text: function(value) {
			// x.textContent; // 표준
			// x.innerText; // IE
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				return this.elements[0].textContent || this.elements[0].innerText;
			}else if(typeof value === 'string' || typeof value === 'number') { // set
				for(i=0; i<max; i++) {
					this.elements[i].textContent = this.elements[i].innerText = value;
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
			}else if(typeof value === 'string' || typeof value === 'number') { // set
				for(i=0; i<max; i++) {
					this.elements[i].value = value;
				}
			}

			return this;
		},
		// stylesheet
		css: function(parameter) {
			// x.style.cssText; // 표준
			// x.currentStyle[styleProp];
			// document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
			var i, key, max = (this.elements && this.elements.length) || 0;
			var value;
			var property, current, unit;
			var tmp1, tmp2;
			var getStyleProperty = function(style, property) {
				var i, max;
				var converted = '';
				if(style === 'js') {
					// HTML DOM Style Object (CSS 속성방식이 아닌 Jvascript style property 방식)
					// (예: background-color -> backgroundColor)
					for(i=0, max=property.length; i<max; ++i) {
						if(property.charAt(i) === '-' && property.charAt(i+1)) {
							converted = converted + property.charAt(++i).toUpperCase();
						}else {
							converted = converted + property.charAt(i);
						}
					}
				}else if(style === 'css') {
					// CSS 속성명으로 값을 구한다.
					// CSS style property 의 경우 대문자를 소문자로 변환하고 그 앞에 '-'를 붙인다. 
					// (예: backgroundColor -> background-color, zIndex -> z-index, fontSize -> font-size)
					for(i=0, max=property.length; i<max; ++i) {
						if(property.charAt(i) === property.charAt(i).toUpperCase()) {
							converted = converted + '-' + property.charAt(i).toLowerCase();
						}else {
							converted = converted + property.charAt(i);
						}
					}
				}else {
					converted = property;
				}
				return converted;
			};

			/*
			// transition, animation 처리 방법
			element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = '1s';
			element.style.webkitAnimationDelay = element.style.MozAnimationDelay = element.style.msAnimationDelay = element.style.OAnimationDelay = element.style.animationDelay = '1s';
			*/
			if(!max) {
				return this;
				//return false;
			}else if(typeof parameter === 'string' && this.elements[0].nodeType && this.elements[0].nodeType !== 3 && this.elements[0].nodeType !== 8) { // get
				// return this[0].style[property]; // CSS 속성과 JS 에서의 CSS 속성형식이 다르므로 사용불가능
				// return this[0].style.getPropertyValue(property); // CSS 속성명을 사용하여 정상적 출력가능
				if(this.elements[0].style[getStyleProperty('js', parameter)]) { // style로 값을 구할 수 있는 경우
					value = this.elements[0].style[getStyleProperty('js', parameter)];
				}else if(this.elements[0].currentStyle && this.elements[0].currentStyle[getStyleProperty('js', parameter)]) { // IE의 경우
					value = this.elements[0].currentStyle[getStyleProperty('js', parameter)];
				}else if(document.defaultView && document.defaultView.getComputedStyle) {
					if(document.defaultView.getComputedStyle(this.elements[0], null).getPropertyValue(getStyleProperty('css', parameter))) {
						value = document.defaultView.getComputedStyle(this.elements[0], null).getPropertyValue(getStyleProperty('css', parameter));
					}
				}

				// css 는 단위까지 명확하게 알기위한 성격이 강하므로, 단위/숫자 분리는 하지않고 값 그대로 반환
				return value;
			}else if(typeof parameter === 'object') { // set
				for(i=0; i<max; i++) {
					for(property in parameter) {
						// 속성, 값 검사 
						if(!parameter.hasOwnProperty(property) || !this.elements[i].nodeType || this.elements[i].nodeType === 3 || this.elements[i].nodeType === 8) {
							continue;
						}

						// +=, -= 연산자 분리
						if(tmp1 = new RegExp("^([+-])=(" + regexp.source_num + ")", "i").exec(parameter[property])) { 
							// tmp1[1]: 연산자
							// tmp1[2]: 값
							current = DOM(this.elements[i]).css(property);
							unit = '';
							// 단위값 존재 확인
							if(regexp.text.test(current)) { // 기존 설정값이 단어로 되어 있는 것 (예: auto, none 등)
								unit = 0;
							}else if(tmp2 = regexp.num_unit.exec(current)) { // 단위 분리
								// tmp2[1]: 값
								// tmp2[2]: 단위 (예: px, em, %, s)
								current = tmp2[1];
								unit = tmp2[2];
							}
							parameter[property] = ((tmp1[1] + 1) * tmp1[2] + parseFloat(current)) + unit; // ( '연산자' + 1 ) * 값 + 현재css속성값
						}

						// trim
						/*if(typeof parameter[property] === 'string') {
							parameter[property].replace(regexp.trim,  '');
						}*/
						
						// 단위값이 없을 경우 설정
						if(regexp.num.test(parameter[property]) && !regexp.num_unit.test(parameter[property])) {
							// property default value 단위가 px 에 해당하는 것
							if(regexp.pixel_unit_list.test(property)) {
								parameter[property] = parameter[property] + 'px';
							}else if(regexp.time_unit_list.test(property)) { // animation, transition
								parameter[property] = parameter[property] + 's';
							}
						}

						// window, document
						if(this.elements[i].nodeType === 9 || this.elements[i] === window) {
							this.elements[i] = global.document.documentElement; // html
							//this.elements[i] = global.document.body;
						}

						// css 값 설정
						if(parameter[property] === '' || parameter[property] === null) { // 해당 css 프로퍼티 초기화여부 확인
							// 초기화시 css default value 를 설정해 주는 것이 가장 정확함
							if(this.elements[i].style.removeProperty) {
								this.elements[i].style.removeProperty(getStyleProperty('css', property));
							}else if(this.elements[i].style.removeAttribute) { // IE9 이상
								this.elements[i].style.removeAttribute(getStyleProperty('js', property));
							}else if(getStyleProperty('js', property) in this.elements[i].style) {
								this.elements[i].style[getStyleProperty('js', property)] = null;
							}
						}else if(getStyleProperty('js', property) in this.elements[i].style) {
							// 방법1
							// 단위(예:px)까지 명확하게 입력해줘야 한다.
							this.elements[i].style[getStyleProperty('js', property)] = parameter[property];
						}else if(typeof this.elements[i].style.setProperty !== 'undefined') {
							// 방법2 (Internet Explorer version 9)
							this.elements[i].style.setProperty(getStyleProperty('css', property), parameter[property]);	
						}
					}
				}
			}

			return this;
		},
		show: function() {
			// x.setAttribute(y, z); // IE8이상 사용가능
			var i, key, max = (this.elements && this.elements.length) || 0;
			var dummy;
			var display;
			var iframe, doc;

			if(!max) {
				return this;
				//return false;
			}else {
				for(i=0; i<max; i++) {
					if(!this.elements[i].tagName || !this.elements[i].nodeType || this.elements[i].nodeType === 3 || this.elements[i].nodeType === 8) {
						continue;
					}

					// default value
					dummy = document.createElement(this.elements[i].tagName);
					document.body.appendChild(dummy);
					display = DOM(dummy).css('display');
					dummy.parentNode.removeChild(dummy);
					if(!display || display === 'none') {
						iframe = document.createElement('iframe');
						iframe.setAttribute('frameborder', 0);
						iframe.setAttribute('width', 0);
						iframe.setAttribute('height', 0);
						iframe.style.cssText = 'display:block !important';
						document.body.appendChild(iframe);

						doc = (iframe.contentWindow || iframe.contentDocument).document;
						doc.write("<!doctype html><html><body>");
						doc.close();

						dummy = doc.createElement(this.elements[i].tagName);
						doc.body.appendChild(dummy);
						display = DOM(dummy).css('display');
						
						iframe.parentNode.removeChild(iframe);
					}

					// css 값 설정
					this.elements[i].style.display = display;
				}
			}

			return this;
		},
		hide: function() {
			var i, key, max = (this.elements && this.elements.length) || 0;

			if(!max || !this.elements[0].nodeType || this.elements[0].nodeType === 3 || this.elements[0].nodeType === 8) {
				return this;
				//return false;
			}else {
				for(i=0; i<max; i++) {
					if(!this.elements[i].tagName || !this.elements[i].nodeType || this.elements[i].nodeType === 3 || this.elements[i].nodeType === 8) {
						continue;
					}

					// css 값 설정
					this.elements[i].style.display = 'none';
				}
			}

			return this;
		},
		// 절대좌표 (jQuery 와 다르게 값 설정은 하지 않는다. position 을 디자인설계와 다르게 스크립트가 변경하기 때문)
		offset: function() {
			var max = (this.elements && this.elements.length) || 0;
			var win, doc; 
			var offset = {}, box = {'top': 0, 'left': 0};

			if(!max) {
				return this;
			}else {
				win = getWindow(this.elements[0]);
				doc = getDocument(this.elements[0]);

				// getBoundingClientRect
				if(typeof this.elements[0].getBoundingClientRect !== 'undefined') {
					box = this.elements[0].getBoundingClientRect();
				}

				// scroll 값 포함
				offset.top = box.top + (win.pageYOffset || doc.documentElement.scrollTop) - (doc.documentElement.clientTop || 0);
				offset.left = box.left + (win.pageXOffset || doc.documentElement.scrollLeft) - (doc.documentElement.clientLeft || 0);

				return offset;
			}
		},
		// 상대좌표 (부모 element 기준)
		position: function() {
			var position, offset;
			var offsetParent, parentOffset = {'top': 0, 'left': 0};
			var getOffsetParent = function(element) {
				// document.documentElement; //<html> element //표준
				var offsetParent = element.offsetParent || document.documentElement;
				while(offsetParent && (!(offsetParent.nodeName && offsetParent.nodeName.toLowerCase() === 'html') && DOM(offsetParent).css('position') === "static")) {
					offsetParent = offsetParent.offsetParent;
				}
				return offsetParent || document.documentElement;
			};

			if(!this.elements || !this.elements.length) {
				return this;
				//return false;
			}else { // get
				position = this.css.call(this, 'position');
				//
				if(position === 'fixed') {
					offset = this.elements[0].getBoundingClientRect();
				}else {
					offsetParent = DOM(getOffsetParent(this.elements[0]));
					offset = this.offset();
					if(!(offsetParent[0].nodeName && offsetParent[0].nodeName.toLowerCase() === 'html')) {
						parentOffset = offsetParent.offset();
					}
					parentOffset.top += getNumber(offsetParent.css('borderTopWidth'));
					parentOffset.left += getNumber(offsetParent.css('borderLeftWidth'));
				}
				//
				return {
					'top': offset.top - parentOffset.top - getNumber(this.css('marginTop')),
					'left': offset.left - parentOffset.left - getNumber(this.css('marginLeft'))
				};
			}
		},
		//
		width: function(value) {
			var i, key, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else if(typeof value === 'undefined') { // get
				if(this.elements[0] === window) { // window (브라우저)
					return global.innerWidth || document.documentElement.clientWidth;
				}else if(this.elements[0].nodeType === 9) { // document
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
					}
					
					// 단위(예:px)까지 명확하게 입력해줘야 한다.
					this.elements[i].style.width = value;
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
				if(this.elements[0] === window) { // window (브라우저)
					return global.innerHeight || document.documentElement.clientHeight;
				}else if(this.elements[0].nodeType === 9) { // document
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
					}
					
					// 단위(예:px)까지 명확하게 입력해줘야 한다.
					this.elements[i].style.height = value;
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
			// x.attributes[y]; //
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
		empty: function() {
			// x.hasChildNodes(); // 표준
			// x.removeChild(y); // 표준
			// x.parentNode; //표준
			// x.childNodes[1]; // IE9이상 사용가능 (IE8이하 부분지원), TextNode 까지 검색
			// x.children[1]; // IE9이상 사용가능 (IE8이하 부분지원)
			// x.lastChild; // IE9이상 사용가능
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else {
				for(i=0; i<max; i++) {
					// element
					while(this.elements[i].hasChildNodes()) { // TextNode 포함 내부 element 전체 제거
						this.elements[i].removeChild(this.elements[i].lastChild);
					}
					
					// select box
					if(this.elements[i].options && this.elements[i].nodeName.toLowerCase() === 'select') {
						this.elements[i].options.length = 0;
					}
				}
			}

			return this;
		},
		remove: function() {
			// x.removeChild(y); // 표준
			// x.parentNode; // 표준
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else {
				// 이벤트 제거 
				// (element에 이벤트가 설정되었을 경우 이벤트 리스너도 같이 삭제해야 이벤트 메모리 누적 방지)
				//this.off(); 
				
				// element remove
				for(i=0; i<max; i++) {
					if(this.elements[i].parentNode) {
						this.elements[i].parentNode.removeChild(this.elements[i]);
					}
				}
			}
		},
		//
		clone: function(is) { // jQuery 처럼 이벤트 복사는 api.dom 을 통해 설정된 이벤트 리스트(storage)에 한해 설계가능하다
			// x = y.cloneNode(true | false); // 표준
			// is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)
			if(this.elements && this.elements.length > 0 && this.elements[0].nodeType) {
				// id를 가진 node를 복사할 때 주의하자(페이지내 중복 id를 가진 노드가 만들어 지는 가능성이 있다)
				return this.elements[0].cloneNode(is || true);
			}

			return this;
		},
		//
		prepend: function(parameter) {
			// x.insertBefore(y,z); // 표준
			// x.firstChild; // IE9이상 사용가능 (TextNode 포함)
			// x.firstElementChild // TextNode 제외
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
			}
						
			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].nodeType === 1 || this.elements[i].nodeType === 9 || this.elements[i].nodeType === 11) {
						if(element.nodeType === 11) { // FRAGMENT NODE
							this.elements[i].insertBefore(element.cloneNode(true), this.elements[i].firstChild);
						}else {
							this.elements[i].insertBefore(element, this.elements[i].firstChild);
						}
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
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
			}

			if(element) {
				for(i=0; i<max; i++) {
					if(this.elements[i].nodeType === 1 || this.elements[i].nodeType === 9 || this.elements[i].nodeType === 11) {
						if(element.nodeType === 11) { // FRAGMENT NODE
							this.elements[i].appendChild(element.cloneNode(true));
						}else {
							this.elements[i].appendChild(element);
						}
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

			// api.dom(기준 요소).before(이동할 요소);
			// 이동(또는 삽입)시킬 element 가 기준 element 바로 뒤로 이동(또는 삽입)한다.
			var i, max = (this.elements && this.elements.length) || 0;
			var element;
			
			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
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

			// api.dom(기준 요소).before(이동할 요소);
			// 이동(또는 삽입)시킬 element 가 기준 element 바로 전으로 이동(또는 삽입)한다.
			// querySelectorAll 또는 api.dom() length 가 있으나, querySelector 는 length 가 없다.
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
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

			// api.dom(이동할 요소).insertBefore(기준 요소);
			// 이동(또는 삽입)시킬 element 가 기준 element 바로 전으로 이동(또는 삽입)한다.
			// querySelectorAll 또는 api.dom() length 가 있으나, querySelector 는 length 가 없다.
			var i, max = (this.elements && this.elements.length) || 0;
			var element;

			// parameter 검사
			if(!max || !parameter) {
				return this;
				//return false;
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
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
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
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
		on: function(events, handler, capture) {
			var events = events || ''; // 띄어쓰기 기준 여러개의 이벤트를 설정할 수 있다.
			var handler = handler || function() {};
			var capture = typeof capture !== 'boolean' ? false : capture; // IE의 경우 캡쳐 미지원 (기본값: false 버블링으로 함)
			var list = events.split(/\s+/);

			/*
			.on('click.EVENT_CLICK_TEST mousedown.EVENT_MOUSEDOWN_TEST');
			.on('click.EVENT_CLICK_TEST');
			.on('click');
			*/

			this.each(function(index, element) {
				var arr = [];
				var type, key;
				var i, max;
				var callback;
				var result = {};

				if(typeof element.storage !== 'object') {
					element.storage = {};
				}
				if(typeof element.storage.events !== 'object') {
					element.storage.events = {};
				}

				for(i=0, max=list.length; i<max; i++) {
					// 이벤트 type.key 분리
					arr = list[i].split('.');
					type = arr.shift();
					if(0 < arr.length) { 
						// key 존재함
						key = arr.join('');
					}

					if(type) {
						// 이벤트 바인딩
						if(typeof element.addEventListener === 'function') {
							callback = handler.bind(element);
							element.addEventListener(type, callback, capture); // IE9이상 사용가능
						}else if(element.attachEvent) { // IE (typeof 검사시 IE8에서는 function 이 아닌 object 반환)
							callback = function(e) { // IE this 바인딩 문제
								handler(e, element);
							};
							/*
							// 아래 같이 선언했을 경우 IE에서 스택풀 발생
							handler = function(e) { // IE this 바인딩 문제
								handler(e, element);
							};
							*/
							element.attachEvent('on' + type, callback); 
						}

						// 이벤트 정보 저장
						result = {
							"key": key, // 사용자가 지정한 이벤트키
							"event": type,
							"handler": callback,
							"capture": capture
						};
						// event array (이벤트 종류별로 저장)
						if(typeof element.storage.events[type] !== 'object') {
							element.storage.events[type] = [];
						}
						element.storage.events[type].push(result);
						// event key (이벤트 key/type 별로 저장)
						if(key) {
							if(typeof element.storage[key] !== 'object') {
								element.storage[key] = {};
							}
							element.storage[key][type] = result;
						}
					}
				}
			});

			return this;
		},
		off: function(events) {
			var that = this;
			var events = events || ''; // 띄어쓰기 기준 여러개의 이벤트를 해제할 수 있다.
			var list = events.split(/\s+/);
			var i, max;
			var setListener = function(element, event, handler, capture) { // 이벤트 해제
				if(typeof element.removeEventListener === 'function') {
					element.removeEventListener(event, handler, capture);
				}else if(element.detachEvent) { // IE
					element.detachEvent('on' + event, handler);
				}
			};

			/*
			.off('click.EVENT_CLICK_TEST mousedown.EVENT_MOUSEDOWN_TEST');
			.off('click.EVENT_CLICK_TEST');
			.off('click');
			.off('.EVENT_CLICK_TEST');
			.off();
			*/

			for(i=0, max=list.length; i<max; i++) {
				(function(factor) {
					var arr = [];
					var type, key;
					var setRemove = function() {};

					// 이벤트 type.key 분리
					arr = factor.split('.');
					if(1 < arr.length) { 
						// key 존재함
						type = arr.shift();
						key = arr.join('');
					}else {
						type = arr.shift();
					}

					if(key) {
						// key 기반 이벤트 해제
						if(type) { 
							// type.key 해제
							setRemove = function(element) {
								var result = {};

								if(element.storage[key]) {
									result = element.storage[key][type];
									if(result) {
										setListener(element, result.event, result.handler, result.capture);
									}
									delete element.storage[key][type];
								}
							};
						}else { 
							// .key 해당 전체 해제
							setRemove = function(element) {
								var event;
								var result = {};

								if(element.storage[key]) {
									for(event in element.storage[key]) {
										if(element.storage[key].hasOwnProperty(event)) {
											result = element.storage[key][event];
											if(result) {
												setListener(element, result.event, result.handler, result.capture);
											}
											delete element.storage[key][event];
										}
									}
									delete element.storage[key];
								}
							};
						}
					}else if(type) { 
						// type 해당 전체 해제
						setRemove = function(element) {
							var result = {};

							if(element.storage.events[type]) {
								while(element.storage.events[type].length) {
									result = element.storage.events[type].shift();
									if(result) {
										setListener(element, result.event, result.handler, result.capture);
										if(result.key && element.storage.events[result.key]) {
											delete element.storage.events[result.key][type];
										}
									}
								}
								delete element.storage.events[type];
							}
						};
					}else { 
						// 전체 해제
						setRemove = function(element) {
							var event;
							var result = {};

							for(event in element.storage.events) {
								while(element.storage.events[event].length) {
									result = element.storage.events[event].shift();
									if(result) {
										setListener(element, result.event, result.handler, result.capture);
										if(result.key && element.storage.events[result.key]) {
											delete element.storage.events[result.key][event];
										}
									}
								}
								delete element.storage.events[event];
							}
						};
					}

					that.each(function(i, element) {
						if(typeof element.storage === 'object') {
							setRemove(element);
						}
					});
				})(list[i]);
			}

			return this;
		},
		one: function(events, handler, capture) {
			var that = this;
			var key = global.api.key();
			var callback = function() {
				// off
				that.off('.' + key);
				// handler
				handler.apply(this, Array.prototype.slice.call(arguments));
			};
			// on
			that.on(events + '.' + key, callback, capture);
		},
		trigger: (function() {
			if(document.createEvent) {
				return function(events) {
					var obj = document.createEvent('MouseEvents');
					obj.initEvent(events, true, false);
					this.each(function() {
						this.dispatchEvent(obj);
					});
				};
			}else if(document.createEventObject) { // IE
				return function(events) {
					var obj = document.createEventObject();
					this.each(function() {
						this.fireEvent('on' + events, obj);
					});
				};
			}
		})(),
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
			/*
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
			*/
			// svg 대응
			return function(parameter) {
				// x.setAttribute(y, z); // IE8이상 사용가능
				var key;
				var i, max = (this.elements && this.elements.length) || 0;

				if(!max) {
					return this;
					//return false;
				}else if(typeof parameter === 'string') { // get
					if('dataset' in this.elements[0]) {
						return this.elements[0].dataset[setTheFirstLetter(parameter)];
					}else {
						return this.attr('data-' + parameter);
					}
				}else if(typeof parameter === 'object') { // set
					for(i=0; i<max; i++) {
						for(key in parameter) {
							if('dataset' in this.elements[i]) {
								this.elements[i].dataset[setTheFirstLetter(key)] = parameter[key];
							}else if('setAttribute' in this.elements[i]) {
								this.elements[i].setAttribute('data-' + key, parameter[key]);
							}
						}
					}
				}

				return this;
			};
		})(),
		// scroll 정보 / 설정
		scroll: function(parameter) {
			var parameter = parameter || {};
			var key, property;
			var i, max = (this.elements && this.elements.length) || 0;
			var scroll;
			var getBrowserScroll = function() {
				if('pageXOffset' in window && 'pageYOffset' in window) {
					return {'left': global.pageXOffset, 'top': global.pageYOffset};
				}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
					return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
				}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
					return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
				}else {
					return {'left': 0, 'top': 0};
				}
			};
			
			if(max) {
				if(this.elements[0] === window || this.elements[0].nodeType === 9) { 
					// window, document
					scroll = getBrowserScroll();
					if('left' in parameter || 'top' in parameter) {
						global.scrollTo((typeof parameter.left !== 'undefined' ? parameter.left : (scroll.left || 0)), (typeof parameter.top !== 'undefined' ? parameter.top : (scroll.top || 0)));
					}else {
						return {'left': scroll.left, 'top': scroll.top};
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
			}else if(typeof parameter === 'object') {
				if(parameter.elements) {
					element = parameter.elements[0];	
				}else if(parameter.nodeType) {
					element = parameter;	
				}
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

	// one, two, delay touch
	/*
	마우스 또는 터치 up 이 발생하고, 특정시간 이후까지 down이 발생하지 않았을 때, 클릭이 몇번발생했는지 카운트를 시작한다.

	-
	사용예

	api.touch.on('#ysm', 
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
	api.touch.off('#ysm', 'one'); // one 해제

	또는

	api.touch.on('#ysm', function() {
		...
	});
	api.touch.off('#ysm', 'all'); // 전체 해제
	*/
	var setTouchHandler = function(e, element) {
		var event = e || global.event;
		var touch = event.touches; // touchstart
		var that = element || this;
		var radius = 0; // 유효한 터치영역
		var checkout = {
			'delay': 1000, // 길게누르고 있는지 여부 검사시작 시간
			'count': 250, // 몇번을 클릭했는지 검사시작 시간
			'interval': 180 // 터지 down, up 이 발생한 간격 검사에 사용되는 시간
		};

		// 기본 이벤트를 중단시키면 스크롤이 작동을 안한다.
		// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.

		if(!that['storage']) { // 유효성 검사
			return;
		}else if(touch && touch.length && 1 < touch.length) { // 멀티터치 방지
			return;
		}

		// 이벤트 종료
		DOM(document).off('.EVENT_MOUSEMOVE_DOM_TOUCH');
		DOM(document).off('.EVENT_MOUSEUP_DOM_TOUCH');

		// 필수 정보
		that.touchCount = that.touchCount || 0; // 터치 횟수
		that.touchTimeDelay = that.touchTimeDelay || null; // delay check 관련 setTimeout
		that.touchTimeCount = that.touchTimeCount || null; // 터치 횟수 카운트 시작 관련 setTimeout
		that.touchCheck = that.touchCheck || {};
		radius = (event.target !== undefined && event.target.offsetWidth !== undefined && event.target.offsetWidth !== 'undefined') ? Math.max(event.target.offsetWidth, event.target.offsetHeight) : 0; // IE문제: 7에서 offsetWidth null 오류
		radius = Math.max(radius, 30); // 이벤트 작동 타겟 영역
		if(touch) {
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
		global.clearTimeout(that.touchTimeCount);
		that.touchTimeDelay = global.setTimeout(function() {
			if(that['storage']['EVENT_DOM_TOUCH_DELAY'] && typeof that['storage']['EVENT_DOM_TOUCH_DELAY'] === 'function') {
				that['storage']['EVENT_DOM_TOUCH_DELAY'].call(that, e);
			}
		}, checkout.delay);

		DOM(document).on(global.api.env['event']['move'] + '.EVENT_MOUSEMOVE_DOM_TOUCH', function(e) {
			var event = e || global.event;
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
				global.clearTimeout(that.touchTimeDelay);
			}
		});

		DOM(document).on(global.api.env['event']['up'] + '.EVENT_MOUSEUP_DOM_TOUCH', function(e) { // IE7문제: window 가 아닌 document 에 할당해야 한다.
			var event = e || global.event;
			var touch = event.changedTouches; // touchend

			// 현재 이벤트의 기본 동작을 중단한다. (모바일에서 스크롤 하단이동 기본기능)
			if(event.preventDefault) { 
				event.preventDefault();
			}else {
				event.returnValue = false;
			}
			
			// 이벤트 종료
			DOM(document).off('.EVENT_MOUSEMOVE_DOM_TOUCH');
			DOM(document).off('.EVENT_MOUSEUP_DOM_TOUCH');

			//					
			that.touchCount += 1;
			that.touchCheck['time']['end'] = new Date().getTime();

			// click check: 지정된 시간까지 다음 클릭이 발생하지 않는다면, count 값을 확인하여 해당 콜백을 실행한다.
			global.clearTimeout(that.touchTimeDelay);
			if(typeof that.touchCheck === 'object' && that.touchCheck[that.touchCount-1]) {
				that.touchTimeCount = global.setTimeout(function() {
					var start = that.touchCheck[0]['start'];
					var end = that.touchCheck[that.touchCount-1]['end'];
					var time = Number(that.touchCheck['time']['end']) - Number(that.touchCheck['time']['start']);

					// handler(callback) 실행
					if(time <= checkout.interval/* 클릭된 상태가 지속될 수 있으므로 시간검사 */ && Math.abs(start['top'] - end['top']) <= radius && Math.abs(start['left'] - end['left']) <= radius) {
						if(that.touchCount === 1 && that['storage']['EVENT_DOM_TOUCH_ONE'] && typeof that['storage']['EVENT_DOM_TOUCH_ONE'] === 'function') {
							that['storage']['EVENT_DOM_TOUCH_ONE'].call(that, e);
						}else if(that.touchCount === 2 && that['storage']['EVENT_DOM_TOUCH_TWO'] && typeof that['storage']['EVENT_DOM_TOUCH_TWO'] === 'function') {
							that['storage']['EVENT_DOM_TOUCH_TWO'].call(that, e);
						}
					}
					that.touchCount = 0;
					that.touchCheck = {};
				}, checkout.count); // 검사 시작시간
			}
		});
	};
	DOM.touch = {
		on: function(selector, handler) {
			if(selector && (typeof handler === 'object' || typeof handler === 'function')) {
				DOM(selector).each(function(i, element) {
					var key;

					if(element && element.nodeType) {
						if(typeof element['storage'] !== 'object') {
							element['storage'] = {};
						}
						if(typeof handler === 'object') {
							for(key in handler) {
								if(handler.hasOwnProperty(key) && /^(one|two|delay)$/i.test(key) && typeof handler[key] === 'function') {
									element['storage']['EVENT_DOM_TOUCH_' + key.toUpperCase()] = handler[key];
								}
							}
						}else {
							element['storage']['EVENT_DOM_TOUCH_ONE'] = handler;
						}
						if(!element['storage']['EVENT_DOM_TOUCH']) {
							DOM(element).on(global.api.env['event']['down'] + '.EVENT_DOM_TOUCH', setTouchHandler);
						}
					}
				});
			}
		},
		off: function(selector, eventkey) { // eventkey: one, two, delay, all
			if(selector) {
				DOM(selector).each(function(i, element) {
					var key = (typeof eventkey === 'string' && eventkey) || 'all';

					if(element && element.nodeType && element['storage']) {
						switch(key.toLowerCase()) {
							case 'one':
							case 'two':
							case 'delay':
								delete element['storage']['EVENT_DOM_TOUCH_' + key.toUpperCase()];
								break;
							case 'all':
								DOM(element).off('.EVENT_DOM_TOUCH');
								break;
						}
					}
				});
			}
		}
	};

	// DOM extend
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

	// BOM localStorage, sessionStorage (IE8 이상)
	var browserStorage = global.localStorage && global.sessionStorage && (function() {
		return {
			clear: function(type) {
				// No return value.
				switch(type) {
					case 'local':
						global.localStorage.clear();
						break;
					case 'session':
						global.sessionStorage.clear();
						break;
				}
			},
			length: function(type) {
				var count = 0;
				switch(type) {
					case 'local':
						count = global.localStorage.length;
						break;
					case 'session':
						count = global.sessionStorage.length;
						break;
				}
				return count;
			},
			get: function(type, key) {
				var item = '';
				if(this.length(type) > 0) {
					switch(type) {
						case 'local':
							item = global.localStorage.getItem(key); // return type string
							break;
						case 'session':
							item = global.sessionStorage.getItem(key); // return type string
							break;
					}
					item = (/^{.*}$|^\[.*\]$/.test(item)) ? JSON.parse(item) : item;
				}
				return item;
			},
			set: function(type, key, item) {
				// No return value.
				item = (item && typeof item === 'object' && Object.keys(item).length > 0) ? JSON.stringify(item) : (item || '');
				switch(type) {
					case 'local':
						global.localStorage.setItem(key, item);
						break;
					case 'session':
						global.sessionStorage.setItem(key, item);
						break;
				}
			},
			del: function(type, key) {
				// No return value.
				switch(type) {
					case 'local':
						global.localStorage.removeItem(key);
						break;
					case 'session':
						global.sessionStorage.removeItem(key);
						break;
				}
			}
		};
	})() || {};

	// public return
	global.api.dom = DOM;
	global.api.storage = browserStorage;

}, this);