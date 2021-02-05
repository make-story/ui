/**
 * video
 */
/*
-
> HTML5 비디오 
https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
https://developer.mozilla.org/ko/docs/Web/HTML/Element/Video


> pause() 버그 - 정상적 play() 가능전에 pause()를 먼저 호출한 경우
https://stackoverflow.com/questions/36803176/how-to-prevent-the-play-request-was-interrupted-by-a-call-to-pause-error
https://bugs.chromium.org/p/chromium/issues/detail?id=593273


> DURATION 데이터를 어느정도 받은 후 재생이 가능한 디바이스가 있다.
https://developers.google.com/web/updates/2016/03/play-returns-promise?hl=en
let playPromise = document.querySelector('video').play();
// In browsers that don’t yet support this functionality,
// playPromise won’t be defined.
if(playPromise !== undefined) {
	playPromise.then(() => {
		// Automatic playback started!
	}).catch(function(error) {
		// Automatic playback failed.
		// Show a UI element to let the user manually start playback.
	});
}


> fullscreen
IOS
https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1633500-webkitenterfullscreen
https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/ControllingMediaWithJavaScript/ControllingMediaWithJavaScript.html
OS X: webkitfullscreenchange, iOS: webkitbeginfullscreen/webkitendfullscreen


> chrome 자동재생 정책
https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
자동재생시 음소거 상태에서 재생하므로, 볼륨 조절 버튼이 숨겨진 상태에서 사용자가 다시 볼륨 제어할 수있는 방법이 없다.
<video id="video" muted autoplay>
<button id="unmuteButton"></button>
<script>
// chrome 자동재생 정책에 따라 사용자가 음소거를 해제해서 들을 수 있도록 제공해야 한다.
unmuteButton.addEventListener('click', () => {
	video.muted = false;
});
</script>


> hls 라이브러리 사용 
https://github.com/video-dev/hls.js


> aria-pressed
https://www.levelaccess.com/how-not-to-misuse-aria-states-properties-and-roles/


> PIP (Picture-in-Picture)
https://blog.arnellebalane.com/the-picture-in-picture-api-30415372009f
https://developers.google.com/web/updates/2017/09/picture-in-picture

// supports 
if(document.pictureInPictureEnabled) {

}

// Requesting Picture-in-Picture
button.addEventListener('click', () => {
	video.requestPictureInPicture()
	.then(() => { })
	.catch(() => { });
});

// Leaving Picture-in-Picture
button.addEventListener('click', () => {
	if(document.pictureInPictureElement) {
		document.exitPictureInPicture()
		.then(() => { })
		.catch(() => { });
	}else {
		// Request Picture-in-Picture
	}
});

// Picture-in-Picture Events
video.addEventListener('enterpictureinpicture', () => {
	button.textContent = 'Exit Picture-in-Picture';
});
video.addEventListener('leavepictureinpicture', () => {
	button.textContent = 'Enter Picture-in-Picture';
});
*/
import { getKey, extend, is, } from '../util';

// pollyfill
// source: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
if(typeof window.CustomEvent !== "function") {
	(() => {
		function CustomEvent(event, params) {
			let evt;
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			evt = document.createEvent("CustomEvent");
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		}
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	})();
}

// 브라우저 정보
const browser = {
	isIE: /* @cc_on!@ */ false || !!document.documentMode,
	isEdge: window.navigator.userAgent.includes('Edge'),
	isWebkit: 'WebkitAppearance' in document.documentElement.style && !/Edge/.test(navigator.userAgent),
	isIPhone: /(iPhone|iPod)/gi.test(navigator.platform),
	isIos: /(iPad|iPhone|iPod)/gi.test(navigator.platform),
};

// 풀스크린 정보 
const fullscreen = (() => {
	let prefixes = ['webkit', 'moz', 'ms', 'o', 'khtml'];
	let i, max;
	
	let supportsFullScreen = false;
	let isFullScreen = false;
	let isNative = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled);
	let requestFullScreen = () => {};
	let cancelFullScreen = () => {};
	let fullScreenEventName = '';
	let element = null;
	let prefix = '';
	//let property = '';

	// 1. 풀스크린 지원여부 
	if(typeof document.cancelFullScreen === 'function'/* || typeof document.exitFullscreen === 'function'*/) {
		// 브라우저 표준지원 
		supportsFullScreen = true;
	}else {
		// 벤더프리픽스 
		for(i=0, max=prefixes.length; i<max; i++) {
			prefix = prefixes[i];

			if(typeof document[`${prefix}CancelFullScreen`] === 'function'/* || typeof document[`${prefix}ExitFullscreen`] === 'function'*/) {
				supportsFullScreen = true;
				break;
			}else if(typeof document.msExitFullscreen !== 'undefined' && document.msFullscreenEnabled) {
				prefix = 'ms';
				supportsFullScreen = true;
				break;
			}
		}
	}

	// 2. 인터페이스에 값 설정
	if(supportsFullScreen) { // 퓰스크린 지원할 경우
		fullScreenEventName = (prefix === 'ms' ? 'MSFullscreenChange' : `${prefix}fullscreenchange`);

		isFullScreen = (element) => {
			if(typeof element === 'undefined') {
				element = document.body;
			}
			switch(prefix) {
				case '':
					return document.fullscreenElement === element;
				case 'moz':
					return document.mozFullScreenElement === element;
				default:
					return document[`${prefix}FullscreenElement`] === element;
			}
		};
		requestFullScreen = (element) => {
			if(typeof element === 'undefined') {
				element = document.body;
			}
			return (prefix === '') ? element.requestFullScreen() : element[`${prefix}${(prefix === 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')}`]();
		};
		cancelFullScreen = () => {
			return (prefix === '') ? document.cancelFullScreen() : document[`${prefix}${(prefix === 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')}`]();
		};
		element = () => {
			return (prefix === '') ? document.fullscreenElement : document[`${prefix}FullscreenElement`];
		};
	}

	return {
		supportsFullScreen,
		isFullScreen,
		isNative,
		requestFullScreen,
		cancelFullScreen,
		fullScreenEventName,
		element,
		prefix,
	};
})();

// 퍼센트 변환 반환
const getPercentage = (current, max) => {
	if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
		return 0;
	}
	return ((current / max) * 100).toFixed(2);
};

// Toggle class on an element (add / remove)
const toggleClass = function toggleClass(element, className, state) {
	let i, max;
	let name = '';

	if(element instanceof NodeList) {
		for(i=0, max=element.length; i<max; i++) {
			toggleClass(element[i], className, state);
		}
		return;
	}

	if(element) {
		if(element.classList) {
			element.classList[state ? 'add' : 'remove'](className);
		}else {
			name = (` ${element.className} `).replace(/\s+/g, ' ').replace(` ${className} `, '');
			element.className = name + (state ? ` ${className}` : '');
		}
	}
};

// Has class name
const hasClass = (element, className) => {
	if(element) {
		if(element.classList) {
			return element.classList.contains(className);
		}else {
			return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
		}
	}
	return false;
};

// Trigger event
const triggerEvent = (element, type, bubbles, properties) => {
	let event;

	// Bail if no element
	if(!element || !type) {
		return;
	}

	// Default bubbles to false
	if(!is.boolean(bubbles)) {
		bubbles = false;
	}

	// Create and dispatch the event
	// https://developer.mozilla.org/ko/docs/Web/API/CustomEvent
	event = new CustomEvent(type, {
		bubbles: bubbles,
		detail: properties
	});

	// Dispatch the event
	element.dispatchEvent(event);
};

// 동영상 비율 
const getAspectRatio = (width, height) => { 
	function gcd(a, b) {
		return (b == 0) ? a : gcd(b, a % b);
	}
	let result = {};
	result.width = width;
	result.height = height;
	result.gcd = gcd(width, height);
	result.aspect = [width/result.gcd, height/result.gcd].join(':');
	
	return result;
};

