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
		 2. Math.random() : 0~1 사이의 랜덤한 수 생성에  //  0.13190673617646098 
		 3. * (1 << 30) : 2의 30승을 곱하고, //  0.13190673617646098  *  1073741824  = 141633779.5
		 4. .toString(16) : 16진수로 문자열로 표현한 후에, // Number(141633779.9).toString(16) = 87128f3.8
		 5. .replace('.', '') : 문자열에서 닷(소수점)을 제거한다. // 'f' + 87128f38 = f87128f38
		return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
		*/
		return ['api', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);
	};

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
			//"orientationchange": 'onorientationchange' in window, // 모바일기기 회전
			"transform": false,
			"transition": false/*('transition' in element.style || 'WebkitTransition' in element.style || 'MozTransition' in element.style || 'OTransition' in element.style || 'msTransition' in element.style)*/,
			"animation": false/*('animationName' in element.style || 'WebkitAnimationName' in element.style || 'MozAnimationName' in element.style || 'OAnimationName' in element.style || 'msAnimationName' in element.style || 'KhtmlAnimationName' in element.style)*/,
			"fullscreen": (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled)
		},
		"monitor": null, // pc | mobile | tablet (해상도에 따라 설정가능) - check['mobile'] 가 있음에도 따로 구분한 이유는 기기기준과 해상도(모니터) 기준의 영역을 나누어 관리하기 위함
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
			"down": "mousedown",
			"move": "mousemove",
			"up": "mouseup",
			"click": window.DocumentTouch && document instanceof DocumentTouch ? 'tap' : 'click',
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

	// monitor
	if(/android/i.test(userAgent)) { // 안드로이드
		// mobile 없으면 태블릿임
		if(/mobile/i.test(userAgent)) {
			environment['monitor'] = 'mobile';
		}else {
			environment['monitor'] = 'tablet';
		}
	}else if(/(iphone|ipad|ipod)/i.test(userAgent)) { // 애플
		if(/ipad/i.test(userAgent)) {
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

	// browser (if문 순서 중요함)
	environment['browser']['name'] = navigator.appName;
	environment['browser']['version'] = String(parseFloat(navigator.appVersion));
	if((verOffset = userAgent.indexOf("opr/")) !== -1) {
		environment['browser']['name'] = "opera";
		environment['browser']['version'] = userAgent.substring(verOffset + 4);
	}else if((verOffset = userAgent.indexOf("opera")) !== -1) {
		environment['browser']['name'] = "opera";
		environment['browser']['version'] = userAgent.substring(verOffset + 6);
		if((verOffset = userAgent.indexOf("version")) !== -1) {
			environment['browser']['version'] = userAgent.substring(verOffset + 8);
		}
	}else if((verOffset = userAgent.indexOf("msie")) !== -1) {
		environment['browser']['name'] = "explorer";
		environment['browser']['version'] = userAgent.substring(verOffset + 5);
	}else if((verOffset = userAgent.indexOf("chrome")) !== -1) {
		environment['browser']['name'] = "chrome";
		environment['browser']['version'] = userAgent.substring(verOffset + 7);
	}else if((verOffset = userAgent.indexOf("safari")) !== -1) {
		environment['browser']['name'] = "safari";
		environment['browser']['version'] = userAgent.substring(verOffset + 7);
		if((verOffset = userAgent.indexOf("version")) !== -1) {
			environment['browser']['version'] = userAgent.substring(verOffset + 8);
		}
	}else if((verOffset = userAgent.indexOf("firefox")) !== -1) {
		environment['browser']['name'] = "firefox";
		environment['browser']['version'] = userAgent.substring(verOffset + 8);
	}else if((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) { 
		environment['browser']['name'] = userAgent.substring(nameOffset, verOffset);
		environment['browser']['version'] = userAgent.substring(verOffset + 1);
		if(environment['browser']['name'].toLowerCase() === environment['browser']['name'].toUpperCase()) {
			environment['browser']['name'] = navigator.appName;
		}
	}
	if((verOffset = environment['browser']['version'].indexOf(';')) !== -1) {
		environment['browser']['version'] = environment['browser']['version'].substring(0, verOffset);
	}
	if((verOffset = environment['browser']['version'].indexOf(' ')) !== -1) {
		environment['browser']['version'] = environment['browser']['version'].substring(0, verOffset);
	}

	// event
	if(environment['check']['touch'] === true) {
		environment['event']['down'] = 'touchstart';
		environment['event']['move'] = 'touchmove';
		environment['event']['up'] = 'touchend';
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
		if(!element || !element instanceof DOM || !property || !(/^(width|height)$/i.test(property)) || (extra && !/^(inner|outer)$/i.test(extra))) return 0;
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
		var key, tmp;

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
		if(value <= 0 || value === null) {
			// css로 값을 구한다.
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
			// offset 값 가공 (margin, border, padding)
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
	// var element = api.dom('<div>').style({'': '', '': ''}).attr({'': ''}).data({'': ''}).on('', function() { ... }).get();
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
	};

	// DOM prototype
	DOM.fn = DOM.prototype = {
		// document ready
		ready: (function() {
			if(document.readyState === "interactive" || document.readyState === "complete") {
				// IE8 등에서 window.setTimeout 파라미터로 바로 함수값을 넣으면 오류가 난다.
				// 그러므로 function() {} 무명함수로 해당 함수를 실행시킨다.
				return function(callback) {
					window.setTimeout(function() {
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
				}
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
					if(callback.apply(this.elements[i], [i, this.elements[i]]) === false) {
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
				return function() {
					if(this.elements && this.elements.length > 0 && this.elements[0].className) {
						return this.elements[0].className.split(/\s+/);
					}
				}
			}
		})(),
		hasClass: function(name) { 
			// x.className; // 표준
			var regexp;

			if(this.elements && this.elements.length > 0 && typeof name === 'string' && this.elements[0].className) {
				regexp = new RegExp('(\\s|^)' + name + '(\\s|$)'); // new로 만들때에는 이스케이프문자 \는 \\로 해주어야 한다.
				return regexp.test(this.elements[0].className);
			}

			return false;
		},
		addClass: (function() {
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
						arr = name.split(/\s+/);
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
		})(),
		removeClass: (function() {
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
		})(),
		toggleClass: (function() {
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
			if(!max || this.elements[0].nodeType === 3 || this.elements[0].nodeType === 8) {
				return this;
				//return false;
			}else if(typeof parameter === 'string') { // get
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
						if(!parameter.hasOwnProperty(property) || this.elements[i].nodeType === 3 || this.elements[i].nodeType === 8) {
							continue;
						}else if(tmp1 = new RegExp("^([+-])=(" + regexp.source_num + ")", "i").exec(parameter[property])) { // +=, -= 연산자 분리
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
		style: function(parameter) { // javascript 의 css 프로퍼티로 직접 접근
			// x.style.cssText; // 표준
			// x.currentStyle[styleProp];
			// document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
			var i, key, max = (this.elements && this.elements.length) || 0;

			/*
			// transition, animation 처리 방법
			element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = '1s';
			element.style.webkitAnimationDelay = element.style.MozAnimationDelay = element.style.msAnimationDelay = element.style.OAnimationDelay = element.style.animationDelay = '1s';
			*/
			if(!max || this.elements[0].nodeType === 3 || this.elements[0].nodeType === 8 || !this.elements[0].style) {
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
								if(typeof parameter[key] === 'number' && regexp.pixel_unit_list.test(key)) {
									parameter[key] += 'px';
								}
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
		remove: function() {
			// x.removeChild(y); // 표준
			// x.parentNode; // 표준
			var i, max = (this.elements && this.elements.length) || 0;

			if(!max) {
				return this;
				//return false;
			}else {
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
			// x.firstChild; // IE9이상 사용가능 (textnode 포함)
			// x.firstElementChild // textnode 제외
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
		on: function(events, handler, capture) {
			var events = events || undefined; // 띄어쓰기 기준 여러개의 이벤트를 설정할 수 있다.
			var handler = handler || undefined;
			var capture = typeof capture !== 'boolean' ? false : capture; // IE의 경우 캡쳐 미지원 (기본값: false 버블링으로 함)
			var arr = [], key;
			var setListener;

			// 이벤트 키
			arr = events.split('.');
			if(1 < arr.length) { 
				// key 존재함
				events = arr.shift();
				key = arr.join('');
			}
			events = events.split(/\s+/);

			// 이벤트 설정
			this.each(function(index, element) {
				var i, max;
				var callback = handler;
				var result = {};

				if(typeof element.storage !== 'object') {
					element.storage = {};
				}
				for(i=0, max=events.length; i<max; i++) {
					//
					if(typeof element.addEventListener === 'function') {
						element.addEventListener(events[i], callback, capture); // IE9이상 사용가능
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
						element.attachEvent('on' + events[i], callback); 
					}

					// 실행 정보 저장
					result = {
						"key": key,
						"event": events[i],
						"handler": callback,
						"capture": capture
					};
					if(typeof element.storage[events[i]] !== 'object') {
						element.storage[events[i]] = [];
					}
					element.storage[events[i]].push(result);
					if(key) {
						if(typeof element.storage[key] !== 'object') {
							element.storage[key] = {};
						}
						element.storage[key][events[i]] = result;
					}
				}
			});

			return this;
		},
		off: function(events) {
			var events = events || undefined; // 띄어쓰기 기준 여러개의 이벤트를 해제할 수 있다.
			var arr = [], key;
			var setListener, setRemove;

			// 이벤트 키
			arr = events.split('.');
			if(1 < arr.length) { 
				// key 존재함
				events = arr.shift();
				key = arr.join('');
			}
			events = events.split(/\s+/);

			// 이벤트 해제
			setListener = function(element, event, handler, capture) {
				if(typeof element.removeEventListener === 'function') {
					element.removeEventListener(event, handler, capture);
				}else if(element.detachEvent) { // IE
					element.detachEvent('on' + event, handler);
				}
			};
			if(key) { 
				if(events[0]) {
					// 헤당키 이벤트 선택 해제
					setRemove = function(element) {
						var i, max;
						var result = {};

						if(element.storage[key]) {
							for(i=0, max=events.length; i<max; i++) {
								result = element.storage[key][events[i]];
								setListener(element, result.event, result.handler, result.capture);
								delete element.storage[key][events[i]];
							}
						}
					};
				}else {
					// 해당키 이벤트 전체 해제
					setRemove = function(element) {
						var event;
						var result = {};

						if(element.storage[key]) {
							for(event in element.storage[key]) {
								if(element.storage[key].hasOwnProperty(event)) {
									result = element.storage[key][event];
									setListener(element, result.event, result.handler, result.capture);
									delete element.storage[key][event];
								}
							}
							delete element.storage[key];
						}
					};
				}
			}else { 
				// 이벤트명 전체 해제
				setRemove = function(element) {
					var i, max;
					var result = {};

					for(i=0, max=events.length; i<max; i++) {
						while(element.storage[events[i]].length) {
							result = element.storage[events[i]].shift();
							setListener(element, result.event, result.handler, result.capture);
							if(result.key && element.storage[result.key]) {
								delete element.storage[result.key][events[i]];
							}
						}
						delete element.storage[events[i]];
					}
				};
			}
			this.each(function(i, element) {
				if(typeof element.storage === 'object') {
					setRemove(element);
				}
			});

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
				}
			}else if(document.createEventObject) { // IE
				return function(events) {
					var obj = document.createEventObject();
					this.each(function() {
						this.fireEvent('on' + events, obj);
					});
				}
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
			var scroll;
			var getScroll = function() {
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
					scroll = getScroll();
					if('left' in parameter || 'top' in parameter) {
						window.scrollTo((typeof parameter.left !== 'undefined' ? parameter.left : (scroll.left || 0)), (typeof parameter.top !== 'undefined' ? parameter.top : (scroll.top || 0)));
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


	/*
	// one, two, delay touch

	마우스 또는 터치 up 이 발생하고, 특정시간 이후까지 down이 발생하지 않았을 때, 클릭이 몇번발생했는지 카운트를 시작한다.
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
		var event = e || window.event;
		var touch = event.touches; // touchstart
		var that = element || this;
		var radius = 0; // 유효한 터치영역

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
		window.clearTimeout(that.touchTimeCount);
		that.touchTimeDelay = window.setTimeout(function() {
			if(that['storage']['EVENT_DOM_TOUCH_DELAY'] && typeof that['storage']['EVENT_DOM_TOUCH_DELAY'] === 'function') {
				that['storage']['EVENT_DOM_TOUCH_DELAY'].call(that, e);
			}
		}, 1000);

		DOM(document).on(global.api.env['event']['move'] + '.EVENT_MOUSEMOVE_DOM_TOUCH', function(e) {
			var event = e || window.event;
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

		DOM(document).on(global.api.env['event']['up'] + '.EVENT_MOUSEUP_DOM_TOUCH', function(e) { // IE7문제: window 가 아닌 document 에 할당해야 한다.
			var event = e || window.event;
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
			window.clearTimeout(that.touchTimeDelay);
			if(typeof that.touchCheck === 'object' && that.touchCheck[that.touchCount-1]) {
				that.touchTimeCount = window.setTimeout(function() {
					var start = that.touchCheck[0]['start'];
					var end = that.touchCheck[that.touchCount-1]['end'];
					var time = Number(that.touchCheck['time']['end']) - Number(that.touchCheck['time']['start']);

					// handler(callback) 실행
					if(time <= 180/* 클릭된 상태가 지속될 수 있으므로 시간검사 */ && Math.abs(start['top'] - end['top']) <= radius && Math.abs(start['left'] - end['left']) <= radius) {
						if(that.touchCount === 1 && that['storage']['EVENT_DOM_TOUCH_ONE'] && typeof that['storage']['EVENT_DOM_TOUCH_ONE'] === 'function') {
							that['storage']['EVENT_DOM_TOUCH_ONE'].call(that, e);
						}else if(that.touchCount === 2 && that['storage']['EVENT_DOM_TOUCH_TWO'] && typeof that['storage']['EVENT_DOM_TOUCH_TWO'] === 'function') {
							that['storage']['EVENT_DOM_TOUCH_TWO'].call(that, e);
						}
					}
					that.touchCount = 0;
					that.touchCheck = {};
				}, 300); // 검사 시작시간
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

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// localStorage, sessionStorage (IE8 이상)
	var browserStorage = global.localStorage && global.sessionStorage && (function() {
		return {
			clear: function(type) {
				switch(type) {
					case 'local':
						window.localStorage.clear();
						break;
					case 'session':
						window.sessionStorage.clear();
						break;
				}
			},
			length: function(type) {
				var count = 0;
				switch(type) {
					case 'local':
						count = window.localStorage.length;
						break;
					case 'session':
						count = window.sessionStorage.length;
						break;
				}
				return count;
			},
			select: function(type, key) {
				var item = '';
				if(this.length(type) > 0) {
					switch(type) {
						case 'local':
							item = window.localStorage.getItem(key); // return type string
							break;
						case 'session':
							item = window.sessionStorage.getItem(key); // return type string
							break;
					}
					item = (/^{.*}$|^\[.*\]$/.test(item)) ? JSON.parse(item) : item;
				}
				return item;
			},
			update: function(type, key, item) {
				item = (item && typeof item === 'object' && Object.keys(item).length > 0) ? JSON.stringify(item) : (item || '');
				switch(type) {
					case 'local':
						window.localStorage.setItem(key, item);
						break;
					case 'session':
						window.sessionStorage.setItem(key, item);
						break;
				}
			},
			delete: function(type, key) {
				switch(type) {
					case 'local':
						window.localStorage.removeItem(key);
						break;
					case 'session':
						window.sessionStorage.removeItem(key);
						break;
				}
			}
		};
	})() || {};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// requestAnimationFrame, cancelAnimationFrame
	var setRequestAnimFrame = (function() { 
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
	})();
	var setCancelAnimFrame = (function() {
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
						element.off(global.api.env['event']['animationend'] + '.EVENT_ANIMATIONEND_queue');
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
					element.addClass(animation).on(global.api.env['event']['animationend'] + '.EVENT_ANIMATIONEND_queue', handler);
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
				if(typeof original[i]['storage'] !== 'object') {
					original[i]['storage'] = {};
				}
				// 현재 상태값 저장
				if(typeof original[i]['storage']['transition'] !== 'object') {
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
				element.off(global.api.env['event']['transitionend'] + '.EVENT_TRANSITION_queue');
				
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
			element.style(properties).on(global.api.env['event']['transitionend'] + '.EVENT_TRANSITION_queue', handler, true);
		})(queue);
	};

	// public return
	global.api.dom = DOM;
	global.api.storage = browserStorage;
	global.api.animationFrameQueue = animationFrameQueue;
	global.api.animationQueue = animationQueue;
	global.api.transitionQueue = transitionQueue;

}, this);
/*
Editor

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

-
사용예

*/

/*
-
Editor's Draft 10 January 2016
http://w3c.github.io/selection-api/

window.getSelection(): 현재 선택된 텍스트 범위 (선택영역, 사용자가 드래그 등으로 여러 엘리먼트에 걸쳐 선택한 텍스트를 대표한다.) - 선택된 값은 selection 객체의 toString()을 호출해서 가져올 수 있다.
window.getSelection().anchorNode: 선택된 글자의 시작노드
window.getSelection().focusNode: 현재 포커스가 위치한 끝노드

window.getSelection().getRangeAt(0): 현재 선택된 텍스트를 반환한다. (index 숫자는 드래드된 글자가 여러개의 경우 몇번째 index의 값을 반환하는지에 사용)
window.getSelection().rangeCount: 현재 선택된(드래드된) 텍스트 개수
window.getSelection().addRange('text'): 글자를 현재 선택된 node 에 삽입

window.getSelection().anchorNode.nodeValue: Text와 Comment를 제외한 대부분 노드 유형에서는 null 값을 반환한다. 이 속성의 용도는 Text와 Comment 노드에서 실제 텍스트 문자열을 추출하는데 초점을 맞추고 있다.
window.getSelection().anchorNode.nodeName
window.getSelection().anchorNode.nodeType

anchorNode.nodeValue   (DOM Level 1)
anchorNode.data   (CDATA, Node.TEXT_NODE 경우 사용)
anchorNode.textContent   (DOM Level 3, FF에서 사용)
anchorNode.innerText   (IE에서 사용)

-
참고자료
DOM 설명: http://wiki.gurubee.net/pages/viewpage.action?pageId=6259958


-
Selection 에 사용되는 용어 정리

anchor
  셀렉션의 시작점.
  마우스로 드래그해서 선택했다면, anchor 는 최초에 마우스가 클릭된 지점이다.
  사용자가 마우스나 키보드로 셀렉션을 수정해도, anchor 는 변경되지 않는다.
  텍스트를 위/아래로 드래그했을 때 고정된 지점이 anchor 이다.

focus
  셀렉션의 끝점.
  마우스로 셀렉션을 만들었다면, 마우스를 뗀 곳이 셀렉션의 focus 지점이다.
  사용자가 마우스나 키보드로 셀렉션을 수정할 때마다 변경된다.

range
  문서에 인접한 부분.
  텍스트 노드를 포함한 전체 노드를 포함할 수 있다.
  일반적으로 사용자는 한 개의 레인지만 선택할 수 있지만, 컨트롤 키 등으로 멀티 레인지를 선택할 수도 있다.
  레인지는 range 객체로 리턴되며, 스크립트에 의해 추가되거나 삭제될 수 있다.



Selection의 주요 속성

Selection.anchorNode
  시작 노드

Selection.anchorOffset
  시작 노드에서 anchor 의 오프셋.
  anchorNode 가 텍스트 노드이면 anchor 이전의 문자열의 개수이고,
  anchorNode 가 엘리먼트일 경우엔 anchor 보다 앞에 있는 자식 노드의 개수를 의미한다.

Selection.focusNode
  끝 노드

Selection.focusOffset
  끝 노드에서 focus 의 오프셋.
  focusNode 가 텍스트 노드이면 focus 이전의 문자열의 개수이고,
  focusNode 가 엘리먼트일 경우엔 focus 보다 앞에 있는 자식 노드의 개수를 의미한다.

Selection.isCollapsed
  셀렉션의 시작지점과 끝지점이 동일한지의 여부

Selection.rangeCount
  셀렉션 내의 레인지 개수



Range

Range 인터페이스는 노드와 텍스트 노드를 포함한 문서의 일부(fragment)이다.
'문서의 특정 부분’을 정의하는 것이라 생각하면 쉽다.

레인지를 생성할 수 있는 방법은 아래와 같다.
- document.createRange()
- Selection 객체의 getRangeAt() 메서드
- Range() 생성자


Range의 주요 속성

Range.collapsed
  레인지의 시작점과 끝점이 동일한지 여부

Range.commonAncestorContainer
  시작 컨테이너와 끝 컨테이너를 포함하고 있는 상위 노드

Range.endContainer
  레인지가 끝나는 지점의 끝 컨테이너 노드

Range.endOffset
  endContainer 노드에서 끝 지점의 오프셋

Range.startContainer
  레인지가 시작하는 지점의 컨테이너 노드

Range.startOffset
  startContainer 노드에서 시작 지점의 오프셋



용어만 잘 이해하면 나머지는 메서드의 설명을 보거나 사용 예를 보면 쉽게 이해할 수 있을 거라 생각한다.
API에 대한 자세한 건 아래 링크를 참고하면 된다.

참고:
https://developer.mozilla.org/en-US/docs/Web/API/Selection
https://developer.mozilla.org/en-US/docs/Web/API/Range





//
function getSelectedText() {
	var txt;
	if(window.getSelection) {
		txt = window.getSelection();
		// window.getSelection().getRangeAt(0); 
	}else if(document.getSelection) {
		txt = document.getSelection();
		// document.createRange();
	}else if(document.selection) { // IE
		txt = document.selection.createRange().text;
		// getRangeAt 미지원
	}
	return txt;
}

// 파이어 폭스의 텍스트 입력 엘리먼트이다.
function getTextFieldSelection(e) { 
	if(e.selectionStart !== undefined && e.selectionEnd !== undefined){
		var start = e.selectionStart;
		var end = e.selectionEnd;
		return e.value.substring(start, end);
	}
	return;
}

// 노드의 텍스트 가져오기
if(el.nodeType === Node.TEXT_NODE) {
	// data
}else if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { // firefox
	// textContent
}else {
	// innerText
}
*/

// http://story.pxd.co.kr/1021
// https://github.com/cheeaun/mooeditable/wiki/Javascript-WYSIWYG-editors

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || ((!global.api || !global.api.dom) && !global.jQuery)) {
		return false;
	}
	global.api.editor = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	/*
	모바일등에서는 복사하기등의 툴팁이 나오기 때문에 중복될수 있다.
	모바일의 경우 툴바의 위치를 상단 오른쪽에 출력되도록 하는것은 어떨까?
	*/

	var EDGE = -200;

	//
	var env = {};
	if(global.api && global.api.env) {
		env = global.api.env;
	}else {
		env = {
			'check': {
				'touch': ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
			},
			'event': {
				"down": "mousedown",
				"move": "mousemove",
				"up": "mouseup",
				"click": 'click'
			}
		};
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
			env['event']['click'] = (window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click';
		}
	}

	// elements
	var elements = {
		'text': {
			'tooltip': undefined,
			'buttons': {
				'element': undefined // button element 들을 감싸고 있는 element
			},
			'options': {
				'element': undefined, // option element 들을 감싸고 있는 element
				'link': {} // url 입력창
			}
		},
		'image': {
			'tooltip': undefined,
			'buttons': undefined,
			'options': undefined
		}
	};

	// style
	var ui = {
		'button': {
			'on': '',
			'off': ''
		}
	};

	//
	var selection;
	var range;
	var composition = false;

	// node 상위(parentNode) 검색하며, condition 결과에 따른 callback 실행
	var getParent = function(node, condition, callback) {
		var result;
		if(!node) {
			return;
		}
		while(node.parentNode) {
			// condition 함수를 실행하여 리턴값이 true 의 경우, callback 함수 실행
			// 1. condition 실행
			// 2. callback 실행
			if(condition(node)) {
				result = callback(node);
				if(typeof result !== 'undefined') {
					return result; // break
				}
			}
			node = node.parentNode;
		}
	};

	// 현재 선택된 글자에 블록태그(파라미터의 tag)를 설정한다.
	var setFormatBlock = function(tag) {
		if(typeof selection === 'object' && 'rangeCount' in selection && selection.rangeCount > 0) {
			if(getParent( // 추가하려는 tag 상위 존재여부 확인
				selection.focusNode,
				// 조건
				function(node) {
					return node.nodeName.toLowerCase() === tag;
				},
				// 조건에 따른 실행
				function(node) {
					return node;
				}
			)) {
				document.execCommand("formatBlock", false, "p");
				document.execCommand("outdent"); // 문자 선택(text selection)의 현위치에서 들어쓰기 한 증가분 만큼 왼쪽으로 내어쓰기 한다.
			}else {
				document.execCommand("formatBlock", false, tag);
			}
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 이미지 관련
	var getHorizontalBounds = function(nodes, target, event) {
		
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 텍스트 에디터 툴바 메뉴(각 기능) 현재 selection 에 따라 최신화
	var setTooltipMenuState = function(parameter) {
		//console.log('setTooltipMenuState');
		/*
		현재 포커스 위치의 element 에서 부모(parentNode)노드를 검색하면서,
		텍스트 에디터메뉴에 해당하는 태그가 있는지 여부에 따라
		해당 버튼에 on/off 효과를 준다.
		*/
		var key;
		if(typeof selection === 'object' && 'rangeCount' in selection && selection.rangeCount > 0) {
			for(key in elements['text']['buttons']) { // 버튼 선택 효과 초기화
				if(key === 'element') {
					continue;
				}
				//elements['text']['buttons'][key].classList.remove('active');
				elements['text']['buttons'][key].style.color = 'rgb(20, 29, 37)';
				elements['text']['buttons'][key].style.background = 'none';
			}
			getParent(
				selection.focusNode,
				// 조건
				function(node) {
					return typeof node.nodeName !== 'undefined' && typeof node.style !== 'undefined';
				},
				// 조건에 따른 실행
				function(node) {
					//console.log(node.nodeName.toLowerCase());
					// style 확인
					/*
					var key;
					for(key in node.style) {
						console.log('node style: ' + key);
						switch(node.style) {

						}	
					}
					*/
					if(node.style.color === '') {

					}
					
					// tag 확인
					switch(node.nodeName.toLowerCase()) {
						case 'b':
						case 'strong': // IE
							//elements['text']['buttons']['bold'].classList.add('active');
							elements['text']['buttons']['bold'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['bold'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'i':
						case 'em': // IE
							elements['text']['buttons']['italic'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['italic'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'strike':
							elements['text']['buttons']['strikethrough'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['strikethrough'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'u':
							elements['text']['buttons']['underline'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['underline'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h1":
							elements['text']['buttons']['h1'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['h1'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h2":
							elements['text']['buttons']['h2'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['h2'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "h3":
							elements['text']['buttons']['h3'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['h3'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case "blockquote":
							elements['text']['buttons']['blockquote'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['blockquote'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
						case 'a':
							elements['text']['buttons']['createLink'].style.color = 'rgb(255, 255, 255)';
							elements['text']['buttons']['createLink'].style.backgroundColor = 'rgb(226, 69, 69)';
							break;
					}
				}
			);
		}
	};

	// 텍스트 에디터 툴바 위치 설정
	var setTooltipMenuPostion = function(parameter) {
		//console.log('setTooltipMenuPostion');
		var parameter = parameter || {};

		var clientRectBounds;
		var tooltip_width, tooltip_height;
		var top, left;

		if(typeof selection !== 'object' || selection.isCollapsed) { // isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
			// 텍스트에디터 툴바숨기기
			elements['text']['tooltip'].style.top = EDGE + "px";
			elements['text']['tooltip'].style.left = EDGE + "px";
		}else if(selection.rangeCount > 0) { // rangeCount: 선택된 글자가 존재 (드래그된 영역이 존재)
			// 툴팁 크기
			tooltip_width = elements['text']['tooltip'].offsetWidth;
			tooltip_height = elements['text']['tooltip'].offsetHeight;
			// 툴팁 위치
			clientRectBounds = selection.getRangeAt(0).getBoundingClientRect(); // left, top, right, bottom
			top = (clientRectBounds.top - tooltip_height) - 5;
			if(top < 0) {
				top = clientRectBounds.bottom + 5; // 툴팁 하단에 출력하도록 변경

				elements['text']['tooltip'].style.borderTop = '1px solid rgb(226, 69, 69)';
				elements['text']['tooltip'].style.borderBottom = 'none';
			}else {
				elements['text']['tooltip'].style.borderBottom = '1px solid rgb(226, 69, 69)';
				elements['text']['tooltip'].style.borderTop = 'none';
			}
			top += window.pageYOffset;
			left = Math.round((clientRectBounds.left + clientRectBounds.right) / 2);
			left -= Math.floor(tooltip_width / 2);
			if(left < 0) {
				left = 0;
			}else if((left + tooltip_width) > Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth)) {
				left = left - ((left + tooltip_width) - Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth));
			}
			elements['text']['tooltip'].style.top = top + "px";
			elements['text']['tooltip'].style.left = left + "px";
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	/*
	-
	아래는 텍스트 에디터의 동작 순서
	1. setTextSelection 선택된 텍스트
	2. setTooltipMousedown 툴바 기능 적용
	3. setTooltipMouseup 적용된 기능에 대해 툴바 상태 최신화
	*/

	// 텍스트 선택(selection)
	var setTextSelection = function(event) {
		//console.log('setTextSelection');
		var event = event || window.event;
		var target = event && (event.target || event.srcElement);

		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		//console.log(target.isContentEditable);
		//console.log(document.activeElement.isContentEditable);
		/*
		selection = window.getSelection();
		setTooltipMenuState();
		setTooltipMenuPostion();
		*/
		
		selection = undefined;
		if(typeof target === 'object' && 'isContentEditable' in target && target.isContentEditable && composition === false) {
			selection = window.getSelection();
			setTooltipMenuState();
		}
		setTooltipMenuPostion();
	};

	// 에디터 버튼 mousedown 이벤트 (에디터 기능을 선택영역에 적용)
	var setTooltipMousedown = function(event) {
		//console.log('setTooltipMousedown');
		// down 했을 때 해당 버튼의 기능 적용
		var event = event || window.event;
		var target = event && (event.target || event.srcElement);
		var editor = target['storage']['editor']; // 버튼의 기능 종류

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		if(typeof selection === 'object' && 'rangeCount' in selection && selection.rangeCount > 0) {
			//console.log('에디터 기능 적용');
			switch(editor) {
				case 'bold':
					if(selection.anchorNode && !getParent(
						selection.anchorNode,
						// 조건
						function(node) { // condition (검사)
							return /^(h1|h2|h3)$/i.test(node.nodeName.toLowerCase()); // h1, h2, h3 태그는 진한색의 글자이므로 제외
						}, 
						// 조건에 따른 실행
						function(node) { // callback (검사결과가 true의 경우)
							return true;
						}
					)) {
						document.execCommand('bold', false);
					}
					break;
				case 'italic':
					document.execCommand('italic', false);
					break;
				case 'strikethrough':
					document.execCommand('strikethrough', false);
					break;
				case 'underline':
					document.execCommand('underline', false);
					break;
				case "h1":
				case "h2":
				case "h3":
					if(selection.focusNode && !getParent(
						selection.focusNode,
						// 조건
						function(node) { // condition (검사)
							return /^(b|strong)$/i.test(node.nodeName.toLowerCase()); 
						}, 
						// 조건에 따른 실행
						function(node) { // callback (검사결과가 true의 경우)
							return true;
						}
					)) {
						setFormatBlock(editor);
					}
					break;
				case "blockquote": // 인용문 (들여쓰기)
					setFormatBlock(editor);
					break;
				case 'createLink':
					// url 입력박스 보이기
					//elements['text']['buttons']['element'].style.display = 'none';
					elements['text']['options']['link']['element'].style.display = 'block';

					// 
					setTimeout(function() {
						//
						var url = getParent(
							selection.focusNode,
							// 조건
							function(node) {
								return typeof node.href !== 'undefined';
							},
							// 조건에 따른 실행
							function(node) {
								return node.href;
							}
						);
						// 선택된(셀렉) 곳에 a 태그 존재 확인
						if(typeof url !== "undefined") { // 이미 a 태그 생성되어 있음
							elements['text']['options']['link']['link-input'].value = url;
						}else { // 신규 a 태그 생성
							document.execCommand("createLink", false, "#none");
						}
						// 위 a 태그의 위치를 기억한다.
						range = selection.getRangeAt(0); // range는 이 위치에서 저장되어야 정상 작동한다!
						//
						elements['text']['options']['link']['link-input'].focus();
					}, 100);
					break;
			}
		}
	};

	// 에디터 버튼 mouseup 이벤트
	var setTooltipMouseup = function(event) {
		var event = event || window.event;
		var target = event && (event.target || event.srcElement);
		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.
		setTimeout(function() {
			// setTextSelection 함수는 isContentEditable 검수하므로 호출하지 않는다
			setTooltipMenuState();
			setTooltipMenuPostion(); // h1, h2, h3 등 적용에 따라 툴바위치가 변경되어야 할 경우가 있다.
		}, 1);
	};

	// 에디터 링크 input blur 이벤트
	var setTooltipLinkBlur = function(event) {
		var url = elements['text']['options']['link']['link-input'].value;
		// 기억해둔 a 태그의 위치를 기능적용 위치로 설정한다.
		window.getSelection().addRange(range);
		// a 태그 초기화(삭제)
		document.execCommand('unlink', false);
		if(url !== "") {
			if(!url.match("^(http|https)://")) {
				url = "http://" + url;
			}
			// 사용자가 입력한 url이 있을 경우 a 태그의 href 최신화 (a 태그 재생성)
			document.execCommand('createLink', false, url);
		}
		elements['text']['options']['link']['link-input'].value = '';

		// url 입력박스 숨기기
		elements['text']['options']['link']['element'].style.display = 'none';

		//
		setTooltipMenuState();
	};

	// 에디터 링크 input keydown 이벤트
	var setTooltipLinkKeydown = function(event) {
		if(event.keyCode === 13) {
			event.preventDefault();
			elements['text']['options']['link']['link-input'].blur(); // trigger blur
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 에디터가 작동할 영역의 이벤트
	var setContenteditableKeydown = function(event) { // 에디터가 실행될 영역 이벤트
		//console.log('setContenteditableKeydown');
		var selection = window.getSelection();
		var parentParagraph;
		var prevSibling;

		// p 태그안에 위치하면서 상단 tag 가 hr 인 경우, 엔터키가 작동하지 않도록 한다.
		if(typeof selection === 'object' && selection.anchorNode) {
			parentParagraph = getParent( // 현재노드 상위로 존재하는 p 태그 반환
				selection.anchorNode,
				// 조건
				function(node) {
					return node.nodeName.toLowerCase() === 'p';
				},
				// 조건에 따른 실행
				function(node) {
					return node;
				}
			);

			// 현재 p태그 내부에 커서가 있으며
			// p태그 내부 텍스트가 입력되지 않은 빈상태이며
			// p태그 바로전 태그가 hr 태그의 경우
			// 사용자가 엔터키를 눌렀을 경우 작동하지 않도록 한다.
			if(event.keyCode === 13 && parentParagraph) { // keyCode 13: enter
				prevSibling = parentParagraph.previousSibling; // 하나 전의 노드
				if(prevSibling && prevSibling.nodeName === "HR" && !prevSibling.textContent.length/*!parentParagraph.nodeValue.length*/) {
					// enter 기본 이벤트 중지
					event.preventDefault();
				}
			}
		}
	};
	var setContenteditableKeyup = function(event) { // 에디터가 실행될 영역 이벤트
		//console.log('setContenteditableKeyup');
		var parentParagraph, prevSibling, prevPrevSibling, hr;
		var insertedNode, unwrap, node, parent, range;

		// 방향키, 엔터키 등 키보드를 눌렀다 때었을 때
		setTextSelection(event);

		// getSelection 선택된 node
		if(typeof selection === 'object' && selection.anchorNode) {
			// 엔터키를 눌렀을 때 p 태그 또는 hr 태그 삽입
			if(event.keyCode === 13) { // keyCode 13: enter
				// DIV 내부에서 엔터를 눌렀을 경우 div 내부에서 br로 처리되므로 p 태그로 변경되도록 처리한다.
				if(selection.anchorNode.nodeName === "DIV") {
					setFormatBlock("p");
				}
				
				// 현재 포커스가 비어있는 p태그 내부에서 엔터를 눌렀을 경우 hr 태그로 변경되도록 처리한다.
				/*parentParagraph = getParent( // 현재노드 상위로 존재하는 p 태그 반환
					selection.anchorNode,
					// 조건
					function(node) {
						return node.nodeName.toLowerCase() === 'p';
					},
					// 조건에 따른 실행
					function(node) {
						return node;
					}
				);
				if(parentParagraph) { 
					prevSibling = parentParagraph.previousSibling; // 하나 전의 노드
					prevPrevSibling = prevSibling;
					while(prevPrevSibling) {
						if(prevPrevSibling.nodeType !== Node.TEXT_NODE) { // Node는 전역변수 window.Node (TEXT_NODE: 3)
							break;
						}
						prevPrevSibling = prevPrevSibling.previousSibling; // 하나 전의 노드
					}
					// hr 태그 삽입
					if(prevSibling.nodeName === "P" && prevPrevSibling.nodeName !== "HR" && !prevSibling.textContent.length*//*!prevSibling.nodeValue.length*//*) {
						hr = document.createElement("hr");
						hr.contentEditable = false;
						parentParagraph.parentNode.replaceChild(hr, prevSibling);
					}
				}*/
			}

			// -, *, 1. 입력에 따른 목록태그 변환
			// isCollapsed: 셀렉션의 시작지점과 끝지점이 동일한지의 여부
			// nodeValue: Text와 Comment 노드에서 실제 텍스트 문자열 추출
			/*if(selection.isCollapsed && selection.anchorNode.nodeValue && selection.anchorNode.parentNode.nodeName !== "LI") { 
				//console.log('selection.isCollapsed: ' + selection.isCollapsed);
				
				if(selection.anchorNode.nodeValue.match(/^[-*]\s/)) { 
					// "- 텍스트작성" 또는 "* 텍스트작성" 행태로 글을 작성했을 경우 목록태그로 변경
					document.execCommand('insertUnorderedList'); // ul 태그 생성
					selection.anchorNode.nodeValue = selection.anchorNode.nodeValue.substring(2);
					insertedNode = getParent( // 현재노드 상위로 존재하는 ul 태그 반환
						selection.anchorNode,
						// 조건
						function(node) {
							return node.nodeName.toLowerCase() === 'ul';
						},
						// 조건에 따른 실행
						function(node) {
							return node;
						}
					);
				}else if(selection.anchorNode.nodeValue.match(/^1\.\s/)) { 
					// "1. 텍스트작성" 형태로 글을 작성했을 경우 목록태그로 변경
					document.execCommand('insertOrderedList'); // ol 태그 생성
					selection.anchorNode.nodeValue = selection.anchorNode.nodeValue.substring(3);
					insertedNode = getParent( // 현재노드 상위로 존재하는 ol 태그 반환
						selection.anchorNode,
						// 조건
						function(node) {
							return node.nodeName.toLowerCase() === 'ol';
						},
						// 조건에 따른 실행
						function(node) {
							return node;
						}
					);
				}

				// ul 또는 ol 로 변경되었고, 현재 부모 태그가 p 또는 div 의 경우
				// p 또는 div 내부에 목록태그가 존재하지 않도록, 해당위치를 목록태그로 대체한다.
				unwrap = insertedNode && ["ul", "ol"].indexOf(insertedNode.nodeName.toLocaleLowerCase()) >= 0 && ["p", "div"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0;
				if(unwrap) {
					node = selection.anchorNode;
					parent = insertedNode.parentNode;
					parent.parentNode.insertBefore(insertedNode, parent);
					parent.parentNode.removeChild(parent);

					range = document.createRange();
					range.setStart(node, 0);
					range.setEnd(node, 0);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}*/
		}
	};
	var setContenteditableOn = function(nodes) {
		//var parameter = parameter || {};
		//var nodes = parameter['nodes']; // 에디터가 작동하게 될 대상 element 리스트

		// 에디터가 사용될 대상이 되는곳에 이벤트 설정
		var i, max;
		var setEvent = function(node) {
			// storage
			if(typeof node.storage !== 'object') {
				node.storage = {};
			}else if(node.storage['EVENT_MOUSEUP_editor'] || node.storage['EVENT_KEYDOWN_editor'] || node.storage['EVENT_KEYUP_editor']) {
				// 이벤트가 중복되지 않도록 이미 적용되어 있는지 확인한다.				
				return true;
			}

			// contentEditable
			//console.log(node);
			//console.log(node.contentEditable);
			//console.log(node.isContentEditable);
			if(!node.isContentEditable) {
				//continue;
				node.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
			}

			// 마우스 이벤트
			$(node).on(env.event.up + '.EVENT_MOUSEUP_editor', setTextSelection);
			/*node.addEventListener('mouseup', setTextSelection, false);
			node.storage['EVENT_MOUSEUP_editor'] = {
				"events": 'mouseup',
				"handlers": setTextSelection,
				"capture": false
			};*/
			
			// 키보드 이벤트
			$(node).on('keydown.EVENT_KEYDOWN_editor', setContenteditableKeydown);
			/*node.addEventListener('keydown', setContenteditableKeydown, false);
			node.storage['EVENT_KEYDOWN_editor'] = {
				"events": 'keydown',
				"handlers": setContenteditableKeydown,
				"capture": false
			};*/
			$(node).on('keyup.EVENT_KEYUP_editor', setContenteditableKeyup);
			/*node.addEventListener('keyup', setContenteditableKeyup, false);
			node.storage['EVENT_KEYUP_editor'] = {
				"events": 'keyup',
				"handlers": setContenteditableKeyup,
				"capture": false
			};*/
		};

		if(!nodes) {
			nodes = document.querySelectorAll('[contenteditable="true"]');
			if(!nodes.length) {
				return false;
			}
		}
		if(nodes.nodeType) {
			setEvent(nodes);
		}else {
			for(i=0, max=nodes.length; i<max; i++) {
				setEvent(nodes[i]);
			}
		}
		
		// document event
		/*$(document).on(env.event.up + '.EVENT_MOUSEUP_editor_document', function(event) {
			var event = event || window.event;
			//var target = event && (event.target || event.srcElement);
			// 툴팁내부 클릭된 것인지 확인
			if(!elements['text']['tooltip'].contains(event.target)) {
				console.log('document mouseup');
				setTimeout(function() {
					setTextSelection(event);
				}, 1);
			}
		});*/
		
		// 한글입력관련
		$(document).on('compositionstart.EVENT_COMPOSITIONSTART_editor', function() {
			composition = true;
		});
		//document.addEventListener('compositionstart', onCompositionStart);
		$(document).on('compositionend.EVENT_COMPOSITIONEND_editor', function() {
			composition = false;
		});
		//document.addEventListener('compositionend', onCompositionEnd);

	};
	var setContenteditableOff = function(nodes) {
		//var parameter = parameter || {};
		//var nodes = parameter['nodes']; // 에디터 작동을 중지시킬 대상 element 리스트
		if(!nodes || !nodes.length) {
			nodes = document.querySelectorAll('[contenteditable="true"]');
		}

		// 에디터가 사용된 대상의 이벤트 해제
		var i, max;
		var node;
		for(i=0, max=nodes.length; i<max; i++) {
			node = nodes[i];
			if(typeof node.storage !== 'object') {
				continue;
			}

			// 마우스 이벤트
			$(node).off('.EVENT_MOUSEUP_editor');
			/*node.removeEventListener(node['storage']['EVENT_MOUSEUP_editor']['events'], node['storage']['EVENT_MOUSEUP_editor']['handlers'], node['storage']['EVENT_MOUSEUP_editor']['capture']);
			delete node['storage']['EVENT_MOUSEUP_editor'];*/

			// 키보드 이벤트
			$(node).off('.EVENT_KEYDOWN_editor');
			/*node.removeEventListener(node['storage']['EVENT_KEYDOWN_editor']['events'], node['storage']['EVENT_KEYDOWN_editor']['handlers'], node['storage']['EVENT_KEYDOWN_editor']['capture']);
			delete node['storage']['EVENT_KEYDOWN_editor'];*/
			$(node).off('.EVENT_KEYUP_editor');
			/*node.removeEventListener(node['storage']['EVENT_KEYUP_editor']['events'], node['storage']['EVENT_KEYUP_editor']['handlers'], node['storage']['EVENT_KEYUP_editor']['capture']);
			delete node['storage']['EVENT_KEYUP_editor'];*/
		}

		// document event
		$(document).off('.EVENT_MOUSEUP_editor_document');

		// 한글입력관련
		$(document).off('.EVENT_COMPOSITIONSTART_editor');
		$(document).off('.EVENT_COMPOSITIONEND_editor');
	};

	// 에디터 button, input 등 생성 및 이벤트 설정
	var setCreateTooltipElement = function(parameter) {
		var parameter = parameter || {};
		var tag = parameter['tag']; // 생성할 tag name
		var editor = parameter['editor']; // 툴팁종류

		// element
		var element = document.createElement(tag);
		element['storage'] = {
			'editor': editor
		};

		// 중복생성여부 확인
		if(elements['text']['buttons'][editor]) {
			return element;
		}

		/*
		textContent 로 설정될 부분을 상단에 객체로 두는것은 어떨까?
		var button = {
			'bold': 'B',
			'italic': 'i',
			...
		};
		*/

		if(tag === 'button') {
			// element 
			elements['text']['buttons'][editor] = element;
			// style
			element.style.cssText = 'padding: 0px; width: 30px; height: 30px; font-size: 14px; color: rgb(20, 29, 37); background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
			// event
			element.onmousedown = setTooltipMousedown; 
			element.onmouseup = setTooltipMouseup;
		}

		switch(editor) {
			case 'bold':
				element.textContent = 'B';
				element.style.fontWeight = 'bold';
				break;
			case 'italic':
				element.textContent = 'I';
				element.style.fontStyle = 'italic';
				break;
			case 'strikethrough':
				element.textContent = 'S';
				element.style.textDecoration = 'line-through';
				break;
			case 'underline':
				element.textContent = 'U';
				element.style.textDecoration = 'underline';
				break;
			case "h1":
				element.textContent = 'H1';
				break;
			case "h2":
				element.textContent = 'H2';
				break;
			case "h3":
				element.textContent = 'H3';
				break;
			case "blockquote":
				element.textContent = '"';
				break;
			case 'createLink': // link
				element.textContent = '#';

				// option
				elements['text']['options']['link']['element'] = document.createElement("div"); // link option box
				elements['text']['options']['link']['link-input'] = document.createElement("input");
				elements['text']['options']['link']['element'].appendChild(elements['text']['options']['link']['link-input']);
				elements['text']['options']['element'].appendChild(elements['text']['options']['link']['element']);
				// style
				elements['text']['options']['link']['element'].style.cssText = 'display: none;';
				// event
				elements['text']['options']['link']['link-input'].onblur = setTooltipLinkBlur;
				elements['text']['options']['link']['link-input'].onkeydown = setTooltipLinkKeydown;
				break;
			case 'InsertImage':

				break;
		}

		return element;
	};

	// init
	(function init() {
		var fragment = document.createDocumentFragment();

		// document 에 에디터 툴바존재여부 확인 후 생성


		// 텍스트 툴바
		elements['text']['tooltip'] = document.createElement("div");
		elements['text']['tooltip'].style.cssText = 'transition: all .3s ease; position: absolute; top: ' + EDGE + 'px; left: ' + EDGE + 'px; color: rgb(20, 29, 37); background-color: rgba(255, 255, 255, 0.87);';
		elements['text']['buttons']['element'] = document.createElement("div");
		elements['text']['options']['element'] = document.createElement("div");
		elements['text']['tooltip'].appendChild(elements['text']['buttons']['element']);
		elements['text']['tooltip'].appendChild(elements['text']['options']['element']);
		fragment.appendChild(elements['text']['tooltip']);

		// 텍스트 에디터 버튼
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'h1'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'h2'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'h3'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'bold'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'italic'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'strikethrough'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'underline'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'blockquote'}));
		elements['text']['buttons']['element'].appendChild(setCreateTooltipElement({'tag': 'button', 'editor': 'createLink'}));

		/*
		// 이미지 툴바
		elements['image']['tooltip'] = document.createElement("div");
		elements['image']['buttons'] = document.createElement("div");
		elements['image']['options'] = document.createElement("div");
		elements['image']['tooltip'].appendChild(elements['image']['buttons']);
		elements['image']['tooltip'].appendChild(elements['image']['options']);
		fragment.appendChild(elements['image']['tooltip']);

		// 이미지 에디터 버튼
		*/

		/*
		// Set cursor position
		var range = document.createRange();
		var selection = window.getSelection();
		range.setStart(headerField, 1);
		selection.removeAllRanges();
		selection.addRange(range);
		*/

		// body 삽입
		document.body.appendChild(fragment);
	})();

	// public return
	return {
		on: setContenteditableOn,
		off: setContenteditableOff
	};

}, this);

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
				var duration = parameter['duration'];
				var translateX = parameter['translateX'];
				var target = parameter['target'];

				try {
					target.style.webkitTransitionDuration = target.style.MozTransitionDuration = target.style.msTransitionDuration = target.style.OTransitionDuration = target.style.transitionDuration = duration + 's';
					target.style.webkitTransform = 'translate(' + translateX + 'px, 0)' + 'translateZ(0)';
					target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translateX(' + translateX + 'px)';
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
			'total': 0, // 총 슬라이드 수
			'width': 0, // 슬라이드 width 값
			'target': null, // 슬라이드를 감싸고 있는 wrap
			'speed': 300, // 슬라이드 속도
			'touch': true, // 클릭 또는 터치 슬라이드 작동여부
			'auto': 0, // 자동 슬라이드 작동여부 (0 이상의 값이 입력되면 작동합니다.)
			'callback': null,
			'transitionend': null
		};
		that.settings = module.setSettings(that.settings, settings);
		that.translate = 0; // container 의 현재 translateX 값
		that.index = 1; // 현재 출력되고 있는 슬라이드 (1부터 시작)
		that.time = null; // 자동슬라이드 time key

		that.init();
		that.on();
		that.autoStart();
	};
	Flicking.prototype = {
		init: function() {
			var that = this;
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
			return that;
		},
		change: function(settings) {
			var that = this;
			return that;
		},
		on: function() {
			var that = this;

			// 이벤트 초기화
			that.off(); 
			
			if(that.settings.touch === true) {
				// down 이벤트
				$(that['settings']['target']).on(env['event']['down'] + '.EVENT_MOUSEDOWN_flicking', function(e) {
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

					// auto
					that.autoStop();
					
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
							module.setTranslate({'duration': 0, 'translateX': translate, 'target': that['settings']['target']});
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

						// auto
						that.autoStart();

						// init
						that.init();
					});
				});

				// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
				if(typeof that['settings']['transitionend'] === 'function') {
					$(that['settings']['target']).on(env['event']['transitionend'] + '.EVENT_TRANSITION_flicking', function(e) {
						var event = e || window.event;
						if(that['settings']['target'].isEqualNode(event.target)) {
							that['settings']['transitionend'].call(that['settings']['target'], that['index']);
						}
					});
				}
			}

			return that;
		},
		off: function() {
			var that = this;
			$(window).off('.EVENT_MOUSEMOVE_flicking');
			$(window).off('.EVENT_MOUSEUP_flicking');
			$(that['settings']['target']).off('.EVENT_MOUSEDOWN_flicking');
			$(that['settings']['target']).off('.EVENT_TRANSITION_flicking');
			return that;
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
			module.setTranslate({'duration': duration, 'translateX': that['translate'], 'target': that['settings']['target']});

			// callback
			if(typeof that['settings']['callback'] === 'function') {
				that['settings']['callback'].call(that['settings']['target'], that['index']);
			}

			// auto
			that.autoStart();

			return true;
		},
		autoStart: function() {
			var that = this;
			that.autoStop();
			if(that.settings.auto > 0) {
				that.time = window.setTimeout(function() {
					if(that['index'] < that['settings']['total']) {
						that.slide({'value': 'next'});
					}else {
						that.slide({'value': 1});
					}					
				}, that.settings.auto);
			}
		},
		autoStop: function() {
			var that = this;
			window.clearTimeout(that.time);
		}
	};

	// public return
	return {
		search: function(key) {
			return module.instance[key] || false;
		},
		setup: function(settings) {
			// 인스턴스 생성
			var instance;
			if(settings['key'] && this.search(settings['key'])) {
				//instance = module.instance[settings['key']];
				instance = this.search(settings['key']);
				instance.change(settings);
			}else {
				instance = new Flicking(settings);
				if(settings['key']) {
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
/*
Modal

@date (버전관리)
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE8 이상
querySelectorAll: Chrome 1, Firefox 3.5, Internet Explorer 8, Opera 10, Safari 3.2
RGBa: Internet Explorer 9

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
	global.api.modal = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	//
	var env = {};
	if(global.api && global.api.env) {
		env = global.api.env;
	}else {
		env = {
			'check': {
				'mobile': (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4))),
				'touch': ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
				'fullscreen': (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled)
			},
			'monitor': 'pc', // pc | mobile | tablet (해상도에 따라 설정가능) - check['mobile'] 가 있음에도 따로 구분한 이유는 기기기준과 해상도(모니터) 기준의 영역을 나누어 관리하기 위함
			'browser': {
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
			'event': {
				"down": "mousedown",
				"move": "mousemove",
				"up": "mouseup",
				"click": 'click'
			}
		};
		if(env['check']['touch'] === true) {
			env['event']['down'] = 'touchstart';
			env['event']['move'] = 'touchmove';
			env['event']['up'] = 'touchend';
			env['event']['click'] = (window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click';
		}
		(function() {
			var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
			var platform = navigator.platform;
			var nameOffset, verOffset;
			// monitor
			if(/android/i.test(userAgent)) { // 안드로이드
				// mobile 없으면 태블릿임
				if(/mobile/i.test(userAgent)) {
					env['monitor'] = 'mobile';
				}else {
					env['monitor'] = 'tablet';
				}
			}else if(/(iphone|ipad|ipod)/i.test(userAgent)) { // 애플
				if(/ipad/i.test(userAgent)) {
					env['monitor'] = 'tablet';
				}else {
					env['monitor'] = 'mobile';
				}
			}else if(env.check.mobile) {
				env['monitor'] = 'mobile';
			}else if(/(MacIntel|MacPPC)/i.test(platform)) {
				env['monitor'] = 'pc';
			}else if(/(win32|win64)/i.test(platform)) {
				env['monitor'] = 'pc';
			}
			// browser (if문 순서 중요함)
			env['browser']['name'] = navigator.appName;
			env['browser']['version'] = String(parseFloat(navigator.appVersion));
			if((verOffset = userAgent.indexOf("opr/")) !== -1) {
				env['browser']['name'] = "opera";
				env['browser']['version'] = userAgent.substring(verOffset + 4);
			}else if((verOffset = userAgent.indexOf("opera")) !== -1) {
				env['browser']['name'] = "opera";
				env['browser']['version'] = userAgent.substring(verOffset + 6);
				if((verOffset = userAgent.indexOf("version")) !== -1) {
					env['browser']['version'] = userAgent.substring(verOffset + 8);
				}
			}else if((verOffset = userAgent.indexOf("msie")) !== -1) {
				env['browser']['name'] = "explorer";
				env['browser']['version'] = userAgent.substring(verOffset + 5);
			}else if((verOffset = userAgent.indexOf("chrome")) !== -1) {
				env['browser']['name'] = "chrome";
				env['browser']['version'] = userAgent.substring(verOffset + 7);
			}else if((verOffset = userAgent.indexOf("safari")) !== -1) {
				env['browser']['name'] = "safari";
				env['browser']['version'] = userAgent.substring(verOffset + 7);
				if((verOffset = userAgent.indexOf("version")) !== -1) {
					env['browser']['version'] = userAgent.substring(verOffset + 8);
				}
			}else if((verOffset = userAgent.indexOf("firefox")) !== -1) {
				env['browser']['name'] = "firefox";
				env['browser']['version'] = userAgent.substring(verOffset + 8);
			}else if((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) { 
				env['browser']['name'] = userAgent.substring(nameOffset, verOffset);
				env['browser']['version'] = userAgent.substring(verOffset + 1);
				if(env['browser']['name'].toLowerCase() === env['browser']['name'].toUpperCase()) {
					env['browser']['name'] = navigator.appName;
				}
			}
			if((verOffset = env['browser']['version'].indexOf(';')) !== -1) {
				env['browser']['version'] = env['browser']['version'].substring(0, verOffset);
			}
			if((verOffset = env['browser']['version'].indexOf(' ')) !== -1) {
				env['browser']['version'] = env['browser']['version'].substring(0, verOffset);
			}
		})();
	}

	// key (일반적인 고유값)
	var getKey;
	if(global.api && global.api.key) {
		getKey = global.api.key;
	}else {
		getKey = function() {
			return ['api', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);
		};
	}

	// 모듈 (공통 사용)
	var module = (function() {
		function ModalModule() {
			var that = this;
			// 팝업 z-index 관리
			that.zindex = 200;
			// 현재 포커스 위치
			that.active;
			// key가 있는 인스턴스
			that.instance = {}; 
			//
			that.elements = {};
			//
			that.init();
		}
		ModalModule.prototype = {
			init: function() {
				var fragment;

				if(document.body && (!this.elements.container || typeof this.elements.container !== 'object' || !this.elements.container.nodeType)) {
					// fragment
					fragment = document.createDocumentFragment();
				
					// container
					this.elements.container = document.createElement('div');
					this.elements.container.style.cssText = 'z-index: 2147483647;'; // z-index 최대값: 2147483647
					fragment.appendChild(this.elements.container);

					// layer
					this.elements.layer = document.createElement('div');
					//this.elements.layer.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.layer);

					// confirm
					this.elements.confirm = document.createElement('div');
					//this.elements.confirm.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.confirm);

					// alert
					this.elements.alert = document.createElement('div');
					//this.elements.alert.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.alert);

					// push
					this.elements.push = document.createElement('div');
					//this.elements.push.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.push);

					// step
					this.elements.step = document.createElement('div');
					//this.elements.step.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.step);

					// folder
					this.elements.folder = document.createElement('div');
					//this.elements.folder.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.folder);

					// story
					this.elements.story = document.createElement('div');
					//this.elements.story.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.story);

					// market
					this.elements.market = document.createElement('div');
					//this.elements.market.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.market);

					try {
						//document.body.insertBefore(fragment, document.body.firstChild);
						document.body.appendChild(fragment);
					}catch(e) {}
				}
			},
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
			getWinDocWidthHeight: function() {
				return {
					'window': {
						"width": window.innerWidth || document.documentElement.clientWidth || 0,
						"height": window.innerHeight || document.documentElement.clientHeight || 0
					},
					'document': {
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
					}
				};
			},
			// 스크롤 위치
			getScroll: function() {
				if('pageXOffset' in window && 'pageYOffset' in window) {
					return {'left': window.pageXOffset, 'top': window.pageYOffset};
				}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
					return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
				}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
					return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
				}
			},
			// 위치설정
			setPosition: function(position, element) {
				// 위치 설정
				var width = 0;
				var height = 0;
				var size = {};
				var center = {'left': 0, 'top': 0};
				var tmp_height, tmp_top;
				var result = {
					'top': 0,
					'bottom': 0,
					'left': 0,
					'right': 0
				};

				if(typeof position === 'string') {
					// element 크기
					width = Math.round($(element).outerWidth(true));
					height = Math.round($(element).outerHeight(true));

					// center
					if(/center/ig.test(position)) {
						// window, document 
						size = this.getWinDocWidthHeight();

						// 계산
						if(size.window.width > width) {
							center['left'] = Math.round(size.window.width / 2) - Math.round(width / 2);
						}else {
							// 윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
							center['left'] = 0; 
						}
						if(size.window.height > height) {
							center['top'] = Math.round(size.window.height / 2) - Math.round(height / 2);
						}else {
							// 윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우
							center['top'] = 0; 
						}
						// top값 + div높이 > body(window) 전체 높이보다 클경우 (div가 페이지보다 더 아래로 내려가지 않도록함.)
						tmp_height = Math.max(size.window.height, size.document.height);
						tmp_top = Math.round(center['top'] + height);
						if(tmp_top > tmp_height) {
							center['top'] = center['top'] - Math.round(tmp_top - tmp_height);
						}
						// 위치값이 0보다 작지않도록 제어
						if(center['left'] < 0) {
							center['left'] = 0;
						}
						if(center['top'] < 0) {
							center['top'] = 0;
						}
					}
					// topleft, topcenter, topright
					// bottomleft, bottomcenter, bottomright
					// centerleft, center, centerright
					if(/^top/.test(position)) {
						$(element).get(0).style.top = '0px';
					}else if(/^bottom/.test(position)) {
						$(element).get(0).style.bottom = '0px';
					}else if(/^center/.test(position)) {
						$(element).get(0).style.top = center['top'] + 'px';
						result.top = center['top'];
					}
					if(/left$/.test(position)) {
						$(element).get(0).style.left = '0px';
					}else if(/right$/.test(position)) {
						$(element).get(0).style.right = '0px';
					}else if(/center$/.test(position)) {
						$(element).get(0).style.left = center['left'] + 'px';
						result.left = center['left'];
					}
				}else if(typeof position === 'object') { // 사용자 설정값
					if('left' in position) {
						$(element).get(0).style.left = position['left'] + 'px';
						result.left = position['left'];
					}else if('right' in position) {
						$(element).get(0).style.right = position['right'] + 'px';
						result.right = position['right'];
					}
					if('top' in position) {
						$(element).get(0).style.top = position['top'] + 'px';
						result.top = position['top'];
					}else if('bottom' in position) {
						$(element).get(0).style.bottom = position['bottom'] + 'px';
						result.bottom = position['bottom'];
					}
				}

				return result;
			},
			// 지정된 위치 기준점으로 modal 출력
			setRect: function(position, element, rect) {
				var width, height;
				var target = {};
				var info = rect.getBoundingClientRect();
				var scroll = this.getScroll();
				var tmp;

				// element 크기
				width = Math.round($(element).outerWidth(true));
				height = Math.round($(element).outerHeight(true));

				// target 정보
				target.left = info.left + (scroll.left || 0);
				target.top = info.top + (scroll.top || 0);
				target.width = Math.round($(rect).outerWidth(true));
				target.height = Math.round($(rect).outerHeight(true));


				// topleft, topcenter, topright 
				// centerleft, center, centerright 
				// bottomleft, bottomcenter, bottomright 
				/*if(/^top/.test(position)) {
					$(element).get(0).style.top = (target.top - height) + 'px';
				}else if(/^bottom/.test(position)) {
					$(element).get(0).style.top = (target.top + target.height) + 'px';
				}else if(/^center/.test(position)) {
					tmp = Math.round(Math.abs(height - target.height) / 2);
					if(height > target.height) {
						$(element).get(0).style.top = (target.top - tmp) + 'px';
					}else {
						$(element).get(0).style.top = (target.top + tmp) + 'px';
					}
				}
				if(/left$/.test(position)) {
					$(element).get(0).style.left = (target.left - width) + 'px';
				}else if(/right$/.test(position)) {
					$(element).get(0).style.left = (target.left + target.width) + 'px';
				}else if(/center$/.test(position)) {
					tmp = Math.round(Math.abs(width - target.width) / 2);
					if(width > target.width) {
						$(element).get(0).style.left = (target.left - tmp) + 'px';
					}else {
						$(element).get(0).style.left = (target.left + tmp) + 'px';
					}
				}*/

				
				// topleft, topcenter, topright
				// bottomleft, bottomcenter, bottomright
				// lefttop, leftmiddle, leftbottom
				// righttop, rightmiddle, rightbottom
				if(/^top/.test(position)) {
					$(element).get(0).style.top = (target.top - height) + 'px';
				}else if(/^bottom/.test(position)) {
					$(element).get(0).style.top = (target.top + target.height) + 'px';
				}else if(/^left/.test(position)) {
					$(element).get(0).style.left = (target.left - width) + 'px';
				}else if(/^right/.test(position)) {
					$(element).get(0).style.left = (target.left + target.width) + 'px';
				}

				if(/left$/.test(position)) {
					$(element).get(0).style.left = target.left + 'px';
				}else if(/center$/.test(position)) {
					tmp = Math.round(Math.abs(width - target.width) / 2);
					if(width > target.width) {
						$(element).get(0).style.left = (target.left - tmp) + 'px';
					}else {
						$(element).get(0).style.left = (target.left + tmp) + 'px';
					}
				}else if(/right$/.test(position)) {
					tmp = Math.round(Math.abs(width - target.width));
					if(width > target.width) {
						$(element).get(0).style.left = (target.left - tmp) + 'px';
					}else {
						$(element).get(0).style.left = (target.left + tmp) + 'px';
					}
				}else if(/top$/.test(position)) {
					$(element).get(0).style.top = target.top + 'px';
				}else if(/middle$/.test(position)) {
					tmp = Math.round(Math.abs(height - target.height) / 2);
					if(height > target.height) {
						$(element).get(0).style.top = (target.top - tmp) + 'px';
					}else {
						$(element).get(0).style.top = (target.top + tmp) + 'px';
					}
				}else if(/bottom$/.test(position)) {
					tmp = Math.round(Math.abs(height - target.height));
					if(height > target.height) {
						$(element).get(0).style.top = (target.top - tmp) + 'px';
					}else {
						$(element).get(0).style.top = (target.top + tmp) + 'px';
					}
				}
			}
		};
		return new ModalModule();
	})();

	// 레이어
	var ModalLayer = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'center',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'resize': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'target': '', // #id 또는 element
			'close': '' // .class
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.before = { // 값 변경전 기존 설정값 저장
			'margin-right': '',
			'overflow': '',
			'position': '',
			'width': '',
			'height': ''
		};
		that.time = null;
		that.isIOS = /(iphone|ipad|ipod)/i.test((navigator.userAgent || navigator.vendor || window.opera).toLowerCase());

		// private init
		module.init();
		(function() { 
			try {
				// target, contents
				that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
				that.elements.contents = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));
				that.elements.contents.style.position = 'absolute';

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
					that.elements.mask = that.settings.mask;
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(250, 251, 252) none repeat scroll 0 0; opacity: .96;';
					module.elements.layer.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch;';
				that.elements.container.appendChild(that.elements.contents);
				module.elements.layer.appendChild(that.elements.container);
				if(that.elements.contents.style.display === 'none') {
					that.elements.contents.style.display = 'block';
				}

				// iOS에서는 position: fixed 버그가 있음
				if(that.isIOS === true) {
					$(that.elements.mask).on(env['event']['down'] + '.EVENT_DOWN_' + that.settings.key, function(e) {
						var event = e || window.event;
						if(event.preventDefault) {
							event.preventDefault();
						}else {
							event.returnValue = false;
						}
						// 버블링 차단 (document, window 이벤트 전파 차단)
						if(event.stopPropagation) {
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
					});
					$(that.elements.mask).on(env['event']['move'] + '.EVENT_MOVE_' + that.settings.key, function(e) {
						var event = e || window.event;
						if(event.preventDefault) {
							event.preventDefault();
						}else {
							event.returnValue = false;
						}
						// 버블링 차단 (document, window 이벤트 전파 차단)
						if(event.stopPropagation) {
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
					});
					$(that.elements.mask).on(env['event']['up'] + '.EVENT_UP_' + that.settings.key, function(e) {
						var event = e || window.event;
						if(event.preventDefault) {
							event.preventDefault();
						}else {
							event.returnValue = false;
						}
						// 버블링 차단 (document, window 이벤트 전파 차단)
						if(event.stopPropagation) {
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
					});
				}
				
				// 팝업내부 close 버튼 클릭시 닫기
				if(that.settings.close) {
					$(that.elements.contents).find('.' + that.settings.close).on(env['event']['click'], function(event) {
						that.hide();
					});
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		})();
	};
	ModalLayer.prototype = {
		change: function(settings) {
			var that = this;
			return that;
		},
		position: function() {
			var that = this;
			var size, scroll;

			try {
				// iOS에서는 position: fixed 버그가 있음
				/*if(that.isIOS === true) {
					// 방법 1
					size = module.getWinDocWidthHeight();
					scroll = module.getScroll();
					that.elements.container.style.position = 'absolute';
					that.elements.container.style.left = scroll.left + 'px';
					that.elements.container.style.top = scroll.top + 'px';
					// 방법 2
					//that.elements.container.style.width = (Math.max(size.window.width, size.document.width) - env['browser']['scrollbar']) + 'px';
					//that.elements.container.style.height = (Math.max(size.window.height, size.document.height) - env['browser']['scrollbar']) + 'px';
					//that.elements.contents.style.left = (Number(String(that.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) + scroll.left) + 'px';
					//that.elements.contents.style.top = (Number(String(that.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) + scroll.top) + 'px';
				}*/
				module.setPosition(that.settings.position, that.elements.contents);
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var size = module.getWinDocWidthHeight();

			try {
				// 스크롤바 사이즈만큼 여백
				that.before['margin-right'] = $('html').css('margin-right'); // document.documentElement.style.marginRight
				that.before['overflow'] = $('html').css('overflow'); // document.documentElement.style.overflow
				if(size.window.height < size.document.height) {
					$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
				}

				// iOS에서는 position: fixed 버그가 있음
				that.before['position'] = $('html').css('position'); // document.documentElement.style.position
				if(that.isIOS === true) {
					$('html').css({'position': 'fixed'});
				}

				// element
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position(); // parent element 가 페인팅되어있지 않으면, child element 의 width, height 값을 구할 수 없다. (that.elements.contents 의 정확한 width, height 값을 알려면, 이를 감싸고 있는 that.elements.container 가 diplay block 상태에 있어야 한다.)

				// transition
				//that.elements.contents.style.transition = 'all .3s';

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// resize 이벤트 실행 (이벤트 키는 that.settings.key 를 활용한다.)
				$(window).on('resize.EVENT_RESIZE_' + that.settings.key, function(e) {
					window.clearTimeout(that.time);
					that.time = window.setTimeout(function(){ 
						that.position();
					}, 200);
				});

				// callback
				if(typeof that.settings.callback.show === 'function') {
					that.settings.callback.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': that.before['margin-right'], 'overflow': that.before['overflow'], 'position': that.before['position']});

				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// callback
				if(typeof that.settings.callback.hide === 'function') {
					that.settings.callback.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': that.before['margin-right'], 'overflow': that.before['overflow'], 'position': that.before['position']});

				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// callback
				if(typeof that.settings.callback.remove === 'function') {
					that.settings.callback.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		find: function(selector) {
			var that = this;

			try {
				return $(that.elements.container).find(selector);
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		}
	};

	// Rect
	var ModalRect = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'bottomcenter',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'target': '', // #id 또는 element (출력레이어 타겟)
			'rect': '' // #id 또는 element (위치기준 타켓)
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.time = null;

		// private init
		module.init();
		(function() { 
			try {
				// target, contents
				that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
				that.elements.contents = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));
				//that.elements.contents.style.position = 'relative';

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
					that.elements.mask = that.settings.mask;
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(250, 251, 252) none repeat scroll 0 0; opacity: .96;';
					document.body.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: absolute; display: none; left: 0; top: 0; outline: none; -webkit-overflow-scrolling: touch;';
				that.elements.container.appendChild(that.elements.contents);
				document.body.appendChild(that.elements.container);
				if(that.elements.contents.style.display === 'none') {
					that.elements.contents.style.display = 'block';
				}

				// rect (target 의 출력위치 기준점이 될 element)
				that.settings.rect = (typeof that.settings.rect === 'string' && /^[a-z]+/i.test(that.settings.rect) ? '#' + that.settings.rect : that.settings.rect);
				that.elements.rect = (typeof that.settings.rect === 'object' && that.settings.rect.nodeType ? that.settings.rect : $(that.settings.rect).get(0));
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		})();
	};
	ModalRect.prototype = {
		change: function(settings) {

		},
		position: function() {
			var that = this;

			try {
				module.setRect(that.settings.position, that.elements.container, that.elements.rect);
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// resize 이벤트 실행 (이벤트 키는 that.settings.key 를 활용한다.)
				$(window).on('resize.EVENT_RESIZE_' + that.settings.key, function(e) {
					window.clearTimeout(that.time);
					that.time = window.setTimeout(function(){ 
						that.position();
					}, 200);
				});

				// callback
				if(typeof that.settings.callback.show === 'function') {
					that.settings.callback.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// callback
				if(typeof that.settings.callback.hide === 'function') {
					that.settings.callback.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// callback
				if(typeof that.settings.callback.remove === 'function') {
					that.settings.callback.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		toggle: function() {
			var that = this;

			try {
				if(that.elements.container.style.display === 'none') {
					that.show();
				}else {
					that.hide();
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		}
	};

	// 확인
	var ModalConfirm = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'mask': true, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'ok': function() {
					return true;
				},
				'cancel': function() {
					return false;
				}
			},
			'theme:': {}, // 테마 (스타일 변경)
			'title': 'Message',
			'message': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		module.init();
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			try {
				// key
				key.title = getKey();
				key.message = getKey();
				key.cancel = getKey();
				key.ok = getKey();

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
					that.elements.mask = that.settings.mask;
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96;';
					module.elements.confirm.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid rgb(230, 231, 232); background-color: #FFF; border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none;';
				that.elements.container.innerHTML = '\
					<div id="' + key.title + '" style="padding: 18px 18px 10px 18px; font-weight: bold; color: #333; background-color: rgba(255, 255, 255, .96); border-radius: 7px 7px 0 0;">' + that.settings.title + '</div>\
					<div id="' + key.message + '" style="padding: 10px 18px 18px 18px; min-height: 67px; color: #333; background-color: rgba(255, 255, 255, .96);">' + that.settings.message + '</div>\
					<div style="padding: 10px 18px; background: rgba(250, 251, 252, .96); text-align: right; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
						<button id="' + key.cancel + '" style="margin: 0 0 0 10px; padding: 5px 10px; background-color: rgb(248, 249, 250); background: linear-gradient(#FFF, #F0F1F2); border: 1px solid #CCC; color: #AAACAD; font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; border-radius: 7px; vertical-align: middle; cursor: pointer;">CANCEL</button>\
						<button id="' + key.ok + '" style="margin: 0 0 0 10px; padding: 5px 10px; background-color: rgb(248, 249, 250); background: linear-gradient(#FFF, #F0F1F2); border: 1px solid #CCC; color: #AAACAD; font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; border-radius: 7px; vertical-align: middle; cursor: pointer;">OK</button>\
					</div>\
				';
				fragment.appendChild(that.elements.container);
				module.elements.confirm.appendChild(fragment);

				// search element
				that.elements.title = that.elements.container.querySelector('#' + key.title);
				that.elements.message = that.elements.container.querySelector('#' + key.message);
				that.elements.cancel = that.elements.container.querySelector('#' + key.cancel);
				that.elements.ok = that.elements.container.querySelector('#' + key.ok);

				// event
				$(that.elements.cancel).on(env['event']['click'], function() {
					that.hide();
					// callback
					if(typeof that.settings.callback.cancel === 'function') {
						return that.settings.callback.cancel.call(that);
					}
				});
				$(that.elements.ok).on(env['event']['click'], function() {
					that.hide();
					// callback
					if(typeof that.settings.callback.ok === 'function') {
						return that.settings.callback.ok.call(that);
					}
				});
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		})();
	};
	ModalConfirm.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'type':
						case 'key':
							break;
						case 'title':
							that.elements.title.textContent = settings[key] || '';
							break;
						case 'message':
							//that.elements.message.textContent = settings[key] || '';
							that.elements.message.innerHTML = settings[key] || '';
							break;
						case 'callback':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp) && typeof settings[key][tmp] === 'function') {
									that.settings.callback[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition(that.settings.position, that.elements.container);
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// callback
				if(typeof that.settings.callback.show === 'function') {
					that.settings.callback.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// callback
				if(typeof that.settings.callback.hide === 'function') {
					return that.settings.callback.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// callback
				if(typeof that.settings.callback.remove === 'function') {
					that.settings.callback.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		}
	};

	// 경고
	var ModalAlert = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'mask': true, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'title': 'Message',
			'message': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		
		// private init
		module.init();
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			try {
				// key
				key.title = getKey();
				key.message = getKey();
				key.ok = getKey();

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
					that.elements.mask = that.settings.mask;
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96;';
					module.elements.alert.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid rgb(230, 231, 232); background-color: #FFF; border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none;';
				that.elements.container.innerHTML = '\
					<div id="' + key.title + '" style="padding: 18px 18px 10px 18px; font-weight: bold; color: #333; background-color: rgba(255, 255, 255, .96); border-radius: 7px 7px 0 0;">' + that.settings.title + '</div>\
					<div id="' + key.message + '" style="padding: 10px 18px 18px 18px; min-height: 67px; color: #333; background-color: rgba(255, 255, 255, .96);">' + that.settings.message + '</div>\
					<div style="padding: 10px 18px; background: rgba(250, 251, 252, .96); text-align: right; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
						<button id="' + key.ok + '" style="margin: 0 0 0 10px; padding: 5px 10px; background-color: rgb(248, 249, 250); background: linear-gradient(#FFF, #F0F1F2); border: 1px solid #CCC; color: #AAACAD; font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; border-radius: 7px; vertical-align: middle; cursor: pointer;">OK</button>\
					</div>\
				';
				fragment.appendChild(that.elements.container);
				module.elements.alert.appendChild(fragment);

				// search element
				that.elements.title = that.elements.container.querySelector('#' + key.title);
				that.elements.message = that.elements.container.querySelector('#' + key.message);
				that.elements.ok = that.elements.container.querySelector('#' + key.ok);

				// event
				$(that.elements.ok).on(env['event']['click'], function() {
					that.hide();
				});
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		})();
	};
	ModalAlert.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'type':
						case 'key':
							break;
						case 'title':
							that.elements.title.textContent = settings[key] || '';
							break;
						case 'message':
							//that.elements.message.textContent = settings[key] || '';
							that.elements.message.innerHTML = settings[key] || '';
							break;
						case 'callback':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp) && typeof settings[key][tmp] === 'function') {
									that.settings.callback[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition(that.settings.position, that.elements.container);
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// callback
				if(typeof that.settings.callback.show === 'function') {
					that.settings.callback.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// callback
				if(typeof that.settings.callback.hide === 'function') {
					that.settings.callback.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// callback
				if(typeof that.settings.callback.remove === 'function') {
					that.settings.callback.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		}
	};

	// 푸시
	var ModalPush = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'topright',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'time': 0, // 0 보다 큰 값은 자동닫기 설정
			'message': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.time;

		// private init
		module.init();
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			try {
				// key
				key.message = getKey();
				key.close = getKey();

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
					that.elements.mask = that.settings.mask;
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96;';
					module.elements.push.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid rgb(230, 231, 232); background-color: #FFF; border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none;';
				that.elements.container.innerHTML = '\
					<div id="' + key.message + '" style="padding: 12px 12px 6px 12px; min-height: 33px; color: #333; background-color: rgba(255, 255, 255, .96); border-radius: 7px 7px 0 0;">' + that.settings.message + '</div>\
					<div style="padding: 6px 12px 12px 12px; background: rgba(250, 251, 252, .96); text-align: center; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
						<button id="' + key.close + '" style="margin: 0; padding: 0; color: #5F6061; font-size: 12px; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; cursor: pointer; background: transparent; border: none;">CLOSE</button>\
					</div>\
				';
				fragment.appendChild(that.elements.container);
				module.elements.push.appendChild(fragment);

				// search element
				that.elements.message = that.elements.container.querySelector('#' + key.message);
				that.elements.close = that.elements.container.querySelector('#' + key.close);

				// event
				$(that.elements.close).on(env['event']['click'], function() {
					that.hide();
				});
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		})();
	};
	ModalPush.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'type':
						case 'key':
							break;
						case 'time':
							that.settings.time = !isNaN(parseFloat(settings[key])) && settings[key] || 0;
							break;
						case 'message':
							//that.elements.message.textContent = settings[key] || '';
							that.elements.message.innerHTML = settings[key] || '';
							break;
						case 'callback':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp) && typeof settings[key][tmp] === 'function') {
									that.settings.callback[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition(that.settings.position, that.elements.container);
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position();

				// auto hide
				global.clearTimeout(that.time);
				if(typeof that.settings.time === 'number' && that.settings.time > 0) {
					that.time = global.setTimeout(function() {
						that.hide();
					}, that.settings.time);
				}

				// callback
				if(typeof that.settings.callback.show === 'function') {
					that.settings.callback.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// callback
				if(typeof that.settings.callback.hide === 'function') {
					return that.settings.callback.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// callback
				if(typeof that.settings.callback.remove === 'function') {
					that.settings.callback.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		}
	};

	// public return
	return {
		search: function(key) {
			return module.instance[key] || false;
		},
		setup: function(settings) {
			// 인스턴스 생성
			var instance;
			if(settings['key'] && this.search(settings['key'])) {
				//instance = module.instance[settings['key']];
				instance = this.search(settings['key']);
				if(instance.change) {
					instance.change(settings);
				}
			}else {				
				switch(settings['type']) {
					case 'layer':
						if(settings['key']) { // 중복생성 방지 key 검사
							instance = new ModalLayer(settings);
						}
						break;
					case 'rect':
						if(settings['key']) { // 중복생성 방지 key 검사
							instance = new ModalRect(settings);
						}
						break;
					case 'confirm':
						//settings['key'] = settings['key'] || getKey();
						instance = new ModalConfirm(settings);
						break;
					case 'alert':
						//settings['key'] = settings['key'] || getKey();
						instance = new ModalAlert(settings);
						break;
					case 'push':
						//settings['key'] = settings['key'] || getKey();
						instance = new ModalPush(settings);
						break;
				}
				if(settings['key']) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		show: function(key) { // 전체 또는 해당 key
			if(key) {
				this.search(key) && this.search(key).show();
			}else {
				for(key in module.instance) {
					if(module.instance.hasOwnProperty(key)) {
						module.instance[key].show();
					}
				}
			}
		},
		hide: function(key) { // 전체 또는 해당 key
			if(key) {
				this.search(key) && this.search(key).hide();
			}else {
				for(key in module.instance) {
					if(module.instance.hasOwnProperty(key)) {
						module.instance[key].hide();
					}
				}
			}	
		}
	};

}, this);

/*
web socket

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
https://developer.mozilla.org/ko/docs/Web/API/WebSocket

-
사용예
var socket = api.socket({
	'url': 'ws://www.makestory.net:3000',
	'callback': {
		'open': function() {
	
		},
		'message': function() {
	
		},
		'close': function() {
	
		},
		'error': function() {
	
		}
	}
});
socket.send(데이터);
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.socket = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	// url 중복 인스턴스 생성 방지
	var connect = {};
	return function(settings) {
		// 기존 연결 url 여부
		if(!settings.url) {
			return false;
		}else if(typeof connect[settings.url] === 'object') {
			//console.log('중복 instance');
			return connect[settings.url];
		}

		// private
		var socket;
		var queue = [];

		// public
		var APISocket = function(settings) {
			var that = this;
			var setSettings;

			// settings
			that.settings = {
				'url': '',
				'callback': {
					'open': null,
					'message': null,
					'close': null,
					'error': null
				}
			};
			setSettings = function setSettings(settings, options) {
				var key;
				for(key in options) {
					if(!options.hasOwnProperty(key)) {
						continue;
					}else if(options[key] && options[key].constructor === Object && !options[key].nodeType) {
						settings[key] = settings[key] || {};
						settings[key] = setSettings(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}
				return settings;
			};
			that.settings = setSettings(that.settings, settings);
			that.settings.url = /^ws:\/\//.test(that.settings.url) ? that.settings.url : 'ws://' + that.settings.url;
			
			// private
			socket = new WebSocket(that.settings.url);
			socket.onopen = function() { // readyState changes to OPEN
				that.send();
				if(typeof that.settings.callback.open === 'function') {
					that.settings.callback.open.call(that, Array.prototype.slice.call(arguments));
				}
			};
			socket.onmessage = function(event) { // 메시지가 도착할 시점
				if(typeof that.settings.callback.message === 'function') {
					that.settings.callback.message.call(that, event['data']);
				}
			};
			socket.onclose = function(event) { // readyState changes to CLOSED
				var code = event.code; // 연결이 종료되는 이유를 가리키는 숫자 값입니다. 지정되지 않을 경우 기본값은 1000으로 간주됩니다. (일반적인 경우의 "transaction complete" 종료를 나타내는 값).
				var reason = event.reason; // 연결이 왜 종료되는지를 사람이 읽을 수 있도록 나타내는 문자열입니다. 이 문자열은 UTF-8 포멧이며, 123 바이트를 넘을 수 없습니다.
				var wasClean = event.wasClean;
				if(typeof that.settings.callback.close === 'function') {
					that.settings.callback.close.call(that, Array.prototype.slice.call(arguments));
				}
			};
			socket.onerror = function() { // 에러
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, Array.prototype.slice.call(arguments));
				}
			};
		};
		APISocket.prototype = {
			send: function(data) { // 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
				var that = this;

				// send 데이터 추가
				if(data) {
					queue.push(data);
				}
				//console.log('bufferedAmount: ' + socket.bufferedAmount);

				// 실행
				/*
				-
				socket.readyState
				CONNECTING	0	연결이 수립되지 않은 상태입니다.
				OPEN	1	연결이 수립되어 데이터가 오고갈 수 있는 상태입니다.
				CLOSING	2	연결이 닫히는 중 입니다.
				CLOSED	3	연결이 종료되었거나, 연결에 실패한 경우입니다.
				*/
				switch(socket.readyState) {
					case 0: // 연결이 수립되지 않은 상태
					case 2: // 연결이 닫히는 중
					case 3: // 연결이 종료되었거나, 연결에 실패한 경우
						break;
					case 1: // 연결이 수립되어 데이터가 오고갈 수 있는 상태
						while(queue.length) {
							// 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
							socket.send(queue.shift()); // 서버로 메시지 전송
						}
						break;
				}

				return that;
			},
			close: function() {
				var that = this;

				if(typeof socket === 'object' && socket.readyState <= 1) {
					socket.close(); // 소켓종료
					delete connect[that.settings.url];
				}

				return that;
			}
		};

		// public return
		return connect[settings.url] = new APISocket(settings);
	};

}, this);
/*
State Handler (상태값에 따른 이벤트 실행)

@date (버전관리)
2016.05.02

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

-
사용예

*/

;(function(global, undefined) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	
	global.api.state = function(settings) {
		var settings = settings || {};
		
		return (function() {
			var storage = {}; // 상태값 저장
			var dictionary = { // 상태값 변경에 따른 이벤트 핸들러
				/*
				'ysm.a.b.c': [
					{
						'value': '콜백을 실행시킬 값', 
						'handler': {
							'이벤트 키' : '콜백실행 함수',
							...
						},
						...
					},
					...
				]
				*/
			}; 
			// namespace 해당하는 프로퍼티 (속도가 가장 빨라야하는 부분)
			var property = function(parameter) {
				var parameter = parameter || {};
				var name = parameter['name'] || '';
				var value = parameter['value'];
				var is = 'value' in parameter;

				var arr = [];
				var i, max;
				var parent = storage;

				// eval 사용 고려 (속도문제)
				
				
				// 프로퍼티 분리
				arr = name.split('.');

				// 네임스페이스 확인
				for(i=0, max=arr.length-1; i<max; i++) {
					if(typeof parent[arr[i]] === 'object') {
						parent = parent[arr[i]];
					}/*else if(is) { // set (값 설정모드)
						parent = parent[arr[i]] = {};
					}*/else {
						parent = parent[arr[i]] = {};
					}
				}

				// 마지막 프로퍼티값 확인 (네임스페이스의 마지막)
				if(is) { // set (값 설정모드)
					parent = parent[arr[i]] = value;
				}else if(arr[i] in parent) { // get (값 반환모드)
					if(parent[arr[i]] && typeof parent[arr[i]] === 'object' && (Array.isArray(parent[arr[i]]) || /^{.*}$/.test(JSON.stringify(parent[arr[i]])))) {
						// 값복사 
						// 오브젝트 타입을 반환할 때 사용자가 프로퍼티값을 수동으로 변경하지 못하도록 하기 위함. 
						// 수동으로 변경할 경우 콜백작동이 안함
						parent = JSON.parse(JSON.stringify(parent[arr[i]]));
					}else {
						parent = parent[arr[i]];
					}
				}else { // init (값 초기화)
					parent = parent[arr[i]] = undefined;
				}

				return parent;
			};
			
			return {
				// 값 반환
				get: function(name) {
					return property({'name': name});
				},
				// 값 설정
				set: function(parameter) {
					var parameter = parameter || {};
					var name = parameter['name'] || '';
					var value = parameter['value'];

					var i, max;
					var key;
					property({'name': name, 'value': value});

					// handler 실행
					if(dictionary[name]) {
						for(i=0, max=dictionary[name].length; i<max; i++) {
							if(dictionary[name][i]['value'] === value) {
								for(key in dictionary[name][i]['handler']) {
									dictionary[name][i]['handler'][key].call(this, value);
								}
								break;
							}
						}
					}
				},
				// 이벤트 설정
				on: function(parameter) {
					var parameter = parameter || {};
					var name = parameter['name']; // namespace
					var value = parameter['value']; // value
					var key = parameter['key'] || api.key(); // 이벤트키
					var handler = typeof parameter['handler'] === 'function' ? parameter['handler'] : function() {};

					var i, max;
					var is = false;
					var tmp;

					// handler 설정
					if(!dictionary[name]) {
						dictionary[name] = [];
					}
					for(i=0, max=dictionary[name].length; i<max; i++) { 
						// 기존 value 에 해당되는 콜백이 있는지 확인하여 설정
						if(dictionary[name][i]['value'] === value) {
							dictionary[name][i]['handler'][key] = handler;
							is = true;
							break;
						}
					}
					if(is === false) {
						// 기존 value에 해당하는 콜백이 하나도 없으면 새로 설정
						dictionary[name].push((function() {
							var tmp = {'value': value, 'handler': {}};
							tmp['handler'][key] = handler;
							return tmp;
						})());
					}
				},
				// 이벤트 해제
				off: function(parameter) {
					var parameter = parameter || {};
					var name = parameter['name'] || ''; // namespace
					var key = parameter['key']; // 이벤트키
					var i, max;
					var is = false;

					if(dictionary[name]) {
						if(key && dictionary[name] && key) {
							// 이벤트 키에 해당하는 콜백만 제거
							for(i=0, max=dictionary[name].length; i<max; i++) {
								if(key in dictionary[name][i]['handler']) {
									is = delete dictionary[name][i]['handler'][key];
									break;
								}
							}
						}else if(!key) {
							// 해당 콜백 전체 제거
							is = delete dictionary[name];
						}
					}

					return is;
				}
			};
		})();
	};

})(this);
/*
template

@date (버전관리)
2016.03.16

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility


-
사용예
<script id="template" type="text/template">
<p>Use the <strong>{{=power}}</strong>, {{=title}}!</p>

{{<people}}
	<p class="{{=test}}">{{=title}}</p>
	{{<deep}}
		<div>{{=ysm}}</div>
		{{<haha}}
			{{=ysm}}
		{{haha>}}
	{{deep>}}
{{people>}}
<p {{=event}}>ysm</p>
</script>

<script>
var paint = api.template.paint(document.getElementById('template').innerHTML, {
	'power': 'aa',
	'title': 'bb',
	'people': [
		{'test': 'ysm', 'title': 'cc', 'deep': {'ysm': 'aaa', 'haha': {'ysm': '유성민'}}},
		{'title': 'cc', 'deep': {'ysm': 'bbb', 'haha': false}}
	]
});
document.getElementById('target').innerHTML = paint;
</script>

-
참고
http://handlebarsjs.com/
https://mustache.github.io/mustache.5.html

-
템플릿 파일 (TMPL 파일)

*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.template = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	// debug
	if(!global.debug) {
		global.debug = {
			'log': function(name, value) {
				if(typeof value === 'undefined') {
					console.log('----------【 ' + name + ' 】');
				}else {
					console.log('----------【 ' + name);
					console.log(value);
					console.log('---------- 】');
				}
			},
			'dir': function(name, value) {
				if(typeof value === 'undefined') {
					console.log('----------【');
					console.dir(name);
					console.log('---------- 】');
				}else {
					console.log('----------【 ' + name);
					console.dir(value);
					console.log('---------- 】');
				}
			}
		};
	}

	// 특수문자 앞에 '\' 삽입 (정규식에 대응하기 위함)
	var escapeRegExp = function(string) {
		return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	};
	
	// 정규식
	var regexp = {
		'tag': {
			'open': new RegExp(escapeRegExp('{{') + "\\s*"), // {{
			'close': new RegExp("\\s*" + escapeRegExp('}}')) // }}
		},
		'type': {
			'variable': new RegExp('^[=|\\s*=|=\\s*](\\S+)'), // =tag
			'context_open': new RegExp('^[<|\\s*<|<\\s*](\\S+)'), // <tag
			'context_close': new RegExp('(\\S+)[>|\\s*>|>\\s*]$') // tag>
		}
	};


	// 1. 파싱 - template 에서 html code와 {{tag}} code 분리
	var Parse = function Parse(template, context, parent) {
		this.template = template || '';
		this.context = context || 'global';
		this.parent = parent || null;
		this.tree = [];

		var match_tag;
		var match_tag_open, match_tag_close;
		var match_tag_name;
		var match_close;
		var tag; // {{tag}}
		var code; // 일반 html code
		while(this.template !== '') {

			//debug.log('template', this.template);
			
			// {{tag}} 검색
			/*match_tag = this.template.match(new RegExp(escapeRegExp('{{') + '(\\S+)' + escapeRegExp('}}')));
			//debug.dir('match_tag', match_tag);
			if(!match_tag) {
				tag = '';
				code = this.template;
				this.template = '';
			}else {
				tag = match_tag[1]; // {{tag}}
				code = this.template.substring(0, match_tag.index);
				this.template = this.template.substring(match_tag[0].length + match_tag.index);
			}*/
			match_tag_open = this.template.match(regexp.tag.open); // {{ 시작부분 검색
			match_tag_close = this.template.match(regexp.tag.close); // }} 종료부분 검색
			if(!match_tag_open) {
				tag = '';
				code = this.template;
				this.template = '';
			}else {
				tag = '';
				code = this.template.substring(0, match_tag_open.index);
				if(!match_tag_close) {
					this.template = this.template.substring(match_tag_open.index + match_tag_open[0].length);	
				}else {
					tag = this.template.substring(match_tag_open.index + match_tag_open[0].length, match_tag_close.index); // {{tag}}
					// tag 내부에 {{ 열기 부분이 존재하는지 확인 (닫기 전에 열기가 발생한 것)


					// 
					this.template = this.template.substring(match_tag_close.index + match_tag_close[0].length);
				}
			}
			
			//debug.dir('match_tag_open', match_tag_open);
			//debug.dir('match_tag_close', match_tag_close);
			//debug.log('tag', tag);
			//debug.log('code', code);
			//debug.log('this.template', this.template);

			// code
			this.tree.push({'type': 'code', 'value': code}); // html 등의 tag

			// tag
			if(regexp.type.variable.test(tag)) { // =tag
				// =tag 에서 tag에 해당하는 부분 추출 (변수명)
				match_tag_name = tag.match(regexp.type.variable);
				if(match_tag_name) {
					this.tree.push({'type': 'variable', 'value': match_tag_name[1]}); // 변수 (json 데이터에서 변수명에 해당하는 값을 바인딩)
				}
			}else if(regexp.type.context_open.test(tag)) { // <tag
				// <tag 에서 tag에 해당하는 부분 추출 (컨텍스트명)
				match_tag_name = tag.match(regexp.type.context_open); 
				if(match_tag_name) {
					// tag> 찾기 (<tag와 같은 name, 컨텍스트가 끝나는 부분)
					match_close = this.template.match(new RegExp(escapeRegExp('{{') + match_tag_name[1] + '[>|\\s*>|>\\s*]' + escapeRegExp('}}')));
					if(match_close) {
						// {{<tag}} ... {{tag>}}  사이의 텍스트로 새로운 컨텍스트(파싱)생성
						this.tree.push({'type': 'context', 'value': new Parse(this.template.substring(0, match_close.index), match_tag_name[1], this)}); // 컨텍스트 (해당 컨텍스트 파싱)
						this.template = this.template.substring(match_close[0].length + match_close.index);
					}
				}
			}
		}
	};



	// 2. 렌더 - 파서단계에서 분리된 {{tag}}에 값 적용
	var render = function render(parse, contents) {
		/*
		value 에 해당 context 의 영역을 준다
		global 은 {'key': 'value'} 의 전체값
		하위로 들어갈때, 해당하는 key의 값을 value 파라미터로 넘긴다.
		*/

		var tree = parse.tree || []; // 파싱된 트리
		var contents = contents || {}; // 변수에 할당(파싱된 트리에 contents값 설정)할 json 데이터
		var tokens = [];
		var i, max;

		//debug.dir('tree', tree);
		//debug.dir('contents', contents);

		var j, max2;
		var value;
		var result;
		for(i=0, max=tree.length; i<max; i++) {
			// type이 code가 아닌 것을 code로 변환하여 tokens에 넣는다.
			if('type' in tree[i] && 'value' in tree[i]) {
				switch(tree[i].type) {
					case 'variable': // 변수
						value = contents[tree[i].value];
						//debug.log('variable value', value);
						if(!value) {
							continue;
						}else if(typeof value === 'function') { // function type
							tokens.push({'type': 'code', 'value': value.call(contents)}); 
						}else if(Array.isArray(value)) { // array type
							for(j=0, max2=value.length; j<max2; j++) {
								tokens.push({'type': 'code', 'value': value[j]});
							}
						}else { // true || 기타값
							tokens.push({'type': 'code', 'value': contents[tree[i].value]});
						}
						break;

					case 'context': // 하위 실행컨텍스트
						value = contents[tree[i].value.context];
						//debug.log('context value', value);
						if(!value) {
							continue;
						}else if(typeof value === 'function') { // json 값이 function type
							result = render(tree[i].value, value.call(contents));
							tokens = tokens.concat(result);
						}else if(Array.isArray(value)) { // json 값이 array type
							for(j=0, max2=value.length; j<max2; j++) {
								result = render(tree[i].value, value[j]);
								tokens = tokens.concat(result);
							}
						}else if(typeof value === 'object') { // json 값이 object type (json 형식)
							result = render(tree[i].value, value);
							tokens = tokens.concat(result);
						}else { // json 값이 boolen type
							result = render(tree[i].value, value);
							tokens = tokens.concat(result);
						}
						break;

					default: // code
						tokens.push(tree[i]);
						break;
				}
			}
		}

		return tokens;
	};



	// 3. 프린팅 - html 반환
	var paint = function paint(render) {
		var i, max;
		var codes = [];
		for(i=0, max=render.length; i<max; i++) {
			if(render[i]['type'] === 'code') {
				codes.push(render[i]['value']);
			}
		}

		return codes.join('');
	};


	
	//
	var Template = function() {
		this.cache = {}; // 메모이제이션
	};
	Template.prototype = {
		'parse': function(template) {
			var parse = this.cache[template]; // 기존 파싱되었던 템플릿인지 확인
			if(!parse) { 
				parse = new Parse(template);
			}
			//debug.dir('this.cache[template]', this.cache[template]);
			return parse;
		},
		'render': function(template, contents) { // 사용성이 별로 없지만, 흐름확인을 위해 public 
			var parse = this.parse(template);
			return render(parse, contents);
		},
		'paint': function(template, contents) {
			var render = this.render(template, contents);
			return paint(render);
		},
		'fragment': function(template, contents) { // fragment 에 html 삽입 후 반환
			var paint = this.paint(template, contents);
			var fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
			if(paint) {
				/*
				var temp = document.createElement('template'); // IE 미지원
				temp.innerHTML = paint;
				fragment.appendChild(temp.content);
				*/
				var temp = document.createElement('div');
				var child;
				temp.innerHTML = paint;
				while(child = temp.firstChild) { // temp.firstElementChild 는 제약이 있음 (textnode 제외)
					fragment.appendChild(child);
				}
			}
			return fragment;
		}
	};
	
	// public return
	return new Template();

}, this);
/*
Utility

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

*/

;(function(global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.util = {
		// 상속 - Object.create() 효과
		inherit: function(C, P) { 
			/*
			원칙적으로 재사용할 멤버는 this가 아니라 프로토타입에 추가되어야 한다.
			따라서 상속되어야 하는 모든 것들도 프로토타입 안에 존재해야 한다.
			그렇다면 부모의 프로토타입을 똑같이 자식의 프로토타입으로 지정하기만 하면 될 것이다.

			프로토타입 체인의 이점은 유지하면서, 동일한 프로토타입을 공유할 때의 문제를 해결하기 위해
			부모와 자식의 프로토타입 사이에 직접적인 링크를 끊는다.
			빈 함수 F()가 부모와 자식 사이에서 프록시(proxy) 기능을 맡는다.
			F()의 prototype 프로퍼티는 부모의 프로토타입을 가리킨다. 이 빈 함수의 인스턴스가 자식의 프로토타입이 된다.

			부모 생성자에서 this에 추가된 멤버는 상속되지 않는다. (재사용한다는 prototype 의미를 정확히 사용)
			*/
			var F = function() {};
			F.prototype = P.prototype;
			C.prototype = new F();
			/*
			부모 원본에 대한 참조를 추가할 수도 있다.
			다른 언어에서 상위 클래스에 대한 접근 경로를 가지는 것과 같은 기능으로,
			경우에 따라 매우 편리하게 쓸 수 있다.
			*/
			C.uber = P.prototype; // 상위 클래스 접근경로
			/*
			constructor 프로퍼티는 자주 사용되진 않지만 런타임 객체 판별에 유용하다.
			거의 정보성으로만 사용되는 프로퍼티이기 때문에, 원하는 생성자 함수를 가리키도록 재설정해도 기능에는
			영향을 미치지 않는다.
			*/
			C.prototype.constructor = C; // 생성자 재설정 (런타임시 객체 판별)
		},
		// deep copy
		// http://davidwalsh.name/javascript-clone
		clone: function clone(src, deep) { // src: target, deep: true|false
			if(!src && typeof src !== "object") {
				// any non-object ( Boolean, String, Number ), null, undefined, NaN
				return src;
			}

			var toString = Object.prototype.toString;

			// Honor native/custom clone methods
			if(src.clone && toString.call(src.clone) == "[object Function]") {
				return src.clone(deep);
			}

			// DOM Elements
			if(src.nodeType && toString.call(src.cloneNode) == "[object Function]") {
				return src.cloneNode(deep);
			}

			// Date
			if(toString.call(src) == "[object Date]") {
				return new Date(src.getTime());
			}

			// RegExp
			if(toString.call(src) == "[object RegExp]") {
				return new RegExp(src);
			}

			// Function
			if(toString.call(src) == "[object Function]") {
				return (function() {
					src.apply(this, arguments);
				});
			}

			var ret = null;
			var index = 0;
			if(toString.call(src) == "[object Array]") { // Array
				// [].slice(0) would soft clone
				ret = src.slice();
				if(deep) {
					index = ret.length;
					while(index--) {
						ret[index] = clone(ret[index], true);
					}
				}
			}else { // Object
				ret = src.constructor ? new src.constructor() : {};
				for(var prop in src) {
					ret[prop] = deep ? clone(src[prop], true) : src[prop];
				}
			}

			return ret;
		},
		// json deep copy
		jsonDeepCopy: function(original, copy) {
			// json object 를 string 으로 바꾸고, string 을 다시 object로 변경하는 방법을 사용한다.
			if(typeof original === 'object' && typeof copy === 'object') {
				return original = JSON.parse(JSON.stringify(copy)); 
			}else {
				return original;
			}
		},
		// json 데이터 여부
		isJSON: function(value) {
			return value && typeof value === 'object' && (/*Array.isArray(value)*/Object.prototype.toString.call(value) === "[object Array]" || /^{.*}$/.test(JSON.stringify(value)));
		},
		// 반응형 계산
		sizePercent: function(t, c) {
			//공식 : target / content = result
			//예제 : 60(구하고자하는 크기) / 320(기준) = 0.1875 -> 18.75%
			//예제 : 10 / 320 = 0.03125 -> 3.125
			var target = Number(t);
			//var content = c || api.env.grid.width;
			var content = Number(c);
			var result = (target / content) * 100;

			return result; 
		},
		/*
		-
		IE는 캡쳐를 지원하지 않기 때문에 addEventListener 는 버블링으로 설정하여 사용하는 것이 좋음 
		
		-
		캡쳐 : 이벤트가 발생 대상까지 전달되는 단계(아래로)
		 > 설명1 : 이벤트가 다른 이벤트로 전파되기 전에 폼 전송과 같은 이벤트를 취소 (기본 동작을 중지한다)
		 > 설명2 : 처리를 완료하기 전에 이벤트(기본 또는 다른이벤트)를 취고하고 싶을 때
		
		버블링 : 발생 대상에서 document, window 까지 전달되는 단계(위로)
		 > 설명1 : 내부에 다른 요소를 포함한 어떤 요소(<div><div></div></div>)가 있습니다. 두요소 모두 클릭 이벤트를 캡쳐합니다. 안쪽요소에서 발생한 클릭 이벤트가 바깥쪽 요소로 전파되는 것을 막음
		 > 설명2 : 이벤트를 취소하고 싶지는 않지만 전파하는 것을 막을 때
		
		-
		stopImmediatePropagation: 현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작하지 않도록 중단한다.
		
		-
		사용자가 발생한(설정한) 현재 element 이벤트의 상위 element 이벤트를 중지시키는냐, 
		브라우저 기본 이벤트를 중지하느냐의 차이
			<a href="http://test.com">
				<div id="div">
					<img src="" id="img" />
				</div>
			</a>
			document.getElementById('div').onclick = function() { alert('div'); };
			document.getElementById('img').onclick = function() { alert('img'); };

		 	> 일반적인 이벤트(img를 클릭했을 경우): img -> div -> a 순서로 이벤트 발생
		 	> stopPropagation 사용: img 를 클릭했을 경우 div 이벤트를 막을 수 있다. 그러나 a 이벤트는 중지되지 않으며 href에 따른 페이지 이동이 발생한다.
		 	> preventDefault 사용: a 기본 이벤트인 href 의 이동을 중지 시킨다.
		 */
		stopCapture: function(event) {
			var event = event || window.event;
			if(event.preventDefault) { // 현재 이벤트의 기본 동작을 중단한다.
				event.preventDefault();
			}else {
				event.returnValue = false;
			}
		},
		stopBubbling: function(event) {
			var event = event || window.event;
			if(event.stopPropagation) { // 현재 이벤트가 상위로 전파되지 않도록 중단한다.
				event.stopPropagation();
			}else {
				event.cancelBubble = true;
			}
		},
		// 캡쳐단계, 버블링단계 동시 실행
		stopEventDelivery: function(event) { 
			this.stopCapture(event || window.event);
			this.stopBubbling(event || window.event);
		},
		// setTimeout (한번 실행)
		startCall: function(callback, seconds) { 
			if(typeof callback !== 'function') return false;
			var seconds = seconds || 3000; //1000 -> 1초
			// 시간 작동
			var time = window.setTimeout(callback, seconds);
			return time;
		},
		// clearTimeout
		closeCall: function(time) {
			if(!time || time == null) return false;
			// 시간 중지
			window.clearTimeout(time);
		},
		// setInterval (반복 실행)
		startTime: function(callback, seconds) { 
			if(typeof callback !== 'function') return false;
			var seconds = seconds || 3000; //1000 -> 1초
			// 시간 작동
			var time = window.setInterval(callback, seconds);
			return time;
		},
		// clearInterval
		closeTime: function(time) {
			if(!time || time == null) return false;
			// 시간 중지
			window.clearInterval(time);
		},
		/*
		// type 체크
		// https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		type({a: 4}); //"object"
		type([1, 2, 3]); //"array"
		(function() {console.log(type(arguments))})(); //arguments
		type(new ReferenceError); //"error"
		type(new Date); //"date"
		type(/a-z/); //"regexp"
		type(Math); //"math"
		type(JSON); //"json"
		type(new Number(4)); //"number"
		type(new String("abc")); //"string"
		type(new Boolean(true)); //"boolean"
		*/
		type: function(value) {
			return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
		},
		// 좌우 공백 제거 
		trim: function(text) {
			if(!text) {
				return text;
			}else {
				return String(text).replace(/(^\s*)|(\s*$)/g, "");
			}
		},
		// html 제거
		stripTags: function(html) {
			/*
			// HTML 태그 제거 (사용법은 php 의 strip_tags 와 동일)
			var strip_tags = function(input, allowed) {
				allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
				var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
				var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
				return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
					return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
				});
			};
			*/
			if(html && typeof html === 'string') {
				return html.replace(/(<([^>]+)>)/ig,"");
			}else {
				return html;
			}
		},
		// 키보드 이벤트 정보 
		keyboardCode: function(event) {
			var event = event || window.event;
			var code = event.which || event.keyCode;
			var key;
			switch(code) {
				//0
				case 48:
				case 96:
					key = '0';
					break;
				//1
				case 49:
				case 97:
					key = '1';
					break;
				//2
				case 50:
				case 98:
					key = '2';
					break;
				//3
				case 51:
				case 99:
					key = '3';
					break;
				//4
				case 52:
				case 100:
					key = '4';
					break;
				//5
				case 53:
				case 101:
					key = '5';
					break;
				//6
				case 54:
				case 102:
					key = '6';
					break;
				//7
				case 55:
				case 103:
					key = '7';
					break;
				//8
				case 56:
				case 104:
					key = '8';
					break;
				//9
				case 57:
				case 105:
					key = '9';
					break;
				//backspace
				case 8:
					key = 'backspace';
					break;
				//+
				case 107:
					key = '+';
					break;
				//-
				case 109:
					key = '-';
					break;
				//*
				case 106:
					key = '*';
					break;
				// /
				case 111:
				case 191:
					key = '/';
					break;
				//.
				case 110:
				case 190:
					key = '.';
					break;
				//tab
				case 9:
					key = 'tab';
					break;	
				//end
				case 35:
					key = 'end';
					break;
				//end
				case 36:
					key = 'home';
					break;
				//esc
				case 27:
					key = 'esc';
					break;
				//delete
				case 46:
					key = 'delete';
					break;
				//enter
				case 13:
					key = 'enter';
					break;
				//left
				case 37:
					key = 'left';
					break;
				//up
				case 38:
					key = 'up';
					break;
				//right
				case 39: 
					key = 'right';
					break;
				//down
				case 40: 
					key = 'down';
					break;
			}

			if(key) {
				return {"code": code, "key": key};
			}else {
				return false;
			}
		},
		// 대기 - 예: sleep(10000);
		sleep: function(milliSeconds) {
			var startTime = new Date().getTime(); // get the current time   
			while(new Date().getTime() < startTime + milliSeconds); // hog cpu 
		},
		// value 앞에 count 수만큼 add를 채운다
		// 사용예: '0'. '3', 2 => '03' 
		leftFormatString: function(add, value, count) {
			var value = String(value);
			var result = '';
			var i;
			for(i=value.length; i<count; i++){
				result = result + add;
			}
			return result + value;
		},
		// 글자 Byte 수 출력
		stringByteLength: function(value) {
			var bytes = 0;
			if(typeof value === 'string') {
				bytes = value.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length;
			}
			return bytes;
		},
		// fragment 에 html 삽입 후 반환
		fragmentHtml: function(html) {
			// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
			/*if(!("firstElementChild" in document.documentElement)){
				Object.defineProperty(Element.prototype, "firstElementChild", {
					get: function(){
						for(var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i)
							if(n = nodes[i], 1 === n.nodeType) return n;
						return null;
					}
				});
			}*/

			var fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
			/*
			var temp = document.createElement('template'); // IE 미지원
			temp.innerHTML = html;
			fragment.appendChild(temp.content);
			*/
			var temp = document.createElement('div');
			var child;
			temp.innerHTML = html;
			while(child = temp.firstChild) { // temp.firstElementChild (textnode 제외)
				fragment.appendChild(child);
			}

			return fragment;
		},
		// window popup
		windowPopup: function(url, name, width, height, features) {
			/*
			//features
			- menubar : 메뉴바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- toolbar : 도구막대를 보여주거나 숨긴다. (옵션 : yes/no, 1/0) 
			- directories : 디렉토리바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- scrollbars : 스크롤바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- status : 상태표시줄을 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- location : 주소표시줄을 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
			- width : 팝업 윈도우의 가로크기를 지정한다. (옵션 : 픽셀) 
			- height : 팝업 윈도우의 높이를 지정한다. (옵션 : 픽셀)
			- left : 팝업 윈도우의 x축 위치를 지정한다. (옵션 : 픽셀)
			- top : 팝업 윈도우의 y축 위치를 지정한다. (옵션 : 픽셀)
			- resizable : 팝업윈도우의 크기를 사용자가 임의로 수정할 수 있는지 여부를 지정한다. (옵션 : yes/no, 1/0)
			- fullscreen : 전체화면 모드로 열어준다.
			- channelmode : 채널모드 창으로 열어준다.
			 */
			var win;
			var name = name || 'popup';
			var width = width || 400;
			var height = height || 600;
			//var features = features || '';
			if(typeof features === 'undefined') {
				win = window.open(url, name, 'width=' + width + ', height=' + height + ', menubar=no, status=no, location=no');
			}else {	
				win = window.open(url, name, 'width=' + width + ', height=' + height + ',' + features);
			}
			if(win !== null) {
				win.focus();
			}
		},
		//팝업차단확인
		isWindowPopup: function() {
			var win = window.open('', 'isWindowPopup', 'width=1, height=1, left=-10, top=-10, scrollbars=yes, resizable=yes');
		    var is = true;
			if(win == null || typeof win === "undefined" || (!win && win.outerWidth === 0) || (win && win.outerHeight === 0) || (win && win.innerWidth === 0))  {
				alert("팝업 차단 기능이 설정되어있습니다\n차단 기능을 해제(팝업허용)한 후 이용해 주세요.");
				is = false;
			}
			if(win) { 
				win.close();
			}
			return is;
		},
		// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
		requestAnimationFrame: (function() { 
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000 / 60); /* 60 FPS (1 / 0.06) */ };
		})(),
		cancelAnimationFrame: (function() {
			return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(time) { return window.clearTimeout(time); };
		})(),

		// ---------- ---------- ---------- ---------- ---------- ---------- 
		// 숫자

		// 단위 분리
		numberUnit: function(value) { 
			// [1]: 숫자값
			// [2]: 단위
			return /^([0-9]+)(\D+)$/i.exec(value);
		},
		// 숫자여부 확인
		isNumeric: function(value) {
			// /^[+-]?([\d]+)?[\.]?([\d]+)?$/.test(value); // 음수, 양수, 소수점 가능 (keyup 이벤트로 체크가능)
			return !isNaN(parseFloat(value)) && isFinite(value);
		},
		// 숫자만 추출
		numberReturn: function(value) { 
			//return Number(String(value).replace(/,/g, '').replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 음의 실수 포함
			return String(value).replace(/,/g, '').replace(/[^+-\.\d]/g, '');
		},
		// 금액
		numberFormat: function(value) { 
			var value = String(value);
			var reg = /(^[+-]?\d+)(\d{3})/;
			while(reg.test(value)) {
				value = value.replace(reg, '$1' + ',' + '$2');  
			}
			return value;
		},
		// 소수점 단위 금액
		floatFormat: function(value) {
			var value = String(value);
			var orgnum = value;
			var arrayOfStrings = [];
			
			if(value.length > 3) {
				value = value + ".";
			}
			arrayOfStrings = value.split('.');
			value = '' + arrayOfStrings[0];
			
			if(value.length > 3) {
				var mod = value.length % 3;
				var output = (mod > 0 ? (value.substring(0, mod)) : '');
				for(var i=0; i<Math.floor(value.length / 3); i++) {
					if((mod == 0) && (i == 0)) {
						output += value.substring(mod + 3 * i, mod + 3 * i + 3);
					}else{
						output += ',' + value.substring(mod + 3 * i, mod + 3 * i + 3);
					}
				}
				
				if(orgnum.indexOf(".") > -1) {
					output += '.' + arrayOfStrings[1];
				}
				return (output);
			}else{
				return orgnum;
			}
		},
		// 콤마 제거
		removeComma: function(value) {
			var value = String(value);
			var result = '';
			var substr = '';
			var i, max;
			for(i=0, max=value.length; i<max; i++) {
				substr = value.substring(i, i+1);
				if(substr !== ',') { 
					result += substr; 
				}
			}
			return result;
		},
		// 지정자리 반올림 (값, 자릿수)
		round: function(n, pos) {
			var digits = Math.pow(10, pos);
			var sign = 1;
			if(n < 0) {
				sign = -1;
			}
			// 음수이면 양수처리후 반올림 한 후 다시 음수처리
			n = n * sign;
			var num = Math.round(n * digits) / digits;
			num = num * sign;
			return num.toFixed(pos); // toFixed: string 타입 반환
		},
		// 지정자리 버림 (값, 자릿수) - 양수만 가능
		floor: function(n, pos) {
			var digits = Math.pow(10, pos);
			var num = Math.floor(n * digits) / digits;
			return num.toFixed(pos); // toFixed: string 타입 반환
		},
		// 지정자리 올림 (값, 자릿수)
		ceiling: function(n, pos) {
			var digits = Math.pow(10, pos);
			var num = Math.ceil(n * digits) / digits;
			return num.toFixed(pos); // toFixed: string 타입 반환
		},

		// ---------- ---------- ---------- ---------- ---------- ----------
		// 날짜 

		// 몇일째 되는날
		/*
		사용예: (year, month, day 분리 입력 또는 new Date 인스턴스값 입력)
		getDateSpecificInterval({'year': year, 'month': month, 'day': day}, 10); // +10일
		getDateSpecificInterval({'instance': tmp}, -19); // -19일
		*/
		dateSpecificInterval: function(date, interval) {
			var instance, interval;
			if(date.instance) { //{'instance': 값}
				instance = date.instance;
			}else if(date.year && date.month && date.day) { //{'year': 값, 'month': 값, 'day': 값}
				instance = new Date(parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day));
			}else {
				return false;
			}
			interval = Number(interval);
			return new Date(Date.parse(instance) + interval * 1000 * 60 * 60 * 24);
		},
		// 날짜차이
		dateBetween: function(start, end) { // start: 2015-10-27, end: 2015-12-27
			if(!start || !end || start.indexOf('-') <= 0 || end.indexOf('-') <= 0) {
				return false;
			}
			var start_arr = start.split("-");
			var end_arr = end.split("-"); 
			var start_obj = new Date(start_arr[0], Number(start_arr[1])-1, start_arr[2]);
			var end_obj = new Date(end_arr[0], Number(end_arr[1])-1, end_arr[2]);

			var years = end_obj.getFullYear() - start_obj.getFullYear();
			var months = end_obj.getMonth() - start_obj.getMonth();
			var days = end_obj.getDate() - start_obj.getDate();

			var result = {};
			result['day'] = (end_obj.getTime()-start_obj.getTime())/(1000*60*60*24);
			result['month'] = (years * 12 + months + (days >= 0 ? 0 : -1)),
			result['year'] = Math.floor(result['month'] / 12);  
			
			return result;
		},
		// 해당 년월의 마지막 날짜
		lastday: function(year, month) {
			var arr = [31,28,31,30,31,30,31,31,30,31,30,31];
			if((year %4 == 0 && year % 100 !== 0) || year % 400 == 0) {
				arr[1] = 29;
			}
			return arr[month-1];
		}

		// ---------- ---------- ---------- ---------- ---------- ---------- ---------- 
	};

})(this);

/*
유효성검사

@date (버전관리)
2016.02.22

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
all

-
사용예

*/

;(function(global, undefined) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}

	// 좌우 공백 제거 
	var trim = function(text) {
		return String(text).replace(/(^\s*)|(\s*$)/g, "");
	};

	// element
	var getElement = function(element, index) {
		if((jQuery && element instanceof jQuery) || (api && api.dom && element instanceof api.dom)) {
			return index === -1 ? element.get() : element.get(index || 0); // jQuery 대응 
		}else {
			return element;
		}
	};

	// element value 값
	var getValue = function(element) {
		if(typeof element === 'object') {
			element = getElement(element);
			return trim(element.value);
		}else if(typeof element === 'string' || typeof element === 'number') {
			return trim(element);
		}
	};

	global.api.validate = {
		// text
		isText : function(value) {
			var value = getValue(value);
			return typeof value === 'string' && value.length > 0;
		},
		// number
		isNumber : function(value) {
			var pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
			var value = getValue(value);
			return (typeof value === 'number' || typeof value === 'string') && pattern.test(value);
		},
		// data
		isDate : function(value) {
			var pattern = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// e-mail
		isEmail : function(value) {
			var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// url 
		isUrl : function(value) {
			var pattern = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// 글자 포함여부
		isEqualTo : function(value, string) {
			var value = getValue(value);
			return this.isText(value) && this.isText(string) && value.indexOf(string) !== -1; //value에 string문자가 포함되었는지 검사
		},
		// 최소글자
		isMinlength : function(value, number) {
			var value = getValue(value);
			return this.isText(value) && (typeof number === 'number' || typeof number === 'string') && value.replace(/<br>|\s/g, "").length >= parseInt(number);
		},
		// 최대글자
		isMaxlength : function(value, number) {
			var value = getValue(value);
			return this.isText(value) && (typeof number === 'number' || typeof number === 'string') && value.replace(/<br>|\s/g, "").length <= parseInt(number);
		},
		// 최소값
		isMin : function(value, number) {
			var value = getValue(value);
			if(this.isNumber(value) && this.isNumber(number)) {
				return value >= number;
			}
			return false;
		},
		// 최대값
		isMax : function(value, number) {
			var value = getValue(value);
			if(this.isNumber(value) && this.isNumber(number)) {
				return value <= number;
			}
			return false;
		},
		// 전화번호
		isPhone : function(value) {
			var pattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// extension(확장자)
		isExtension : function(value, extension) {
			var extension = extension || 'jpg,jpeg,gif,png,pdf,hwp,exl'; //관리자 지정 확장자
			var value = getValue(value);
			value = value.substr(value.lastIndexOf(".") + 1).toLowerCase(); //첨부된 확장자
			return this.isText(value) && extension.indexOf(value) !== -1;
		},
		// select
		isSelect: function(element) {
			element = getElement(element);
			if(typeof element === 'object' && element.options) {
				return this.isText(element.options[element.selectedIndex].value);
			}else {
				return this.isText(element);
			}
		},
		// check
		isCheck: function(element) {
			var is = false;
			var i = 0;
			element = getElement(element, -1);
			if(typeof element === 'object') {
				while(!is && i < element.length) {
			    	if(element[i].checked && this.isText(element[i])) {
			        	is = true;
			        }
			        i++;
				}
				return is;
			}else {
				return this.isText(element);
			}
		}
	};

})(this);
/*
worker

@date (버전관리)
2016.06.28

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API/basic_usage

-
사용예

*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.worker = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	return function(settings) {
		// private
		var worker;
		var order = 0; // worker 요청 순번 

		// public
		var APIWorker = function(settings) {
			var that = this;
			var setSettings;

			// settings
			that.settings = {
				'url': '',
				'callback': {
					'message': null,
					'error': null
				}
			};
			setSettings = function setSettings(settings, options) {
				var key;
				for(key in options) {
					if(!options.hasOwnProperty(key)) {
						continue;
					}else if(options[key] && options[key].constructor === Object && !options[key].nodeType) {
						settings[key] = settings[key] || {};
						settings[key] = setSettings(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}
				return settings;
			};
			that.settings = setSettings(that.settings, settings);

			//
			worker = new Worker(that.settings.url);
			worker.onmessage = function(event) { // 응답
				if(typeof that.settings.callback.message === 'function') {
					that.settings.callback.message.call(this, event['data'] || {});
				}
			};
			worker.onerror = function(event) { // 에러
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(this, event);
				}
			};
		};
		APIWorker.prototype = {
			send: function(data) { 
				var that = this;

				// 메시지 전송
				worker.postMessage({'order': ++order, 'data': data}); // JSON 혹은 기타 직렬화된 데이터를 전달할 수 있다.

				return that;
			},
			close: function() {
				var that = this;

				// 즉시 종료
				worker.terminate();

				return that;
			}
		};

		// public return
		return new APIWorker(settings);
	};

}, this);
/*
xhr (XMLHttpRequest level 2)

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility


-
사용예 (파일전송)
var from = new FormData(api.dom('#form').get(0));
api.xhr({
	'type': 'POST', 
	'url': './action.php', 
	'async': true, 
	'data': from // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
});
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || !('XMLHttpRequest' in global)) {
		return false;
	}else if(!global.api) {
		global.api = {};
	}
	global.api.xhr = factory(global);

})(function(global, undefined) { 

	'use strict'; // ES5

	var xhr = function(parameter) {
		var parameter = parameter || {}; // 사용자 설정값
		var settings = { // 기본 설정값
			'contentType': 'application/x-www-form-urlencoded',
			'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
			'url': '', // 요청할 URL 주소
			'async': true, // 동기/비동기 방식

			//'file': {}, // xhr 전송할 파일 리스트
			'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
			'context': global, // 콜백함수 내부에서 this 키워드로 사용할 객체
			'dataType': 'text', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text, jsonp)

			'progressUpload': undefined, // 업로드 진행률 콜백 함수
			'progressDownload': undefined, // 다운로드 진행률 콜백 함수
			'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
			'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
			'success': undefined // 요청이 성공했을 때 실행할 콜백 함수
		};
		var match, callback, pattern, script;
		var instance, arr = [], name, data;
		var key;

		// 사용자 설정값
		for(key in settings) {
			if(settings.hasOwnProperty(key)) {
				settings[key] = parameter[key];
			}
		}

		// 유효성 검사
		if(/[^get|post|put|delete]/i.test(settings.type)) { // HTTP 타입 (get|post|put|delete|options|head|trace|connect)
			return false;
		}
		if(typeof settings.url !== 'string' || settings.url.replace(/\s/g, '') === '' /*|| !/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/.test(settings.url)*/) { // url
			return false;
		}
		if(typeof settings.async !== 'boolean') { // 동기/비동기 
			return false;
		}

		// data 처리
		if(global.FormData && typeof settings.data === 'object' && settings.data instanceof FormData) { // FormData
			data = settings.data;
			settings.contentType = null;
		}else {
			if(typeof settings.data === 'string' && settings.data !== '') {
				settings.data.replace(/([^=&]+)=([^&]*)/g, function(m, name, value) {
					arr.push(name + '=' + value);
				});
			}else if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) {
				for(name in settings.data) {
					if(settings.data.hasOwnProperty(name)) {
						arr.push(name + '=' + settings.data[name]);
					}
				}
			}
			data = arr.join('&');
		}
		if(settings.type.toLowerCase() === 'get') {
			settings.url += settings.url.lastIndexOf('?') > -1 ? '&' + data : '?' + data;
			settings.contentType = null;
		}

		//
		if(typeof settings.dataType === 'string' && settings.dataType.toLowerCase() === 'jsonp') {
			// 1.
			// JSONP
			/*
			XMLHttpRequest level2 사용하여 CORS(Cross Origin Resource Sharing) 가능하나
			서버측 header 설정부분(Access-Control-Allow-Credentials 응답 헤더를 true로 설정, PHP예: header("Access-Control-Allow-Origin: http://foo.example");)도 있어 
			일단 아래와 같이 우회방법을 사용한다. (http://wit.nts-corp.com/2014/04/22/1400)
			*/

			// callback 값 검출
			match = settings.url.match(/[?&]callback=([^&]*)?/);
			callback = match ? match[1] : 'YSM_' + Math.round(10000 * Math.random());
			window[callback] = function(data) {
				settings.success.call(settings.context, data);
			};

			// url 조립
			pattern = new RegExp('\\b(callback=).*?(&|$)');
			if(0 <= settings.url.search(pattern)) {
				settings.url = settings.url.replace(pattern, '$1' + callback + '$2');
			}else {
				settings.url = settings.url + (settings.url.indexOf('?') > 0 ? '&' : '?') + 'callback=' + callback;
			}

			// script load 실행
			script = window.document.createElement('script');
			script.src = settings.url;
			document.getElementsByTagName('head')[0].appendChild(script);
			script.onload = script.onreadystatechange = function () {
				if(!script.readyState || /loaded|complete/.test(script.readyState)) {
					// Handle memory leak in IE
					script.onload = script.onreadystatechange = null;

					// Remove the script
					//delete window[callback];
					//this.remove();
					if(script.parentNode) {
						script.parentNode.removeChild(script);
					}
				}
			};
		}else {
			// 2.
			// AJAX
			/*
			CORS를 사용하기 위해서 클라이언트와 서버는 몇 가지 추가 정보를 주고 받아야 한다. 
			클라이언트는 CORS 요청을 위해 새로운 HTTP 헤더를 추가한다. 
			서버는 클라이언트가 전송한 헤더를 확인해서 요청을 허용할지 말지를 결정한다. 
			데이터에 사이드 이펙트를 일으킬 수 있는 HTTP 메소드를 사용할 때는 먼저 preflight 요청을 서버로 전송해서 
			서버가 허용하는 메소드 목록을 HTTP OPTIONS 헤더로 획득한 다음에 실제 요청을 전송한다.			
			*/
			
			// XMLHttpRequest 인스턴스
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
			/*if(global.XDomainRequest) { // IE8, IE9
				instance = new XDomainRequest();
			}else if(global.XMLHttpRequest) { // IE10부터 사용가능
				instance = new XMLHttpRequest();
				if(typeof instance.withCredentials === 'undefined') {
					return false;
				}
			}*/
			instance = new XMLHttpRequest();
			if(typeof instance.withCredentials === 'undefined') {
				return false;
			}

			// 요청
			instance.open(settings.type, settings.url, settings.async);
			instance.setRequestHeader('Accept', '*/*');
			instance.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // X-Requested-With 헤더는, 해당 요청이 Ajax라는 걸 의미 (비표준)
			if(settings.contentType) {
				/*
				// POST 요청의 경우에는 서버로 전송하는 Content-Type이 application/x-www-form-urlencoded, multipart/form-data, text/plain 중에 하나여야 한다.
				instance.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
				instance.setRequestHeader('Content-Type', 'multipart/form-data');
				instance.setRequestHeader('Content-Type', 'text/plain');
				instance.setRequestHeader('X-PINGOTHER', 'pingpong'); // CORS

				// retrieve data unprocessed as a binary string
				instance.overrideMimeType('text/plain; charset=x-user-defined'); // IE작동안함
				*/
				instance.setRequestHeader('Content-Type', settings.contentType);
			}
			
			// dataType
			// responseType XMLHttpRequest 레벨2 에서 중요함: http://www.html5rocks.com/en/tutorials/file/xhr2/?redirect_from_locale=ko 
			if(settings.dataType) {
				//instance.responseType = "arraybuffer";
				//instance.responseType = 'text'; // 파이어폭스 파이어버그에서 응답이 null 로 출력될 경우, responseType 을 text로 해야 responseText 로 정상 출력된다. (이는 XMLHttpRequest 레벨 2 지원문제)
				instance.responseType = settings.dataType; // arraybuffer || blob || document(xml) || json || text
			}

			//instance.onloadstart
			//instance.onabort
			//instance.ontimeout
			//instance.onloadend

			// 업로드와 다운로드 진행율을 계산하는 콜백 함수를 단계적 응답 이벤트에 설정
			instance.upload.onprogress = function(event) {
				var total = event.total || 0;
				var loaded = event.loaded || 0;
				if(total && loaded && typeof settings.progressUpload === 'function') {
					//console.log((loaded / total) + '% uploaded');
					settings.progressUpload.call(settings.context, Number((100 / total) * loaded).toFixed(2));
				}
			};
			instance.onprogress = function(event) {
				var total = event.total || 0;
				var loaded = event.loaded || 0;
				if(total && loaded && typeof settings.progressDownload === 'function') {
					//console.log((loaded / total) + '% downloaded');
					settings.progressDownload.call(settings.context, Number((100 / total) * loaded).toFixed(2));
				}
			};
			// 받는중
			instance.onreadystatechange = function() {
				switch(instance.readyState) {
					case 0: // 객체만 생성되고 아직 초기화되지 않은 상태(open 메소드가 호출되지 않음)
						if(typeof settings.beforeSend === 'function') {
							settings.beforeSend.call(settings.context);
						}
						break;
					case 1: // open 메소드가 호출되고 아직 send 메소드가 불리지 않은 상태
					case 2: // send 메소드가 불렸지만 status와 헤더는 도착하지 않은 상태
						// 연결 진행
						break;
					case 3: // 데이터의 일부를 받은 상태
						if(typeof settings.complete === 'function') {
							settings.complete.call(settings.context);
						}
						break;
					case 4: // 데이터를 전부 받은 상태
						if(instance.status !== 200) {
							// 403(접근거부), 404(페이지없음), 500(서버오류발생)
						}
						break;
				}
			};
			// 완료
			instance.onload = function(event) { 
				//console.dir(this);
				//console.dir(instance);
				//this.getResponseHeader("Last-Modified")
				//this.getResponseHeader("Content-Type")
				if(instance.status == 200) {
					var data = instance.response || instance.responseText || instance.responseXML; // XMLHttpRequest Level 2
					if(!instance.responseType && settings.dataType.toLowerCase() === 'json') {
						data = JSON.parse(data);
					}
					if(typeof settings.success === 'function') {
						settings.success.call(settings.context, data);
					}
				}
			};
			// 에러
			instance.onerror = function(event) {
				console.log('error');
				console.log(event);
			};

			// 전송
			instance.send(data || null);
		}
	};
	
	// public return
	return xhr;

}, this);
