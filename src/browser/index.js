/**
 * 브라우저 정보
 */
/*
-
브라우저의 Viewport
> 문서의 viewport 크기
document.documentElement.clientWidth / clientHeight
> 브라우저 viewport 의 스크롤 포함 크기
window.innerWidth / innerHeight
> 브라우저 창 크기
window.outerWidth / outerHeight

> 문서의 크기
document.documentElement.offsetWidth / offsetHeight
> 브라우저 화면을 확대하거나, 축소할 경우 viewport 크기 변화
document.documentElement.clientWidth 와 window.innerWidth 의 값은 변화

> 스크린 크기
screen.width 와 screen.height

> css 의 vw 와 vh 는 viewport weigth 와 viewport heigth 으로 css unit 중 하나
https://www.sitepoint.com/css-viewport-units-quick-start/

> 모바일 브라우저에는 Layout viewport 와 Virsual viewport 2개의 뷰포트가 존재
Layout viewport 는 고정된 화면으로 사용자의 액션에 영향을 받지 않는다.
Virsual viewport 는 유동적인 화면으로 사용자의 액션에 영향을 받는다.
https://bokand.github.io/viewport/index.html
https://www.quirksmode.org/mobile/viewports2.html
*/
// 모듈 조합
export * from './history';
export * from './location';
export * from './storage';
export * from './history';
export { default as browserLocation } from './location';
export { default as browserStorage } from './storage';

// window, document, browser 사이즈
export const windowDocumentSize = () => {
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
		},
		'browser': {
			"width": window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
			"height": window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight
		}
	};
}

// 스크롤 위치
export const browserScroll = () => {
	if('pageXOffset' in window && 'pageYOffset' in window) {
		return {
			'left': window.pageXOffset, 
			'top': window.pageYOffset
		};
	}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
		return {
			'left': document.body.scrollLeft, 
			'top': document.body.scrollTop
		};
	}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
		return {
			'left': document.documentElement.scrollLeft, 
			'top': document.documentElement.scrollTop
		};
	}else {
		return {
			'left': 0, 
			'top': 0
		};
	}
}

const div = document.createElement('div');
const agent = (window.navigator.userAgent || window.navigator.vendor || window.opera || "").toLowerCase();
const browser = {
	"name": "", // chrome | safari | opera | firefox | explorer (브라우저 구분)
	"version": "",
	"scrollbar": (function() { // 브라우저별 스크롤바 폭 (모바일브라우저 주의)
		var div = document.createElement("div");
		var scrollbar = 0;
		div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.documentElement.appendChild(div);
		scrollbar = div.offsetWidth - div.clientWidth;
		document.documentElement.removeChild(div);
		return scrollbar;
	})(),
	//"zindex": 100, // z-index 최대값: 2147483647 (대부분 브라우저 32 비트 값 -2147483648 ~ +2147483647으로 제한)
	"is": { // true, false
		"mobile": (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4))),
		"touch": ('ontouchstart' in window || window.navigator.MaxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0 || !!(window.DocumentTouch && window.document instanceof DocumentTouch)),
		//"orientationchange": 'onorientationchange' in window, // 모바일기기 회전
		"transform": false,
		"transform3d": false, // 3d 지원할 경우 translateZ
		"transition": false/*('transition' in div.style || 'WebkitTransition' in div.style || 'MozTransition' in div.style || 'OTransition' in div.style || 'msTransition' in div.style)*/,
		"animation": false/*('animationName' in div.style || 'WebkitAnimationName' in div.style || 'MozAnimationName' in div.style || 'OAnimationName' in div.style || 'msAnimationName' in div.style || 'KhtmlAnimationName' in div.style)*/,
		"fullscreen": (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled),
		"passive": (function() { // 크롬 기본이벤트 관련 
			var passiveSupported = false;
			var options;

			try {
				options = Object.defineProperty({}, "passive", {
					get: function() {
						passiveSupported = true;
					}
				});
				window.addEventListener("test", options, options);
				window.removeEventListener("test", options, options);
			}catch(err) {
				passiveSupported = false;
			}

			return passiveSupported;
		})(),
		"network": window.navigator.onLine,
	},
	"os": { // android | ios | mac | window
		"name": "",
	},
	"monitor": "", // pc | mobile | tablet (해상도에 따라 설정가능) - is.mobile 가 있음에도 따로 구분한 이유는 기기기준과 해상도(모니터) 기준의 영역을 나누어 관리하기 위함
	"screen": { // browser 사이즈가 아닌 해상도 값
		"width": window.screen.availWidth/*Windows Taskbar 제외*/ || window.screen.width || Math.round(window.innerWidth),
		"height": window.screen.availHeight/*Windows Taskbar 제외*/ || window.screen.height || Math.round(window.innerHeight),
	},
	// https://developer.mozilla.org/en-US/docs/Web/Events
	"event": {
		// 마우스 또는 터치
		"down": "mousedown",
		"move": "mousemove",
		"up": "mouseup",
		//"click": ('ontouchstart' in window) ? 'touchstart' : (window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click', // touchstart 를 사용할 경우 click 이벤트보다 먼저 작동하여, 예상과 다른 실행순서가 발생할 수 있다.
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
		"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
		// 트랜지션
		"transitionstart": "transitionstart",
		"transitionend": "transitionend",
		"transitionrun": "transitionrun",
		"transitioncancel": "transitioncancel",
		// 애니메이션
		"animationstart": "animationstart",
		"animationiteration": "animationiteration",
		"animationend": "animationend",
		// 풀스크린 
		"requestFullscreen": "requestFullscreen",
		"exitFullscreen": "exitFullscreen",
		"fullscreenElement": "fullscreenElement",
	},
	/*"css": {
		"prefix": "", // 벤더 프리픽스
		"transform": "",
		"transform3d": ""
	},*/
};