export default class Video {
	constructor(target=null/*container, 비디오를 넣을 타겟 */, settings={}) {
		this.settings = { // defaults 설정 
			'key': '', // 비디오 작동 고유키
			'attributes': {}, // 비디오 태그 사용자 속성 

			// 외부 오버레이 또는 video 태그와 오버레이를 포함한 템플릿 
			'overlay': '', // 내부에서 생성하는 것이 아닌 외부에서 만든 오버레이, element target 또는 html string
			'template': '', // video 태그를 포함한 템플릿, element target 또는 html string

			// poster 이미지 
			'poster': '', 

			// source
			'source': '', // string 이면 src, {'src': '', 'type': ''} 또는 {} 여러개 엤는 [{...}, {...}, ...] 배열형태

			// 기본 기능 설정
			'crossorigin': '', // anonymous, use-credentials
			'autoplay': false, // 로드시 미디어 자동 재생
			'muted': false, // 초기 음소거 모드여부 
			'loop': false, // loop="" 속성은 미디어가 종료되는 시점에 처음으로 돌아가게 합니다.
			'autoHideControls': true, // 비디오 컨트롤을 자동으로 숨깁니다. // hideControls
			'swipeRewindForward': true, // 마우스/터치 되감기/빨리감기 
			'swipeVolume': true, // 마우스/터치 볼륨
			'seekTime': 10, // 빨리 감기 또는 되감기를 할 때 시간
			'volume': 10, // 초기 볼륨 (1~10)
			'volumeMin': 0, // 불륨 최소 제한
			'volumeMax': 10, // 볼륨 최대 제한
			'volumeStep': 1, // 불륨 조절 간격
			/*'tooltips': {
				'controls': false,
				'seek': true
			},*/

			// 컨트롤러 버튼 사용유무
			'controls': {
				'reset': false, // 초기화 
				'rewind': false, // 되돌리기 버튼 노출여부
				'forward': false, // 빨리감기 버튼 노출여부
				'progress': true, // played, buffer
				'currentTime': true, // 현재 재생시간 표시 사용여부
				'duration': true, // 지속시간 표시 사용여부
				'mute': true, // 음소거 사요여부
				'volume': true, // 볼륨 사용여부
				//'captions': false, // 자막 사용여부
				'fullscreen': true, // 풀스크린 사용여부 (native 또는 fallback(프레임) 방식)
				'pip': true, // PIP (Picture-in-Picture)
				'tooltip': true // 각 버튼의 말풍선 사용여부 (예: 재생버튼에 마우스를 올리면, 설명 말풍선을 보여줌)
			},

			// 설렉터 (요소 이벤트 설정)
			'selectors': {
				'controlsWrapper': '[data-player="controls-wrapper"]',
				'playerWrapper': '[data-player="player-wrapper"]',
				'player': '[data-player="player"]',
				'poster': '[data-player="player-poster"]',
				'buttons': {
					'playOverlay': '[data-player="play-overlay"]', // 화면 중앙에 위치한 play 버튼 
					'pauseOverlay': '[data-player="pause-overlay"]',
					'reset': '[data-player="reset"]',
					'play': '[data-player="play"]',
					'pause': '[data-player="pause"]',
					'rewind': '[data-player="rewind"]',
					'forward': '[data-player="forward"]',
					'mute': '[data-player="mute"]', // 음소거/음소거제거 버튼, 버튼 이미지 변경에 대한것은 사용자가 listeners(콜백)을 추가해 해결하는 것으로 한다.
					//'captions': '[data-player="captions"]', // 자막 보이기/숨기기 버튼
					'fullscreen': '[data-player="fullscreen"]', // 버튼 이미지 변경에 대한것은 사용자가 listeners(콜백)을 추가해 해결하는 것으로 한다.
					'pip': '[data-player="pip"]'
				},
				'seek': {
					'container': '[data-player="seek"]',
					'range': '[data-player="seekRange"]', // <input type="range" min="0" max="100" step="0.1" value="0" />
					'progressPlayed': '[data-player="seekProgressPlayed"]',
					'progressBuffer': '[data-player="seekProgressBuffer"]',
					'tooltip': '[data-player="seekTooltip"]'
				},
				'volume': {
					'container': '[data-player="volume"]',
					'range': '[data-player="volumeRange"]', // <input type="range" min="0" max="10" value="10" />, 0~10 볼륨 조절
					'progress': '[data-player="volumeProgress"]' // <progress max="10" value="4"></progress>
				},
				//'captions': '[data-player="captions"]',
				'currentTime': '[data-player="current-time"]', // 현재 재생시간
				'duration': '[data-player="duration"]' // 전체 재생시간
			},

			// class (요소 스타일 설정)
			'classes': {
				'loading': 'player-loading', // 로딩중 (container 에 클래스 삽입)
				'fullscreen': 'player-fullscreen', // 풀스크린 상태 (container 에 클래스 삽입)

				'hidden': 'player-hidden', // 감추기 (display: none;)

				'container': 'player-container',
				'controlsWrapper': 'player-controls-wrapper',
				'playerWrapper': 'player-player-wrapper',
				'player': 'player-player',
				'poster': 'player-poster',
				'buttons': {
					'playOverlay': 'player-button-play-overlay',
					'pauseOverlay': 'player-button-pause-overlay',
					'reset': 'player-button-reset',
					'play': 'player-button-play',
					'pause': 'player-button-pause',
					'rewind': 'player-button-rewind',
					'forward': 'player-button-forward',
					'mute': 'player-button-mute',
					//'captions': 'player-button-captions',
					'fullscreen': 'player-button-fullscreen',
					'pip': 'player-button-pip'
				},
				'seek': {
					'container': 'player-seek-container',
					'range': 'player-seek-range',
					'progressPlayed': 'player-seek-progress-played',
					'progressBuffer': 'player-seek-progress-buffer',
					'tooltip': 'player-seek-tooltip'
				},
				'volume': {
					'container': 'player-volume-container',
					'range': 'player-volume-range',
					'progress': 'player-volume-progress'
				},
				//'captions': 'player-captions',
				'currentTime': 'player-time', 
				'duration': 'player-duration'
			},

			// 사용자 콜백 
			'listeners': {
				'reset': null,
				'seek': null,
				'play': null,
				'pause': null,
				'rewind': null,
				'forward': null,
				'mute': null,
				'volume': null,
				//'captions': null,
				'fullscreen': null,
				'pip': null
			}
		};
		this.settings = extend(this.settings, settings);
		
		// 필수 옵션 겁사
		if(!this.settings.source) {
			return false;
		}

		// setInterval, setTimeout 등 time 고유값
		this.time = { 
			'loading': null,
			'toggleControls': null
		};
		
		// 생성한 html5 video element (추후 audio 추가를 위해 네임을 media로 함)
		this.player = null; 
		this.elements = {
			target,
		};

		// 스크롤 위치 기억
		this.scroll = {
			x: window.pageXOffset || 0,
			y: window.pageYOffset || 0
		};

		// browser (브라우저 지원여부 등에 따른 옵션 true/false 강제제어)
		/*if(!fullscreen.supportsFullScreen) {
			this.settings.controls.fullscreen = false;
		}*/
		if(!document.pictureInPictureEnabled) {
			this.settings.controls.pip = false;
		}

		// render
		this.setRender();

		// element 세팅 
		this.setElements();
		this.setClasses();

		// 이벤트 설정 (사용자 이벤트와 함께 세팅)
		this.setEvent();

		// reset
		this.reset();

		// autoplay 여부에 따른 자동재성 실행 여부
		// chrome 자동재생 정책: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
		if(this.settings.autoplay) {
			this.setToggleMute(true);
			this.play();
		}

		// 비디오 타켓 element 의 속성 값 (<video data-player=""></video>)
		/*let data = {};
		try { data = JSON.parse(element.getAttribute('data-player')); }
		catch(e) { }*/
	}

	// 브라우저 기본 컨트롤러 또는 라이브러제공 컨트롤러(또는 사용자 오버레이) 사용여부 
	setToggleNativeControls(toggle) {
		if(!this.player) {
			return false;
		}

		// 속성이 존재하면, 소리 조절(volume), 동영상 탐색(seek), 일시 정지(pause)/재시작(resume)을 할 수 있는 컨트롤러를 제공
		if(toggle) {
			this.player.setAttribute('controls', '');
		}else {
			this.player.removeAttribute('controls');
		}
	}

