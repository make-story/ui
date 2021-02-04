/*
jQuery 플러그인 - 브라우저 정보

@date (버전관리)
2017.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
*/

;(function(global, $) {

	'use strict'; // ES5

	// 클라이언트 브라우저 환경
	var agent = (global.navigator.userAgent || global.navigator.vendor || global.opera).toLowerCase();
	var div = document.createElement('div');
 	var environment = { 
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
		"monitor": '', // pc | mobile | tablet (해상도에 따라 설정가능) - check['mobile'] 가 있음에도 따로 구분한 이유는 기기기준과 해상도(모니터) 기준의 영역을 나누어 관리하기 위함
		"screen": { // browser 사이즈가 아닌 해상도 값
			"width": global.screen.availWidth/*Windows Taskbar 제외*/ || global.screen.width || Math.round(global.innerWidth), 
			"height": global.screen.availHeight/*Windows Taskbar 제외*/ || global.screen.height || Math.round(global.innerHeight)
		},
		"browser": {
			"name": '', // chrome | safari | opera | firefox | explorer (브라우저 구분)
			"version": '',
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
				// 마우스휠 스크롤 코드 참고
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
		}/*,
		"css": {
			"prefix": '', // 벤더 프리픽스
			"transform": ''
		}*/
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
	(function() {
		var platform = global.navigator.platform;

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
	})();

	// browser 
	(function() {
		var app_name = global.navigator.appName;
		var app_version = global.navigator.appVersion;
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
	$.env = environment;

})(this, jQuery);