// browser
(function() {
	const app_name = window.navigator.appName;
	const app_version = window.navigator.appVersion;
	let offset_name, offset_version;

	// if문 순서 중요함
	browser.name = app_name;
	browser.version = String(parseFloat(app_version));
	if((offset_version = agent.indexOf("opr/")) !== -1) {
		browser.name = "opera";
		browser.version = agent.substring(offset_version + 4);
	}else if((offset_version = agent.indexOf("opera")) !== -1) {
		browser.name = "opera";
		browser.version = agent.substring(offset_version + 6);
		if((offset_version = agent.indexOf("version")) !== -1) {
			browser.version = agent.substring(offset_version + 8);
		}
	}else if((offset_version = agent.indexOf("msie")) !== -1) {
		browser.name = "explorer";
		browser.version = agent.substring(offset_version + 5);
	}else if((offset_version = agent.indexOf("chrome")) !== -1) {
		browser.name = "chrome";
		browser.version = agent.substring(offset_version + 7);
	}else if((offset_version = agent.indexOf("safari")) !== -1) {
		browser.name = "safari";
		browser.version = agent.substring(offset_version + 7);
		if((offset_version = agent.indexOf("version")) !== -1) {
			browser.version = agent.substring(offset_version + 8);
		}
	}else if((offset_version = agent.indexOf("firefox")) !== -1) {
		browser.name = "firefox";
		browser.version = agent.substring(offset_version + 8);
	}else if((offset_name = agent.lastIndexOf(' ') + 1) < (offset_version = agent.lastIndexOf('/'))) {
		browser.name = agent.substring(offset_name, offset_version);
		browser.version = agent.substring(offset_version + 1);
		if(browser.name.toLowerCase() === browser.name.toUpperCase()) {
			browser.name = app_name;
		}
	}

	if((offset_version = browser.version.indexOf(';')) !== -1) {
		browser.version = browser.version.substring(0, offset_version);
	}
	if((offset_version = browser.version.indexOf(' ')) !== -1) {
		browser.version = browser.version.substring(0, offset_version);
	}
})();

// os, monitor
(function() {
	const platform = window.navigator.platform;

	if(/android/i.test(agent)) { // 안드로이드
		browser.os.name = 'android';
		// mobile 없으면 태블릿임
		if(/mobile/i.test(agent)) {
			browser.monitor = 'mobile';
		}else {
			browser.monitor = 'tablet';
		}
	}else if(/(iphone|ipad|ipod)/i.test(agent)) { // 애플
		browser.os.name = 'ios';
		if(/ipad/i.test(agent)) {
			browser.monitor = 'tablet';
		}else {
			browser.monitor = 'mobile';
		}
	}else if(browser.is.mobile) {
		browser.monitor = 'mobile';
	}else if(/(MacIntel|MacPPC)/i.test(platform)) {
		browser.os.name = 'mac';
		browser.monitor = 'pc';
	}else if(/(win32|win64)/i.test(platform)) {
		browser.os.name = 'window';
		browser.monitor = 'pc';
	}

	// agent 값보다 스크린 크기를 우선 적용하여 태블릿인지 모바일인지 여부를 결정한다.
	// 테블렛인데 가로 길이가 미달이면 모바일로 인식하게 함
	/*if((browser.monitor = 'tablet') && browser.screen.width && browser.screen.height && (Math.min(browser.screen.width, browser.screen.height) < 768)) {
		browser.monitor = 'mobile';
	}*/

	// 모바일인데 가로 길이가 넘어가면 테블렛으로 인식하게 함
	/*if((browser.monitor = 'mobile') && browser.screen.width && browser.screen.height && (Math.min(browser.screen.width, browser.screen.height) >= 768)) {
		browser.monitor = 'tablet';
	}*/
})();