	// 화면 구성 
	setRender() {
		const setPoster = () => { // video 속성이 아닌, div background 형태로 생성하여 삽입 
			let poster = document.createElement('div'); 

			if(is.url(this.settings.poster)) {
				poster.style.cssText = `background-image: url(${this.settings.poster});`;
			}

			return poster;
		};
		const setVideo = () => {
			let video = document.createElement('video');

			// 속성 설정
			// autoplay loop muted playsinline
			// 자동 재생 필수 속성: autoplay, muted, playsinline(아이폰은 IOS10버전 이후부터 playsinline 속성을 추가 적용)
			video.setAttribute('allowsInlineMediaPlayback', 'YES'); // IOS UIWebView 인라인 플레이 
			video.setAttribute('webkit-playsinline', ''); // IOS 인라인 플레이
			video.setAttribute('playsinline', ''); // IOS 인라인 플레이
			if(is.url(this.settings.poster)) {
				video.setAttribute('poster', this.settings.poster);
			}
			if(this.settings.crossorigin) {
				video.setAttribute('crossorigin', '');
			}
			if(this.settings.autoplay) {
				video.setAttribute('autoplay', '');
			}
			if(this.settings.muted) {
				video.setAttribute('muted', '');
			}
			if(this.settings.loop) {
				video.setAttribute('loop', '');
			}
			if(is.object(this.settings.attributes)) { // 사용자가 설정한 속성 리스트 
				(() => {
					let key;
					for(key in this.settings.attributes) {
						video.setAttribute(key, this.settings.attributes[key]);
					}
				})();
			}

			// source 
			if(is.string(this.settings.source)) {
				// {source: 'url'}
				video.setAttribute('src', this.settings.source);
			}else if(is.object(this.settings.source)) {
				// {source: [{src: 'url', type: 'file type'}]}
				if(!is.array(this.settings.source)) {
					this.settings.source = [this.settings.source];
				}
				(() => {
					let i, max;
					let source; // <source src="" type="" size="">
					for(i=0, max=this.settings.source.length; i<max; i++) {
						if(!is.object(this.settings.source[i]) || !this.settings.source[i].src) {
							continue;
						}
						source = document.createElement('source');
						if(this.settings.source[i].src) {
							source.setAttribute('src', this.settings.source[i].src);
						}
						if(this.settings.source[i].type) {
							source.setAttribute('type', this.settings.source[i].type);
						}
						video.insertBefore(source, video.firstChild);
					}
				})();
			}

			return video;
		};
		const setAudio = () => {

		};
		const setTemplate = () => {
			let fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.

			if(is.element(this.settings.template)) {
				// element
				fragment.appendChild(this.settings.template);
			}else if(is.object(this.settings.template) && !is.nullOrUndefined(jQuery) && is.object(jQuery) && this.settings.template instanceof jQuery && this.settings.template.length) {
				// jQuery
				fragment.appendChild(this.settings.template[0]);
			}else if(is.string(this.settings.template)) {
				// html
				(() => {
					let temp = document.createElement('template'); // IE 미지원
					temp.innerHTML = this.settings.template; // html
					fragment.appendChild(temp.content);
				})();
			}

			if(fragment.querySelectorAll('video').length) {
				return fragment;
			}else {
				return null;
			}
		};
		const setOverlay = () => { // controls
			// 오버레이가 html string 타입이라면, fragment 를 만들고, 생성된 video element 와 함께 this.elements.target에 삽입한다.
			if(is.object(this.settings.overlay) && !is.nullOrUndefined(jQuery) && is.object(jQuery) && this.settings.overlay instanceof jQuery && this.settings.overlay.length) {
				// jQuery
				this.settings.overlay = this.settings.overlay[0];
			}else if(is.string(this.settings.overlay)) {
				// html
				(() => {
					let fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
					let temp = document.createElement('template'); // IE 미지원
					temp.innerHTML = this.settings.overlay; // html
					fragment.appendChild(temp.content);
					/*let temp = document.createElement('div');
					let child;
					temp.innerHTML = this.settings.overlay;
					while(child = temp.firstChild) { // temp.firstElementChild (textnode 제외)
						fragment.appendChild(child);
					}*/
					this.elements.target.appendChild(fragment);
					this.settings.overlay = this.elements.target;
				})();
			}

			if(is.element(this.settings.overlay)) {
				return this.settings.overlay;
			}else {
				return null;
			}
		};
		const setStyle = () => {
			let style;
			let code;

			// css
			// touch-action: manipulation;
			code = `
				.player-container { box-sizing: border-box; position: relative; max-width: 100%; min-width: 200px; margin: 0; padding: 0; }

				.player-container.player-loading { }
				.player-container.player-fullscreen { }

				.player-container .player-hidden { display: none; }

				.player-controls-wrapper { box-sizing: border-box; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 10px 10px; border-bottom-left-radius: inherit; border-bottom-right-radius: inherit; color: #fff; transition: opacity .3s ease; background-color: rgba(44, 45, 46, .26); }
				.player-controls-wrapper button { box-sizing: border-box; position: relative; display: inline-block; -ms-flex-negative: 0; flex-shrink: 0; overflow: visible; vertical-align: middle; padding: 5px; border: 0; background: 0 0; border-radius: 3px; color: inherit; font-size: 13px; }
				.player-controls-wrapper button svg { box-sizing: border-box; width: 18px; height: 18px; display: block; fill: currentColor; }
				.player-controls-wrapper label { display: none; }

				.player-container.player-fullscreen .player-player-wrapper { width: 100%; height: 100%; }
				.player-container.player-fullscreen video { height: 100%; }

				.player-player-wrapper { box-sizing: border-box; position: relative; background: #000; border-radius: inherit; }
				.player-player { box-sizing: border-box; width: 100%; height: auto; vertical-align: middle; border-radius: inherit; }
				.player-poster { background-color: #000; background-position: 50% 50%; background-repeat: no-repeat; background-size: contain; height: 100%; width: 100%; position: absolute; left: 0; top: 0; z-index: 1; transition: opacity .2s ease; }

				.player-button-play-overlay { position: absolute; z-index: 1; top: 50%; left: 50%; transform: translate(-50%,-50%); padding: 10px; border-radius: 100%; box-shadow: 0 1px 1px rgba(0,0,0,.15); color: rgb(231, 68, 78); } /* 오버레이 중앙 위치 버튼 */
				.player-button-pause-overlay { position: absolute; z-index: 1; top: 50%; left: 50%; transform: translate(-50%,-50%); padding: 10px; border-radius: 100%; box-shadow: 0 1px 1px rgba(0,0,0,.15); color: rgb(231, 68, 78); } /* 오버레이 중앙 위치 버튼 */
				.player-button-play-overlay svg, .player-button-pause-overlay svg { position: relative; left: 2px; width: 20px; height: 20px; display: block; fill: currentColor; box-sizing: border-box; } 
				.player-button-reset {  }
				.player-button-play {  }
				.player-button-pause {  }
				.player-button-rewind {  }
				.player-button-forward {  }
				.player-button-mute {  }
				.player-button-mute .muted {  }
				.player-button-mute .volume {  }
				.player-button-captions { display: inline-block; }
				.player-button-fullscreen { display: inline-block; }
				.player-button-fullscreen .exit {  }
				.player-button-fullscreen .enter {  }

				.player-seek-container { margin: 0 5px; box-sizing: border-box; display: inline-block; position: relative; -ms-flex: 1; flex: 1;  }
				.player-seek-range { box-sizing: border-box; position: relative; z-index: 2; display: block; height: 20px; width: 100%; margin: 0; padding: 0; vertical-align: middle; -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; background: 0 0; }
				.player-seek-progress-played { box-sizing: border-box; z-index: 1; color: rgb(231, 68, 78); background: 0 0; position: absolute; left: 0; top: 50%; width: 100%; height: 8px; margin: -4px 0 0; padding: 0; vertical-align: top; -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; border-radius: 3px; }
				.player-seek-progress-buffer { box-sizing: border-box; color: rgba(255,255,255,.25); background: rgba(255,255,255,.25); position: absolute; left: 0; top: 50%; width: 100%; height: 8px; margin: -4px 0 0; padding: 0; vertical-align: top; -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; border-radius: 3px; }
				.player-seek-tooltip { position: absolute; z-index: 2; bottom: 100%; margin-bottom: 10px; padding: 5px 7.5px; background: rgba(0,0,0,.7); color: #fff; font-size: 14px; box-sizing: border-box; border-radius: 3px; }

				.player-volume-container { margin: 0 5px; box-sizing: border-box; display: block; max-width: 60px; -ms-flex: 1; flex: 1; position: relative; }
				.player-volume-range { box-sizing: border-box; position: relative; z-index: 2; display: block; height: 20px; width: 100%; margin: 0; padding: 0; vertical-align: middle; -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; background: 0 0; }
				.player-volume-progress { box-sizing: border-box; z-index: 1; color: rgb(231, 68, 78); background: rgba(255,255,255,.25); position: absolute; left: 0; top: 50%; width: 100%; height: 8px; margin: -4px 0 0; padding: 0; vertical-align: top; -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; border-radius: 3px; }

				.player-container input[type=range] { display: block; height: 20px; width: 100%; margin: 0; padding: 0; vertical-align: middle; -webkit-appearance: none; -moz-appearance: none; appearance: none; cursor: pointer; border: none; background: 0 0; }
				.player-container input[type=range]::-webkit-slider-runnable-track { height: 8px; background: 0 0; border: 0; border-radius: 4px; -webkit-user-select: none; user-select: none; }
				.player-container input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; margin-top: -4px; position: relative; height: 16px; width: 16px; background: #fff; border: 2px solid transparent; border-radius: 100%; box-shadow: 0 1px 1px rgba(0, 0, 0, .15), 0 0 0 1px rgba(0, 0, 0, .15); box-sizing: border-box; }
				.player-container input[type=range]::-moz-range-track { height: 8px; background: 0 0; border: 0; border-radius: 4px; -moz-user-select: none; user-select: none; }
				.player-container input[type=range]::-moz-range-thumb { position: relative; height: 16px; width: 16px; background: #fff; border: 2px solid transparent; border-radius: 100%;  box-shadow: 0 1px 1px rgba(0, 0, 0, .15), 0 0 0 1px rgba(0, 0, 0, .15); box-sizing: border-box; }
				.player-container input[type=range]::-ms-track { height: 8px; background: 0 0; border: 0; color: transparent; }
				.player-container input[type=range]::-ms-fill-upper { height: 8px; background: 0 0; border: 0; border-radius: 4px; -ms-user-select: none; user-select: none; }
				.player-container input[type=range]::-ms-fill-lower { height: 8px; border: 0; border-radius: 4px; -ms-user-select: none; user-select: none; background: rgb(231, 68, 78); }
				.player-container input[type=range]::-ms-thumb { position: relative; height: 16px; width: 16px; background: #fff; border: 2px solid transparent; border-radius: 100%; box-shadow: 0 1px 1px rgba(0, 0, 0, .15), 0 0 0 1px rgba(0, 0, 0, .15); box-sizing: border-box; margin-top: 0;}
				.player-container input[type=range]::-ms-tooltip { display: none; }
				.player-container input[type=range]::-moz-focus-outer { border: 0; }
				.player-container input[type=range]:active::-webkit-slider-thumb { background: rgb(231, 68, 78); border-color: #fff; transform: scale(1.25); }
				.player-container input[type=range]:active::-moz-range-thumb { background: rgb(231, 68, 78); border-color: #fff; transform: scale(1.25); }
				.player-container input[type=range]:active::-ms-thumb { background: rgb(231, 68, 78); border-color: #fff; transform: scale(1.25); }

				.player-seek-progress-played::-webkit-progress-bar, .player-seek-progress-buffer::-webkit-progress-bar, .player-volume-progress::-webkit-progress-bar { background: 0 0; }
				.player-seek-progress-played::-webkit-progress-value, .player-volume-progress::-webkit-progress-value { min-width: 8px; max-width: 99%; border-top-right-radius: 0; border-bottom-right-radius: 0; transition: none; transition: none; }
				.player-seek-progress-played::-webkit-progress-value, .player-seek-progress-buffer::-webkit-progress-value, .player-volume-progress::-webkit-progress-value { background: currentColor; min-width: 8px; border-radius: 3px; }

				.player-captions {}
				.player-time { margin: 0 5px; box-sizing: border-box; display: inline-block; vertical-align: middle; font-size: 13px; }
				.player-duration { margin: 0 5px; box-sizing: border-box; display: inline-block; vertical-align: middle; font-size: 13px; }
			`;

			// style
			style = document.createElement('style');
			style.setAttribute('type', 'text/css'); // style.type
			style.setAttribute('data-player', '');
			//(document.head || document.getElementsByTagName('head')[0]).appendChild(style);
			//if(style.styleSheet) {
				// This is required for IE8 and below.
				//style.styleSheet.cssText = code;
			//}else {
				style.appendChild(document.createTextNode(code));
			//}

			return style;
		};
		const setSVG = () => {
			let wrapper = document.createElement('div');

			wrapper.style.cssText = 'display: none;';
			wrapper.innerHTML = `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<symbol id="media-airplay"><path d="M16 1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v-2H3V3h12v8h-2v2h3a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"></path><path d="M4 17h10l-5-6z"></path></symbol>
					<symbol id="media-captions-off"><path d="M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1H1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69zm7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69z" fill-rule="evenodd" fill-opacity=".5"></path></symbol>
					<symbol id="media-captions-on"><path d="M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1H1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69zm7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69z" fill-rule="evenodd"></path></symbol>
					<symbol id="media-download"><path d="M9 13c.3 0 .5-.1.7-.3L15.4 7 14 5.6l-4 4V1H8v8.6l-4-4L2.6 7l5.7 5.7c.2.2.4.3.7.3zm-7 2h14v2H2z"></path></symbol>
					<symbol id="media-enter-fullscreen"><path d="M10 3h3.6l-4 4L11 8.4l4-4V8h2V1h-7zM7 9.6l-4 4V10H1v7h7v-2H4.4l4-4z"></path></symbol>
					<symbol id="media-exit-fullscreen"><path d="M1 12h3.6l-4 4L2 17.4l4-4V17h2v-7H1zM16 .6l-4 4V1h-2v7h7V6h-3.6l4-4z"></path></symbol>
					<symbol id="media-forward"><path d="M7.875 7.171L0 1v16l7.875-6.171V17L18 9 7.875 1z"></path></symbol>
					<symbol id="media-logo-vimeo"><path d="M17 5.3c-.1 1.6-1.2 3.7-3.3 6.4-2.2 2.8-4 4.2-5.5 4.2-.9 0-1.7-.9-2.4-2.6C5 10.9 4.4 6 3 6c-.1 0-.5.3-1.2.8l-.8-1c.8-.7 3.5-3.4 4.7-3.5 1.2-.1 2 .7 2.3 2.5.3 2 .8 6.1 1.8 6.1.9 0 2.5-3.4 2.6-4 .1-.9-.3-1.9-2.3-1.1.8-2.6 2.3-3.8 4.5-3.8 1.7.1 2.5 1.2 2.4 3.3z"></path></symbol>
					<symbol id="media-logo-youtube"><path d="M16.8 5.8c-.2-1.3-.8-2.2-2.2-2.4C12.4 3 9 3 9 3s-3.4 0-5.6.4C2 3.6 1.3 4.5 1.2 5.8 1 7.1 1 9 1 9s0 1.9.2 3.2c.2 1.3.8 2.2 2.2 2.4C5.6 15 9 15 9 15s3.4 0 5.6-.4c1.4-.3 2-1.1 2.2-2.4.2-1.3.2-3.2.2-3.2s0-1.9-.2-3.2zM7 12V6l5 3-5 3z"></path></symbol>
					<symbol id="media-muted"><path d="M12.4 12.5l2.1-2.1 2.1 2.1 1.4-1.4L15.9 9 18 6.9l-1.4-1.4-2.1 2.1-2.1-2.1L11 6.9 13.1 9 11 11.1zM3.786 6.008H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601L3.786 6.008z"></path></symbol>
					<symbol id="media-pause"><path d="M6 1H3c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zm6 0c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1h-3z"></path></symbol>
					<symbol id="media-pip"><path d="M13.293 3.293L7.022 9.564l1.414 1.414 6.271-6.271L17 7V1h-6z"></path><path d="M13 15H3V5h5V3H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6h-2v5z"></path></symbol>
					<symbol id="media-play"><path d="M15.562 8.1L3.87.225c-.818-.562-1.87 0-1.87.9v15.75c0 .9 1.052 1.462 1.87.9L15.563 9.9c.584-.45.584-1.35 0-1.8z"></path></symbol>
					<symbol id="media-reset"><path d="M9.7 1.2l.7 6.4 2.1-2.1c1.9 1.9 1.9 5.1 0 7-.9 1-2.2 1.5-3.5 1.5-1.3 0-2.6-.5-3.5-1.5-1.9-1.9-1.9-5.1 0-7 .6-.6 1.4-1.1 2.3-1.3l-.6-1.9C6 2.6 4.9 3.2 4 4.1 1.3 6.8 1.3 11.2 4 14c1.3 1.3 3.1 2 4.9 2 1.9 0 3.6-.7 4.9-2 2.7-2.7 2.7-7.1 0-9.9L16 1.9l-6.3-.7z"></path></symbol>
					<symbol id="media-rewind"><path d="M10.125 1L0 9l10.125 8v-6.171L18 17V1l-7.875 6.171z"></path></symbol>
					<symbol id="media-settings"><path d="M16.135 7.784a2 2 0 0 1-1.23-2.969c.322-.536.225-.998-.094-1.316l-.31-.31c-.318-.318-.78-.415-1.316-.094a2 2 0 0 1-2.969-1.23C10.065 1.258 9.669 1 9.219 1h-.438c-.45 0-.845.258-.997.865a2 2 0 0 1-2.969 1.23c-.536-.322-.999-.225-1.317.093l-.31.31c-.318.318-.415.781-.093 1.317a2 2 0 0 1-1.23 2.969C1.26 7.935 1 8.33 1 8.781v.438c0 .45.258.845.865.997a2 2 0 0 1 1.23 2.969c-.322.536-.225.998.094 1.316l.31.31c.319.319.782.415 1.316.094a2 2 0 0 1 2.969 1.23c.151.607.547.865.997.865h.438c.45 0 .845-.258.997-.865a2 2 0 0 1 2.969-1.23c.535.321.997.225 1.316-.094l.31-.31c.318-.318.415-.781.094-1.316a2 2 0 0 1 1.23-2.969c.607-.151.865-.547.865-.997v-.438c0-.451-.26-.846-.865-.997zM9 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path></symbol>
					<symbol id="media-volume"><path d="M15.6 3.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4C15.4 5.9 16 7.4 16 9c0 1.6-.6 3.1-1.8 4.3-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7z"></path><path d="M11.282 5.282a.909.909 0 0 0 0 1.316c.735.735.995 1.458.995 2.402 0 .936-.425 1.917-.995 2.487a.909.909 0 0 0 0 1.316c.145.145.636.262 1.018.156a.725.725 0 0 0 .298-.156C13.773 11.733 14.13 10.16 14.13 9c0-.17-.002-.34-.011-.51-.053-.992-.319-2.005-1.522-3.208a.909.909 0 0 0-1.316 0zm-7.496.726H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601L3.786 6.008z"></path></symbol>
				</svg>
			`;

			return wrapper;
		};
		const setControls = () => {
			 let html = [];
			 let fragment = document.createDocumentFragment(); // fragment 가 document에 렌더링(삽입)되기 전에, 셀렉터로 fragment 내부 element 검색이 가능하다.
			 let temp = document.createElement('template'); // IE 미지원
			 let key;

			// Reset button
			if(this.settings.controls.reset !== false) {
				html.push(`
					<button type="button" data-player="reset">
						<svg><use xlink:href="#media-reset" /></svg>
					</button>
				`);
			}

			// Play Pause button
			html.push(`
				<button type="button" data-player="play" class="">
					<svg><use xlink:href="#media-play" /></svg>
				</button>
				<button type="button" data-player="pause" class="">
					<svg><use xlink:href="#media-pause" /></svg>
				</button>
			`);

			// Rewind button
			if(this.settings.controls.rewind !== false) {
				html.push(`
					<button type="button" data-player="rewind" class="">
						<svg><use xlink:href="#media-rewind" /></svg>
					</button>
				`);
			}

			// Fast forward button
			if(this.settings.controls.forward !== false) {
				html.push(`
					<button type="button" data-player="forward" class="">
						<svg><use xlink:href="#media-forward" /></svg>
					</button>
				`);
			}

			// Progress
			if(this.settings.controls.progress !== false) {
				key = getKey();
				html.push(`
					<span data-player="seek" class="">
						<label for="${key}" class="">Seek</label>
						<input type="range" id="${key}" class="" min="0" max="100" step="0.1" value="0" data-player="seekRange">
						<progress class="" max="100" value="0" role="presentation" data-player="seekProgressPlayed"></progress>
						<progress class="" max="100" value="0" data-player="seekProgressBuffer">
							<span>0</span>%',
						</progress>
						<!-- Seek tooltip //-->
						<span data-player="seekTooltip" class="${this.settings.classes.hidden}">00:00</span> 
					</span>
				`);
			}

			// Media current time display
			if(this.settings.controls.currentTime !== false) {
				html.push(`
					<span data-player="current-time" class="">
						'00:00',
					</span>
				`);
			}

			// Media duration display
			if(this.settings.controls.duration !== false) {
				html.push(`
					<span data-player="duration" class="">
						'00:00',
					</span>
				`);
			}

			// Toggle mute button
			if(this.settings.controls.mute !== false) {
				html.push(`
					<button type="button" data-player="mute">
						<svg class="muted"><use xlink:href="#media-muted" /></svg>
						<svg class="volume"><use xlink:href="#media-volume" /></svg>
					</button>
				`);
			}

			// Volume range control
			if(this.settings.controls.volume !== false) {
				key = getKey();
				html.push(`
					<span data-player="volume" class="">
						<label for="${key}" class="">Volume</label>
						<input type="range" id="${key}" class="" min="${this.settings.volumeMin}" max="${this.settings.volumeMax}" value="${this.settings.volume}" data-player="volumeRange">
						<progress class="" max="${this.settings.volumeMax}" value="${this.settings.volumeMin}" role="presentation" data-player="volumeProgress"></progress>
					</span>
				`);
			}

			// Toggle fullscreen button
			if(this.settings.controls.fullscreen !== false) {
				html.push(`
					<button type="button" data-player="fullscreen">
						<svg class="exit"><use xlink:href="#media-exit-fullscreen" /></svg>
						<svg class="enter"><use xlink:href="#media-enter-fullscreen" /></svg>
					</button>
				`);
			}

			// PIP
			if(this.settings.controls.pip !== false) {
				html.push(`
					<button type="button" data-player="pip">
						<svg class=""><use xlink:href="#media-pip" /></svg>
					</button>
				`);
			}

			temp.innerHTML = html.join(''); // html
			fragment.appendChild(temp.content);

			return fragment;
		};

		let template;
		let overlay;
		
		// 생성 
		this.elements.container = document.createElement('div'); 
		if(this.settings.template) {
			// 사용자 템플릿 
			template = setTemplate();
		}
		if(template) {
			this.elements.container.appendChild(template);
		}else {
			// wrapper
			this.elements.controlsWrapper = document.createElement('div'); // 오버레이 wrapper
			this.elements.playerWrapper = document.createElement('div'); // video wrapper

			// video
			this.elements.playerWrapper.appendChild(this.player = setVideo());
			this.elements.playerWrapper.appendChild(this.elements.poster = setPoster());
			this.elements.container.appendChild(this.elements.playerWrapper);
			this.setToggleNativeControls(false);

			// controls
			if(this.settings.overlay) {
				// 사용자 컨트롤러 
				overlay = setOverlay();
			}
			if(overlay) {
				this.elements.controlsWrapper.appendChild(overlay);
			}else {
				// 자체 제공 컨트롤러 
				if(!document.querySelectorAll('style[data-player]').length) { // style
					(document.head || document.getElementsByTagName('head')[0]).appendChild(setStyle());
				}
				this.elements.container.appendChild(setSVG());
				this.elements.container.appendChild((() => { // 화면중앙 play / pause
					let fragment = document.createDocumentFragment();
					let temp = document.createElement('template');
					let html = [];
					html.push(`
						<button type="button" data-player="play-overlay" class="">
							<svg><use xlink:href="#media-play" /></svg>
						</button>
						<button type="button" data-player="pause-overlay" class="${this.settings.classes.hidden}">
							<svg><use xlink:href="#media-pause" /></svg>
						</button>
					`);
					temp.innerHTML = html.join(''); // html
					fragment.appendChild(temp.content);
					return fragment;
				})());
				this.elements.controlsWrapper.appendChild(setControls()); // 화면 하단 컨트롤러 
			}
			this.elements.container.appendChild(this.elements.controlsWrapper);
		}
		this.elements.target.appendChild(this.elements.container);
	}

	// elements find 
	setElements() {
		const getElements = (selector) => { // Find all elements
			return this.elements.target.querySelectorAll(selector);
		};
		const getElement = (selector) => { // Find a single element
			return getElements(selector)[0];
		};

		/*
		this.elements.seek.progressBuffer.text 처럼,
		this.settings.selectors 인터페이스와 this.elements 인터페이스가 일치하는 것은 아니다.
		*/

		try {
			// media (video) - 라이브러리에서 생성하지 않은 것은 selectors 값을 참조해 찾는다.
			if(!this.elements.controlsWrapper) {
				this.elements.controlsWrapper = getElement(this.settings.selectors.controlsWrapper);
			}
			if(!this.elements.playerWrapper) {
				this.elements.playerWrapper = getElement(this.settings.selectors.playerWrapper);
			}
			if(!this.player) {
				this.player = getElement(this.settings.selectors.player);
			}
			if(!this.elements.poster) {
				this.elements.poster = getElement(this.settings.selectors.poster);
			}

			// buttons
			this.elements.buttons = {};
			this.elements.buttons.playOverlay = getElements(this.settings.selectors.buttons.playOverlay);
			this.elements.buttons.pauseOverlay = getElements(this.settings.selectors.buttons.pauseOverlay);
			this.elements.buttons.reset = getElements(this.settings.selectors.buttons.reset);
			this.elements.buttons.play = getElements(this.settings.selectors.buttons.play);
			this.elements.buttons.pause = getElement(this.settings.selectors.buttons.pause);
			this.elements.buttons.rewind = getElement(this.settings.selectors.buttons.rewind);
			this.elements.buttons.forward = getElement(this.settings.selectors.buttons.forward);
			this.elements.buttons.mute = getElement(this.settings.selectors.buttons.mute);
			//this.elements.buttons.captions = getElement(this.settings.selectors.buttons.captions);
			this.elements.buttons.fullscreen = getElement(this.settings.selectors.buttons.fullscreen);
			this.elements.buttons.pip = getElement(this.settings.selectors.buttons.pip);
			
			// seek
			this.elements.seek = {};
			this.elements.seek.container = getElement(this.settings.selectors.seek.container); // seek wrapper
			this.elements.seek.range = getElement(this.settings.selectors.seek.range); // seek btton
			this.elements.seek.progressPlayed = getElement(this.settings.selectors.seek.progressPlayed);
			this.elements.seek.progressBuffer = {};
			this.elements.seek.progressBuffer.bar = getElement(this.settings.selectors.seek.progressBuffer);
			this.elements.seek.progressBuffer.text = this.elements.seek.progressBuffer.bar && this.elements.seek.progressBuffer.bar.getElementsByTagName('span')[0];
			this.elements.seek.tooltip = getElement(this.settings.selectors.seek.tooltip);

			// volume
			this.elements.volume = {};
			this.elements.volume.container = getElement(this.settings.selectors.volume.container); // volume wrapper
			this.elements.volume.range = getElement(this.settings.selectors.volume.range);
			this.elements.volume.progress = getElement(this.settings.selectors.volume.progress);

			// timing
			this.elements.duration = getElement(this.settings.selectors.duration);
			this.elements.currentTime = getElement(this.settings.selectors.currentTime);

			console.log('elements', this.elements);

			return true;
		}catch(e) {
			this.setToggleNativeControls(true);

			return false;
		}
	}