// transform, transition, animation, fullscreen
(function() {
	// 브라우저별로 프리픽스(종류)가 다를 수 있다.
	const transforms = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"]; // css check (IE9 벤더프리픽스로 사용가능, IE10이상 공식지원)
	const transforms3d = ["perspective", "WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"]; // 3D지원여부 판단자료
	const transitions = { // event check (IE10이상 공식지원) - start, run, cancel 브라우저 지원 확인 필요
		"transition": ["transitionstart", "transitionend", "transitionrun", "transitioncancel"],
		"WebkitTransition": ["webkitTransitionStart", "webkitTransitionEnd", "webkitTtransitionRun", "webkitTransitionCancel"],
		"MozTransition": ["transitionstart", "transitionend", "transitionrun", "transitioncancel"],
		"OTransition": ["oTransitionStart", "oTransitionEnd", "oTransitionRun", "oTransitionCancel"],
		"msTransition": ["MSTransitionStart", "MSTransitionEnd", "MSTransitionRun", "MSTransitionCancel"]
	};
	const animations = { // event check (IE10이상 공식지원)
		"animation": ['animationstart', 'animationiteration', 'animationend'],
		"WebkitAnimation": ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd'],
		"MozAnimation": ['animationstart', 'animationiteration', 'animationend'],
		"OAnimation": ['oanimationstart', 'oanimationiteration', 'oanimationend'],
		"msAnimation": ['MSAnimationStart', 'MSAnimationIteration', 'MSAnimationEnd']
	};
	const fullscreen = {
		// https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1628805-webkitsupportsfullscreen
		"requestFullscreen": ['requestFullscreen', 'webkitEnterFullscreen', 'webkitEnterFullScreen', 'webkitRequestFullscreen', 'webkitRequestFullScreen', 'mozRequestFullScreen', 'msRequestFullscreen'],
		"exitFullscreen": ['exitFullscreen', 'webkitExitFullscreen', 'webkitExitFullScreen', 'webkitCancelFullScreen', 'mozCancelFullScreen', 'msExitFullscreen'],
		"fullscreenElement": ['fullscreenElement', 'webkitFullscreenElement', 'webkitCurrentFullScreenElement', 'mozFullScreenElement', 'msFullscreenElement'],
	};

	// 트랜스폼
	for(let key in transforms) {
		if(div.style[transforms[key]] !== undefined) {
			browser.is.transform = true;
			//browser.css.transform = transforms[key];
			break;
		}
	}
	for(let key in transforms3d) {
		if(div.style[transforms3d[key]] !== undefined) {
			browser.is.transform3d = true;
			//browser.css.transform3d = transforms3d[key];
			break;
		}
	}

	// 트랜지션
	for(let key in transitions) {
		if(key in div.style) {
			browser.is.transition = true;
			browser.event.transitionstart = transitions[key][0];
			browser.event.transitionend = transitions[key][1];
			browser.event.transitionrun = transitions[key][2];
			browser.event.transitioncancel = transitions[key][3];
			break;
		}
	}

	// 애니메이션
	for(let key in animations) {
		if(key in div.style) {
			browser.is.animation = true;
			browser.event.animationstart = animations[key][0];
			browser.event.animationiteration = animations[key][1];
			browser.event.animationend = animations[key][2];
			break;
		}
	}

	// 풀스크린 
	for(let key in fullscreen) {
		if(typeof fullscreen[key] !== 'object') {
			continue;
		}
		for(let i=0, max=fullscreen[key].length; i<max; i++) {
			// 브라우저 지원 여부 
			if(fullscreen[key][i] in document || fullscreen[key][i] in document.documentElement || fullscreen[key][i] in div) {
				// 해당 이벤트 키 설정
				browser.event[key] = fullscreen[key][i];
				break;
			}
		}
	}
})();

// event
if(browser.is.touch === true) {
	browser.event.down = 'touchstart';
	browser.event.move = 'touchmove';
	browser.event.up = 'touchend';
	/*if(/(iphone|ipad|ipod)/i.test(agent)) { // touchend와 click 이벤트 실행 우선순위 문제발생
		browser.event.click = 'touchend';
	}*/
}

export default browser;