	// 클래스 
	setClasses() {	
		const setAttribute = (element, key, value) => {
			let i, max;

			if(!element) {
				return;
			}
			if(element instanceof NodeList) {
				for(i=0, max=element.length; i<max; i++) {
					if(element[i] instanceof Node) {
						element[i].setAttribute(key, value);
					}
				}
			}else if(element instanceof Node) {
				element.setAttribute(key, value);
			}
		};

		// media (video)
		toggleClass(this.elements.container, this.settings.classes.container, true);
		toggleClass(this.elements.controlsWrapper, this.settings.classes.controlsWrapper, true);
		toggleClass(this.elements.playerWrapper, this.settings.classes.playerWrapper, true);
		toggleClass(this.player, this.settings.classes.player, true);
		toggleClass(this.elements.poster, this.settings.classes.poster, true);

		// buttons
		toggleClass(this.elements.buttons.playOverlay, this.settings.classes.buttons.playOverlay, true);
		toggleClass(this.elements.buttons.pauseOverlay, this.settings.classes.buttons.pauseOverlay, true);
		toggleClass(this.elements.buttons.reset, this.settings.classes.buttons.reset, true);
		toggleClass(this.elements.buttons.play, this.settings.classes.buttons.play, true);
		toggleClass(this.elements.buttons.pause, this.settings.classes.buttons.pause, true);
		toggleClass(this.elements.buttons.rewind, this.settings.classes.buttons.rewind, true);
		toggleClass(this.elements.buttons.forward, this.settings.classes.buttons.forward, true);
		toggleClass(this.elements.buttons.mute, this.settings.classes.buttons.mute, true);
		//toggleClass(this.elements.buttons.captions, this.settings.classes.buttons.captions, true);
		toggleClass(this.elements.buttons.fullscreen, this.settings.classes.buttons.fullscreen, true);
		toggleClass(this.elements.buttons.pip, this.settings.classes.buttons.pip, true);

		// seek
		toggleClass(this.elements.seek.container, this.settings.classes.seek.container, true);
		toggleClass(this.elements.seek.range, this.settings.classes.seek.range, true);
		toggleClass(this.elements.seek.progressPlayed, this.settings.classes.seek.progressPlayed, true);
		toggleClass(this.elements.seek.progressBuffer.bar, this.settings.classes.seek.progressBuffer, true);
		toggleClass(this.elements.seek.tooltip, this.settings.classes.seek.tooltip, true);

		// volume
		toggleClass(this.elements.volume.container, this.settings.classes.volume.container, true);
		toggleClass(this.elements.volume.range, this.settings.classes.volume.range, true);
		toggleClass(this.elements.volume.progress, this.settings.classes.volume.progress, true);

		// timing
		toggleClass(this.elements.duration, this.settings.classes.duration, true);
		toggleClass(this.elements.currentTime, this.settings.classes.currentTime, true);
	}

	// 이벤트 
	setEvent() {
		// HTML5 비디오 기본 이벤트
		// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
		
		let pointer = {
			"down": "mousedown",
			"move": "mousemove",
			"up": "mouseup",
			"click": "click"
		};

		//
		if('ontouchstart' in window || window.navigator.MaxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0 || (window.DocumentTouch && window.document instanceof DocumentTouch)) {
			pointer.down = 'touchstart';
			pointer.move = 'touchmove';
			pointer.up = 'touchend';
		}

		// 1.
		// element 에 이벤트를 설정 / 해제 (toggle) - 사용자이벤트(CustomEvent) 포함
		// Toggle event listener
		const toggleListener = (toggle, target, type, listener, options) => {
			let typeList = type.split(' ');
			let i, max;

			// element 가 여러개 있을 경우 
			if(target instanceof NodeList) {
				for(i=0, max=target.length; i<max; i++) {
					if(target[i] instanceof Node) {
						toggleListener(toggle, target[i], type, listener, options);
					}
				}
				return;
			}

			// options
			if(!is.object(options) && !is.boolean(options)) {
				options = false; // useCapture
			}

			// 이벤트 등록/해제
			for(i=0,max=typeList.length; i<max; i++) {
				target[toggle === false ? 'removeEventListener' : 'addEventListener'](typeList[i], listener, options);
			}
		};

		// 2.
		// Bind event
		const eventListener = (target, type, listener, options) => {
			if(target) {
				// off
				toggleListener(false, target, type, listener, options);
				// on
				toggleListener(true, target, type, listener, options);
			}
		};

		// 3.
		// Bind along with custom handler
		const proxyListener = (target, type, listener, callback, options) => {
			eventListener(target, type, (event) => {
				// 사용자 리스너 콜백
				if(callback) {
					//callback.apply(target, [event]);
					callback(event);
				}
				// 기본 리스터 콜백
				//listener.apply(target, [event]);
				listener(event);
			}, options);
		};

		// fullscreen event
		const toggleFullscreen = (event) => {
			let isSupport = fullscreen.supportsFullScreen;
			let isIOSSupport = this.player.webkitSupportsFullscreen;
			let isFullscreen;

			console.log('toggleFullscreen');
			console.log('isSupport', isSupport);
			console.log('isIOSSupport', isIOSSupport);

			// fullscreen 변경 이벤트 
			if(isSupport) {
				if(event && event.type === fullscreen.fullScreenEventName) { // 풀스크린 상태 변경 이벤트 
					// 현재 fullscreen 상태 확인 
					isFullscreen = fullscreen.isFullScreen(this.elements.container);

					// Restore scroll position
					if(!isFullscreen) {
						window.scrollTo(this.scroll.x, this.scroll.y);
					}
				}else {
					this.setToggleFullscreen();
				}
			}else if(isIOSSupport) {
				if(event && (event.type === 'webkitfullscreenchange' || event.type === 'webkitbeginfullscreen')) { // 풀스크린 상태 변경 이벤트 
					this.setToggleFullscreen(this.player.webkitDisplayingFullscreen);
				}else {
					this.setToggleFullscreen();
				}
			}
		};

		// progress 정보 최신화 event
		const updateProgress = (event) => {
			let type;
			let progress;
			let value = 0;
			let duration = this.getDuration();

			if(!is.object(event)) {
				return;
			}else if(event.type === 'timeupdate' && this.player.seeking) {
				return;
			}
			type = event.type;

			switch(type) {
				// progress / seek
				case 'timeupdate':
				case 'seeking':
					progress = this.elements.seek.progressPlayed;
					value = getPercentage(this.player.currentTime, duration);

					if(type === 'timeupdate' && this.elements.seek.range) {
						this.elements.seek.range.value = value;
					}
					break;

				// buffer
				case 'playing':
				case 'progress':
					progress = this.elements.seek.progressBuffer;
					value = (() => {
						let buffered = this.player.buffered;
						if(buffered && buffered.length) {
							return getPercentage(buffered.end(0), duration);
						}else {
							return 0;
						}
					})();
					break;
			}

			// value
			this.setProgress(progress, value);
		};

		// player 필수값 확인 
		if(!this.player) {
			return false;
		}

		/*
		일반 이벤트 
		(사용자 옵션으로 받은 이벤트와 함께 실행하지 않는 이벤트)
		*/

		// 오류가 발생했을 때 전송
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/error
		eventListener(this.player, 'error', (event) => {
			console.log('error', event);
		});

		// 재생이 중단되면 전송됩니다. 예를 들어, 미디어가 재생 중이고 처음부터 다시 시작되면이 이벤트가 전송
		eventListener(this.player, 'abort', (event) => {
			console.log('abort', event);
		});

		// 미디어로드가 시작
		eventListener(this.player, 'loadstart', (event) => {
			console.log('loadstart', event);
		});

		// 미디어의 메타 데이터로드가 완료
		eventListener(this.player, 'loadedmetadata', (event) => {
			console.log('loadedmetadata', event);
		});

		// 미디어의 첫 번째 프레임이로드를 완료
		eventListener(this.player, 'loadeddata', (event) => {
			console.log('loadeddata', event);

			// 오버레이 제거 
			toggleClass(this.elements.poster, this.settings.classes.hidden, true);
		});

		// 최소한 두 프레임 동안 미디어를 재생할 수있을만큼 충분한 데이터가 사용 가능할 때
		eventListener(this.player, 'canplay', (event) => {
			console.log('canplay', event);
		});

		// 미디어 시간 변경
		// seeking: 탐색 작업이 시작될 때, seeked: 탐색 작업이 완료
		eventListener(this.player, 'timeupdate seeking', (event) => {
			console.log('timeupdate seeking', event);

			// Duration
			this.setTime(this.player.currentTime, this.elements.currentTime);

			// progress
			updateProgress(event);
		});

		// 캡션 수동 업데이트
		/*eventListener(this.player, 'timeupdate', (event) => {
			this.setSekManualCaptions();
		});*/

		// 데이터 로드 진행상황
		eventListener(this.player, 'durationchange loadedmetadata', (event) => {
			console.log('durationchange loadedmetadata', event);

			this.setDuration();
		});

		// 미디어(재생) 종료
		eventListener(this.player, 'ended', (event) => {
			console.log('ended', event);

			// Restart
			this.setSeek();

			// Re-load media
			this.player.load(); // load() html5 video 스팩 기본제공 함수
		});

		// 진행바
		eventListener(this.player, 'progress playing', (event) => {
			console.log('progress playing', event);

			updateProgress(event);
		});

		// 볼륨 - 트리거 실행 
		eventListener(this.player, 'volumechange', (event) => {
			console.log('volumechange', event);

			let muted = this.player.muted;
			let volume = muted ? 0 : (this.player.volume * this.settings.volumeMax);

			// element
			if(this.elements.volume.range) {
				this.elements.volume.range.value = volume;
			}
			if(this.elements.volume.progress) {
				this.elements.volume.progress.value = volume;
			}

			// class
			if(this.elements.buttons.mute) {
				if(volume === 0) {
					toggleClass(this.elements.buttons.mute.querySelector('.volume'), this.settings.classes.hidden, true);
					toggleClass(this.elements.buttons.mute.querySelector('.muted'), this.settings.classes.hidden, false);
				}else {
					toggleClass(this.elements.buttons.mute.querySelector('.muted'), this.settings.classes.hidden, true);
					toggleClass(this.elements.buttons.mute.querySelector('.volume'), this.settings.classes.hidden, false);
				}
			}
		});

		// 재생 / 일시정지 / 정지
		eventListener(this.player, 'play pause ended', (event) => {
			console.log('play pause ended', event);

			// 현재 플레이어 상태에 따라 오버레이/컨트롤 등 제어!
			switch(event.type) {
				case 'play':
					toggleClass(this.elements.buttons.playOverlay, this.settings.classes.hidden, true);
					toggleClass(this.elements.buttons.pauseOverlay, this.settings.classes.hidden, true);
					break;
				case 'pause':
				case 'ended':
					toggleClass(this.elements.buttons.playOverlay, this.settings.classes.hidden, false);
					toggleClass(this.elements.buttons.pauseOverlay, this.settings.classes.hidden, true);
					break;
			}
		});

		// 로딩 보이기 / 숨기기
		eventListener(this.player, 'waiting canplay seeked', (event) => {
			console.log('waiting canplay seeked', event);

			this.setToggleLoading(event.type === 'waiting');
		});

		// Picture-in-Picture Events
		eventListener(this.player, 'enterpictureinpicture', (event) => {
			console.log('enterpictureinpicture', event);
			// Exit Picture-in-Picture

		});
		eventListener(this.player, 'leavepictureinpicture', (event) => {
			console.log('leavepictureinpicture', event);
			// Enter Picture-in-Picture

		});

		// 컨트롤러 보이기 / 숨기기 
		// Toggle controls visibility based on mouse movement
		/*if(this.settings.autoHideControls) {
			// Toggle controls on mouse events and entering fullscreen
			eventListener(this.elements.container, 'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen', (event) => {
				this.setToggleControls(event);
			});
			// Watch for cursor over controls so they don't hide when trying to interact
			eventListener(this.elements.controlsWrapper, 'mouseenter mouseleave', (event) => {
				this.elements.controlsWrapper.hover = event.type === 'mouseenter';
			});
			eventListener(this.elements.controlsWrapper, 'mousedown mouseup touchstart touchend touchcancel', (event) => {
				this.elements.controlsWrapper.pressed = ['mousedown', 'touchstart'].includes(event.type);
			});
			// Focus in/out on controls
			eventListener(this.elements.controlsWrapper, 'focus blur', (event) => {
				this.setToggleControls(event);
			}, true);
		}*/

		// 비디오 화면내 터치 이벤트 
		(() => {
			let rect = this.elements.playerWrapper.getBoundingClientRect();
			let width = parseInt(rect.width * 50 / 100); // 가로 기준값 (화면대비 *% 픽셀값)
			let height = parseInt(rect.height * 60 / 100); // 세로 기준값 (화면대비 *% 픽셀값)
			let radius = { // 기능작동을 위한 터치(마우스) 이동 범위
				overlay: 10,
				volume: 5,
				rewindforward: 80
			};
			let start = {};
			let end = {};
			let volume = null;

			console.log('width', width);
			console.log('height', height);

			eventListener(this.elements.playerWrapper, 'mousedown mousemove mouseup touchstart touchmove touchend touchcancel', (event) => {
				let target; // event.target
				let touch;

				// target
				target = event.target;

				// touch
				if(event.touches && event.touches.length) {
					// thuch start, end
					touch = event.touches;
				}else if(event.changedTouches && event.changedTouches.length) {
					// touch move
					touch = event.changedTouches;
				}

				// type
				switch(event.type) {
					case 'mousedown':
					case 'touchstart':
						// 필터 
						if(typeof document.activeElement === 'object' && document.activeElement.nodeName && /INPUT|TEXTAREA/i.test(document.activeElement.nodeName)) {
							return false;
						}

						// 초기화
						start = {};
						end = {};

						// 위치값
						if(is.object(touch) && is.object(touch[0]) && 'screenX' in touch[0] && 'screenY' in touch[0]) {
							start.x = touch[0].screenX;
							start.y = touch[0].screenY;
							end.x = touch[0].screenX;
							end.y = touch[0].screenY;
						}else if('screenX' in event && 'screenY' in event) {
							start.x = event.screenX;
							start.y = event.screenY;
							end.x = event.screenX;
							end.y = event.screenY;
						}

						// 사용자가 화면을 터치(다운)하고 있는 시간 체크
						start.time = new Date().getTime();
						end.time = new Date().getTime();

						// 현재 볼륨 
						volume = this.player.volume/*0.0~1.0*/ * 10; // 0 ~ 10 정수 
						break;
					case 'mousemove':
					case 'touchmove':
						if(is.object(start) && is.object(end) && 'x' in start && 'x' in end && 'y' in start && 'y' in end) {
							// 위치값
							if(is.object(touch) && is.object(touch[0]) && 'screenX' in touch[0] && 'screenY' in touch[0]) {
								end.x = touch[0].screenX;
								end.y = touch[0].screenY;
							}else if('screenX' in event && 'screenY' in event) {
								end.x = event.screenX;
								end.y = event.screenY;
							}

							// 볼륨조절
							if(this.settings.swipeVolume === true && radius.volume < Math.abs(start.y - end.y) && is.number(volume)) {
								event.preventDefault();
								event.stopPropagation(); // 전파중단 
								event.stopImmediatePropagation(); // 현재 레벨 다른 이벤트 중단 
								(() => {
									let percent = parseInt(Math.abs(start.y - end.y) / height * 100); // height 대비 마우스 이동값은 몇 프로인지 확인 
									let change = parseInt(10/*볼륨최대값*/ * Number(percent) / 100); // 볼륨 최대값의 %(percent)에 해당하는 값 
									//console.log('percent', percent);
									//console.log('volume', volume);
									if(end.y < start.y) { // 증가
										//this.setIncreaseVolume();
										//console.log(volume + change);
										this.setVolume(volume + change);
									}else if(start.y < end.y) { // 감소
										//this.setDecreaseVolume();
										//console.log(volume - change);
										this.setVolume(volume - change);
									}
								})();
							}
						}
						break;
					case 'mouseup':
					case 'touchend':
					//case 'touchcancel':
						if(is.object(start) && is.object(end) && 'x' in start && 'x' in end && 'y' in start && 'y' in end) {
							end.time = new Date().getTime();
							if(Math.abs(start.x - end.x) < radius.overlay && Math.abs(start.y - end.y) < radius.overlay) {
								if(Number(end.time) - Number(start.time) <= 180) {
									// play / pause
									if(this.player.paused) {
										this.play();
									}else if(this.player.ended) {
										this.setSeek();
										this.play();
									}else {
										this.pause();
									}
								}
							}else if(this.settings.swipeRewindForward === true/*터치 되감기/빨리감기 기능 사용여부*/ && radius.rewindforward < Math.abs(start.x - end.x)/*설정된 기준 값보다 터치 이동이 더 발생했을 경우*/) {
								// 되감기 / 빨리감기
								event.preventDefault();
								event.stopPropagation(); // 전파중단 
								event.stopImmediatePropagation(); // 현재 레벨 다른 이벤트 중단 
								if(start.x < end.x) { // 빨리감기
									this.forward();
								}else if(end.x < start.x) { // 되감기
									this.rewind();
								}
							}
						}

						// 초기화
						start = {};
						end = {};
						volume = null;
						break;
					default:
						// 초기화
						start = {};
						end = {};
						volume = null;
						break;
				}
			}, {passive: true});
		})();


		/*
		일반 이벤트 + 사용자 이벤트 
		(옵션값으로 받은 사용자 이벤트와 함께 실행되는 이벤트)
		*/

		// Reset / Replay / Restart
		proxyListener(this.elements.buttons.reset, 'click', (event) => {
			//this.setSeek();
			this.reset();
		},
		this.settings.listeners.reset);

		// Play
		proxyListener(this.elements.buttons.playOverlay, 'click', (event) => {
			this.setTogglePlayPause(true);
		},
		this.settings.listeners.play);
		proxyListener(this.elements.buttons.play, 'click', (event) => {
			this.setTogglePlayPause(true);
		},
		this.settings.listeners.play);

		// Pause
		proxyListener(this.elements.buttons.pauseOverlay, 'click', (event) => {
			this.setTogglePlayPause(false);
		},
		this.settings.listeners.pause);
		proxyListener(this.elements.buttons.pause, 'click', (event) => {
			this.setTogglePlayPause(false);
		},
		this.settings.listeners.pause);

		// Rewind
		proxyListener(this.elements.buttons.rewind, 'click', (event) => {
			this.rewind();
		},
		this.settings.listeners.rewind);

		// Fast forward
		proxyListener(this.elements.buttons.forward, 'click', (event) => {
			this.forward();
		},
		this.settings.listeners.forward);

		// Seek
		proxyListener(this.elements.seek.range, browser.isIE ? 'change' : 'input', (event) => {
			let duration = this.getDuration();
			let targetTime = 0;
			if(is.object(event) && ['input', 'change'].includes(event.type)) {
				targetTime = ((event.target.value / event.target.max) * duration);
			}
			this.setSeek(targetTime);
		},
		this.settings.listeners.seek);

		// Set volume
		proxyListener(this.elements.volume.range, browser.isIE ? 'change' : 'input', (event) => {
			this.setVolume(this.elements.volume.range.value);
		},
		this.settings.listeners.volume);

		// Mute
		proxyListener(this.elements.buttons.mute, 'click', (event) => {
			this.setToggleMute();
		},
		this.settings.listeners.mute);

		// Fullscreen 실행/취소 이벤트 
		proxyListener(this.elements.buttons.fullscreen, 'click', toggleFullscreen, this.settings.listeners.fullscreen);
		if(fullscreen.supportsFullScreen) {
			// Fullscreen 상태변경 (fullscreenchange) 이벤트 
			eventListener(document, fullscreen.fullScreenEventName, toggleFullscreen);
		}else if(this.player.webkitSupportsFullscreen) {
			// OS X: webkitfullscreenchange, iOS: webkitbeginfullscreen/webkitendfullscreen
			// https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/ControllingMediaWithJavaScript/ControllingMediaWithJavaScript.html
			eventListener(this.player, 'webkitfullscreenchange webkitbeginfullscreen', toggleFullscreen);
		}

		// Captions
		/*eventListener(this.elements.buttons.captions, 'click', () => {
			this.setToggleCaptions();
		});*/

		// Seek tooltip (시간)
		eventListener(this.elements.seek.container, 'mouseenter mouseleave mousemove', (event) => {
			let duration = this.getDuration();
			let clientRect = {};
			let percent = 0;
			let toggle = false;

			if(!is.number(duration) || duration === 0) {
				return false;
			}
			clientRect = this.elements.seek.container.getBoundingClientRect();
			percent = ((100 / clientRect.width) * (event.pageX - clientRect.left));
			this.setSeekTooltip(percent);

			// Show/hide the tooltip
			if(event && ['mouseenter', 'mouseleave', 'mousemove'].includes(event.type)) {
				this.setToggleSeekTooltip(event.type === 'mouseleave');
			}
		});

		// pip
		eventListener(this.elements.buttons.pip, 'click', (event) => {
			if(document.pictureInPictureElement) {
				document.exitPictureInPicture();
			}else {
				this.player.requestPictureInPicture();
			}
		});
	}

	// networkState (네트워크 상태)
	getNetworkState() {
		let type;
		let state = '';

		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/networkState
		//this.player.networkState
		/*
		NETWORK_EMPTY 0 요소의 초기 상태 (readyState 상태도 0)
		NETWORK_IDLE 1 HTMLMediaElement 활성화 되었지만, 아직 네트워크에 접속하지 않음
		NETWORK_LOADING 2 브라우저가 HTMLMediaElement 데이터 다운로드 중
		NETWORK_NO_SOURCE 3 HTMLMediaElement src 찾을 수 없음(지원되지 않는 형식의 미디어 파일)
		*/
		type = this.player.networkState;
		switch(type) {
			case 0:
				state = 'NETWORK_EMPTY';
				break;
			case 1:
				state = 'NETWORK_IDLE';
				break;
			case 2:
				state = 'NETWORK_LOADING';
				break;
			case 3:
				state = 'NETWORK_NO_SOURCE';
				break;
		}
		return {'type': type, 'state': state};
	}

	// readyState
	getReadyState() {
		let type;
		let state = '';

		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
		//this.player.readyState
		/*
		HAVE_NOTHING 0 미디어 리소스에 대한 정보 없음
		HAVE_METADATA 1 메타 데이터 준비 됨 (video 크기 등 확인가능)
		HAVE_CURRENT_DATA 2 현재 재생 위치에 대한 데이터를 사용할 수 있지만 실제로 둘 이상의 프레임을 재생하기에는 충분하지 않습니다.
		HAVE_FUTURE_DATA 3 현재 재생 위치 및 미래에 대한 약간의 시간 동안의 데이터가 이용 가능하다 
		HAVE_ENOUGH_DATA 4 미디어를 중단없이 끝까지 재생할 수있을 정도로 충분한 데이터가 있으며 다운로드 속도가 충분히 높습니다.
		*/
		type = this.player.readyState;
		switch(type) {
			case 0:
				state = 'HAVE_NOTHING';
				break;
			case 1:
				state = 'HAVE_METADATA';
				break;
			case 2:
				state = 'HAVE_CURRENT_DATA';
				break;
			case 3:
				state = 'HAVE_FUTURE_DATA';
				break;
			case 4:
				state = 'HAVE_ENOUGH_DATA';
				break;
		}
		return {'type': type, 'state': state};
	}

	// element 에 지속 시간 노출
	setTime(value, element) {
		let time = {
			 second: 0,
			 minute: 0,
			 hour: 0
		};
		let displayHours = 0;

		if(!element) {
			return;
		}
		if(isNaN(value)) {
			value = 0;
		}

		time.second = parseInt(value % 60);
		time.minute = parseInt((value / 60) % 60);
		time.hour = parseInt(((value / 60) / 60) % 60);
		displayHours = (parseInt(((this.getDuration() / 60) / 60) % 60) > 0);

		time.second = ('0' + time.second).slice(-2);
		time.minute = ('0' + time.minute).slice(-2);

		element.innerHTML = (displayHours ? time.hour + ':' : '') + time.minute + ':' + time.second;
	}

	// 지속 값 반환
	getDuration() {	
		let duration = 0;

		if(this.player.duration !== null && !isNaN(this.player.duration)) {
			duration = this.player.duration;
		}

		return duration;
	}

	// 지속시간 노출 (비디오 데이터를 받은 길이/시간)
	setDuration() {	
		let duration = this.getDuration() || 0;

		if(!this.elements.duration && this.player.paused) {
			this.setTime(duration, this.elements.currentTime);
		}
		if(this.elements.duration) {
			this.setTime(duration, this.elements.duration);
		}

		//this.setSeekTooltip();
	}

	// 볼륨 설정 (range 에 따른 볼륨)
	setVolume(volume) {	
		let muted = this.player.muted;
		let max = this.settings.volumeMax;
		let min = this.settings.volumeMin;

		// 유효하지 않을 경우 초기 볼륨값으로 설정
		if(volume === null || isNaN(volume)) {
			volume = this.settings.volume;
		}
		if(volume > max) {
			volume = max;
		}
		if(volume < min) {
			volume = min;
		}
		volume = Number(volume);

		// volume
		this.player.volume = parseFloat(volume / max);

		// element 
		if(this.elements.volume.progress) {
			this.elements.volume.progress.value = volume;
		}

		// Toggle muted state
		if(volume === 0) {
			this.player.muted = true;
			//this.setToggleMute(true);
		}else if(muted && volume > 0) {
			this.setToggleMute();
		}
	}

	// 불륨 높이기
	setIncreaseVolume(step) {	
		let volume = this.player.muted ? 0 : (this.player.volume * this.settings.volumeMax);

		if(!is.number(step)) {
			step = this.settings.volumeStep;
		}

		this.setVolume(volume + step);
	}

	// 볼륨 줄이기
	setDecreaseVolume(step) {	
		let volume = this.player.muted ? 0 : (this.player.volume * this.settings.volumeMax);

		if(!is.number(step)) {
			step = this.settings.volumeStep;
		}

		this.setVolume(volume - step);
	}

	// progress 값 설정 (timeupdate/seeking 또는 playing/progress)
	setProgress(progress, value) {
		if(is.nullOrUndefined(value)) {
			value = 0;
		}

		if(is.nullOrUndefined(progress)) {
			if(this.elements.seek && this.elements.seek.progressBuffer) {
				progress = this.elements.seek.progressBuffer;
			}else {
				return;
			}
		}

		if(is.element(progress)) {
			progress.value = value;
		}else if(progress) {
			if(progress.bar) {
				progress.bar.value = value;
			}
			if(progress.text) {
				progress.text.innerHTML = value;
			}
		}
	}

	// 시간기준 progress
	// 플레이어 초기에서 타이머 인터벌 필요
	/*setTimeProgress(startDate, endDate) {
		// startDate: "20200313102500" 데이터 -> new Date()
		// endDate: "20200313113500" 데이터 -> new Date()
		let progress = this.elements.seek.progressPlayed;
		let percent = 0;

		// 시간기준 프로그래스바 
		if(is.object(startDate) && is.object(endDate)) {
			// 현재 시간 기준
			percent = ((Number(new Date()) - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
			this.progress(progress, percent);
		}
		
		// 프로그래스바 종료
		if(!is.number(percent) || 100 <= percent) {
			// 타이머 인터벌 종료 
		}
	}*/

	// 시간에 따른 재생 구간 설정 (seek 는 현재 재생중인 동그라미아이콘 위치)
	// 즉, 보고싶은 재생시점으로 변경할 수 있다.
	setSeek(targetTime) {
		let duration = this.getDuration(); // 재생시간
		let value;
		
		if(!is.number(targetTime)) {
			targetTime = 0;
		}

		// 동영상 재생시간 범위 유효성 확인
		if(targetTime < 0) {
			targetTime = 0;
		}else if(targetTime > duration) {
			targetTime = duration;
		}

		// range / progress 화면 수정 
		value = getPercentage(targetTime, duration);
		if(this.elements.seek.progressPlayed) {
			this.elements.seek.progressPlayed.value = value;
		}
		if(this.elements.seek.range) {
			this.elements.seek.range.value = value;
		}

		//
		try {
			this.player.currentTime = targetTime.toFixed(4);
		}
		catch(e) {}

		// captions
		//this.seekManualCaptions(targetTime);
	}

	// progress bar 에 마우스 오버 했을 때, 해당위치의 시간을 툴팁으로 노출 부분
	setSeekTooltip(percent) {	
		let duration = this.getDuration();

		if(!this.elements.seek.container || !this.elements.seek.tooltip || duration === 0) {
			return;
		}

		if(is.nullOrUndefined(percent)) {
			percent = this.elements.seek.tooltip.style.left.replace('%', '');
		}

		if(percent < 0) {
			percent = 0;
		}else if(percent > 100) {
			percent = 100;
		}

		// time
		this.setTime(((duration / 100) * percent), this.elements.seek.tooltip);

		// left
		this.elements.seek.tooltip.style.left = percent + "%";
	}

	setToggleSeekTooltip(toggle) {
		if(is.boolean(toggle)) {
			toggleClass(this.elements.seek.tooltip, this.settings.classes.hidden, toggle);
		}
	}

	// 로딩여부
	setToggleLoading(loading) {
		// Clear timer
		clearTimeout(this.time.loading);

		// Timer to prevent flicker when seeking
		this.time.loading = setTimeout(() => {
			// 로딩 보이기 / 숨기기 
			toggleClass(this.elements.container, this.settings.classes.loading, loading); 

			// 컨트롤러 보이기 / 숨기기 
			//this.setToggleControls(loading);
		}, (loading ? 250 : 0));

		return loading;
	}

	// Mute (음소거)
	setToggleMute(muted) {
		if(!is.boolean(muted)) {
			muted = !this.player.muted;
		}

		// Set mute on the player
		this.player.muted = muted;
		if(this.player.volume === 0) {
			this.setVolume(this.settings.volume);
		}
	}

	// 컨트롤러 보이기/숨기기
	setToggleControls(toggle/* boolean || event objct */) {	
		let delay = 0;
		let isEnterFullscreen = false;
		let show = toggle;
		let loading = hasClass(this.elements.container, this.settings.classes.loading); // 로딩중 여부 

		// event object
		if(!is.boolean(toggle)) { 
			if(toggle && toggle.type) {
				// 풀스크린 이벤트 여부 
				isEnterFullscreen = (toggle.type === 'enterfullscreen');

				// 보여야 하는 이벤트 type
				show = ['mousemove', 'touchstart', 'mouseenter', 'focus'].includes(toggle.type); 

				// delay 실행 이벤트 
				if(['mousemove', 'touchmove'].includes(toggle.type)) {
					delay = 2000;
				}else if(toggle.type === 'focus') {
					delay = 3000;
				}
			}else {
				// 현재 숨겨진 상태인지 확인 
				show = hasClass(this.elements.controlsWrapper, this.settings.classes.hidden);
			}
		}

		window.clearTimeout(this.time.toggleControls);

		if(show || this.player.paused || loading) {
			toggleClass(this.elements.controlsWrapper, this.settings.classes.hidden, false); // 컨트롤 보이기/숨기기

			// Always show controls when paused or if touch
			if(this.player.paused || loading) {
				return;
			}

			// Delay for hiding on touch
			if(browser.isTouch) {
				delay = 3000;
			}
		}

		if(!show || !this.player.paused) {
			this.time.toggleControls = window.setTimeout(() => {
				if((this.elements.controlsWrapper.pressed || this.elements.controlsWrapper.hover) && !isEnterFullscreen) {
					return;
				}

				toggleClass(this.elements.controlsWrapper, this.settings.classes.hidden, true); // 컨트롤 보이기/숨기기
			}, delay);
		}
	}

	// 재생 / 일시정지 
	setTogglePlayPause(toggle) {
		if(!is.boolean(toggle)) {
			toggle = this.player.paused;
		}
		
		if(toggle) {
			this.player.play();
			toggleClass(this.elements.buttons.play, this.settings.classes.hidden, true);
			toggleClass(this.elements.buttons.pause, this.settings.classes.hidden, false);
		}else {
			this.player.pause();
			toggleClass(this.elements.buttons.pause, this.settings.classes.hidden, true);
			toggleClass(this.elements.buttons.play, this.settings.classes.hidden, false);
		}

		return toggle;
	}

	// 풀스크린 
	setToggleFullscreen(toggle) {	
		let isSupport = fullscreen.supportsFullScreen;
		let isIOSSupport = this.player.webkitSupportsFullscreen;
		let isFullscreen;

		console.log('setToggleFullscreen');

		// native 지원여부에 따른 작동
		if(isSupport) {
			isFullscreen = fullscreen.isFullScreen(this.elements.container);
			console.log('isFullscreen', isFullscreen);
			console.log('toggle', toggle);
			if(isFullscreen || toggle === false) {
				fullscreen.cancelFullScreen();
			}else if(!isFullscreen || toggle == true) {
				// Save scroll position (Android)
				this.scroll = {
					x: window.pageXOffset || 0,
					y: window.pageYOffset || 0
				};
				fullscreen.requestFullScreen(this.elements.container);
			}
		}else if(isIOSSupport) {
			isFullscreen = this.player.webkitDisplayingFullscreen;
			console.log('isFullscreen', isFullscreen);
			console.log('toggle', toggle);
			if(isFullscreen || toggle === false) {
				this.player.webkitExitFullscreen();
			}else if(!isFullscreen || toggle == true) {
				this.player.webkitEnterFullscreen();
			}
		}else {
			// Otherwise, it's a simple toggle
			//isFullscreen = !isFullscreen;

			// Bind/unbind escape key
			//document.body.style.overflow = isFullscreen ? 'hidden' : '';
		}

		// class
		if(this.elements.buttons.fullscreen) {
			if(isFullscreen || toggle === false) {
				toggleClass(this.elements.container, this.settings.classes.fullscreen, false);
				toggleClass(this.elements.buttons.fullscreen.querySelector('.exit'), this.settings.classes.hidden, true);
				toggleClass(this.elements.buttons.fullscreen.querySelector('.enter'), this.settings.classes.hidden, false);
			}else if(!isFullscreen || toggle == true) {
				toggleClass(this.elements.container, this.settings.classes.fullscreen, true);
				toggleClass(this.elements.buttons.fullscreen.querySelector('.enter'), this.settings.classes.hidden, true);
				toggleClass(this.elements.buttons.fullscreen.querySelector('.exit'), this.settings.classes.hidden, false);
			}
		}
	}

	// 초기상태 
	// restart, replay
	reset() {
		if(this.elements.poster && hasClass(this.elements.poster, this.settings.classes.hidden)) {
			toggleClass(this.elements.poster, this.settings.classes.hidden, false);
		}
		this.setTogglePlayPause(false);
		this.setSeek();
		this.setProgress();
		if(this.settings.muted || this.player.defaultMuted) {
			this.setToggleMute(true);
		}else {
			this.setVolume(this.settings.volume);
		}
		triggerEvent(this.player, 'volumechange');
		this.setToggleFullscreen(false);

		// re-load
		this.player.load();
	}

	// 재생
	play() {	
		//let promisePlay;

		// promise 값 반환 : https://developers.google.com/web/updates/2016/03/play-returns-promise?hl=en
		//promisePlay = this.player.play(); 
		/*if(promisePlay !== undefined) {
			promisePlay
			.then(() => {
				this.player.play();
			})
			.catch((error) => {

			});
		}*/
		this.setTogglePlayPause(true);
	}

	// 정지
	pause() {
		this.setTogglePlayPause(false);
	}

	// 되감기
	rewind(seekTime) {
		if(!is.number(seekTime)) {
			seekTime = this.settings.seekTime;
		}
		this.setSeek(this.player.currentTime - seekTime);
	}

	// 빨리감기
	forward(seekTime) {
		if(!is.number(seekTime)) {
			seekTime = this.settings.seekTime;
		}
		this.setSeek(this.player.currentTime + seekTime);
	}

	// source url 
	/*source(source) {
		//let url = this.player.currentSrc;
		//return url || '';
	}*/

	// poster
	poster(source) {
		if(is.url(source)) {
			this.player.setAttribute('poster', source);
		}
	}
}