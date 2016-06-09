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

	// ajax
	if(!global.jQuery && global.api && global.api.xhr) {
		$.ajax = global.api.xhr;
	}

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
				"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
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

					// step
					this.elements.step = document.createElement('div');
					//this.elements.step.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.step);

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

					// folder
					this.elements.folder = document.createElement('div');
					//this.elements.folder.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.folder);

					// story
					this.elements.story = document.createElement('div');
					//this.elements.story.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.story);

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
					}
					if(/left$/.test(position)) {
						$(element).get(0).style.left = '0px';
					}else if(/right$/.test(position)) {
						$(element).get(0).style.right = '0px';
					}else if(/center$/.test(position)) {
						$(element).get(0).style.left = center['left'] + 'px';
					}
				}else if(typeof position === 'object') { // 사용자 설정값
					if('left' in position) {
						$(element).get(0).style.left = position['left'] + 'px';
					}else if('right' in position) {
						$(element).get(0).style.right = position['right'] + 'px';
					}
					if('top' in position) {
						$(element).get(0).style.top = position['top'] + 'px';
					}else if('bottom' in position) {
						$(element).get(0).style.bottom = position['bottom'] + 'px';
					}
				}
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
		that.time = null;
		that.before = { // 값 변경전 기존 설정값 저장
			'margin-right': '',
			'overflow': '',
			'position': '',
			'width': '',
			'height': ''
		};

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
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
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
				if(env['browser']['name'] === 'safari') {
					$(that.elements.mask).on(env['event']['down'] + '.EVENT_DOWN_' + that.settings.key, function(e) {
						module.stopCapture(e);
						module.stopBubbling(e);
					});
					$(that.elements.mask).on(env['event']['move'] + '.EVENT_MOVE_' + that.settings.key, function(e) {
						module.stopCapture(e);
						module.stopBubbling(e);
					});
					$(that.elements.mask).on(env['event']['up'] + '.EVENT_UP_' + that.settings.key, function(e) {
						module.stopCapture(e);
						module.stopBubbling(e);
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
				/*if(env['browser']['name'] === 'safari') {
					size = module.getWinDocWidthHeight();
					scroll = module.getScroll();
					that.elements.container.style.position = 'absolute';
					that.elements.container.style.left = scroll.left + 'px';
					that.elements.container.style.top = scroll.top + 'px';

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
				that.before['margin-right'] = $('html').css('margin-right');
				that.before['overflow'] = $('html').css('overflow');
				if(size.window.height < size.document.height) {
					$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
				}

				// iOS에서는 position: fixed 버그가 있음
				that.before['position'] = $('html').css('position');
				if(env['browser']['name'] === 'safari') {
					$('html').css({'position': 'fixed'});
				}

				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position(); // parent element 가 페인팅되어있지 않으면, child element 의 width, height 값을 구할 수 없다. (that.elements.contents 의 정확한 width, height 값을 알려면, 이를 감싸고 있는 that.elements.container 가 diplay block 상태에 있어야 한다.)
				//that.elements.contents.style.transition = 'all .3s';

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// resize 이벤트 실행 (이벤트 키는 that.settings.key 를 활용한다.)
				$(window).on(env['event']['resize'] + '.EVENT_RESIZE_' + that.settings.key, function(e) {
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
				$('html').css({'margin-right': that.before['margin-right'], 'overflow': that.before['overflow'], 'position': that.before['position']}); // 닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// resize 이벤트 종료
				$(window).off(env['event']['resize'] + '.EVENT_RESIZE_' + that.settings.key);

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
				$('html').css({'margin-right': that.before['margin-right'], 'overflow': that.before['overflow'], 'position': that.before['position']}); // 닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.
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
				$(window).off(env['event']['resize'] + '.EVENT_RESIZE_' + that.settings.key);

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
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
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
				$(window).on(env['event']['resize'] + '.EVENT_RESIZE_' + that.settings.key, function(e) {
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
				$(window).off(env['event']['resize'] + '.EVENT_RESIZE_' + that.settings.key);

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
				$(window).off(env['event']['resize'] + '.EVENT_RESIZE_' + that.settings.key);

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

	// step
	var ModalStep = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'display': {
				'index': false, // 현재 step 위치 출력여부
				'button': false // 이전, 다음 버튼 출력여부
			},
			'callback': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'prev': null, // 이전 콜백
				'next': null // 다음 콜백
			},
			'theme:': {}, // 테마 (스타일 변경)
			'prev': '', // .class 이번버튼
			'next': '', // .class 다음버튼
			'step': [] // 각 step 별로 설정값이 들어가 있음
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.index = 0;

		// private init
		module.init();
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};
			var li = '';
			var i, max;

			try {
				// key
				

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
					that.elements.mask = that.settings.mask;
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
					module.elements.step.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch;';
				for(i=0, max=that.settings.step.length; i<max; i++) {
					li += '<li></li>';
				}
				that.elements.container.innerHTML = '\
					<div id="" style="">\
						<ul>' + li + '</ul>\
					</div>\
					<div id="" style=""></div>\
					<div id="" style="">\
						<button id="" style="float: left;"></button>\
						<button id="" style="float: right;"></button>\
					</div>\
				';
				fragment.appendChild(that.elements.container);

				// search element
				//that.elements.title = that.elements.container.querySelector('#' + key.title);
				//that.elements.message = that.elements.container.querySelector('#' + key.message);
				//that.elements.cancel = that.elements.container.querySelector('#' + key.cancel);
				//that.elements.ok = that.elements.container.querySelector('#' + key.ok);

				// contents
				that.elements.contents = [];
				for(i=0, max=that.settings.step.length; i<max; i++) {
					that.elements.contents[i] = (typeof that.settings.step[i] === 'object' && that.settings.step[i].nodeType ? that.settings.step[i] : $('#' + that.settings.step[i]).get(0));
					that.elements.contents[i].style.display = 'none';
					//that.elements.container.appendChild(that.elements.contents[i]);
				}
				module.elements.step.appendChild(fragment);

				// event

			}catch(e) {
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, e);
				}
			}
		})();
	};
	ModalStep.prototype = {
		change: function() {

		},
		position: function() {
			
		},
		show: function() {

		},
		hide: function() {

		},
		prev: function() {

		},
		next: function() {

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
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
					module.elements.confirm.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 7px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08); outline: none;';
				that.elements.container.innerHTML = '\
					<div id="' + key.title + '" style="padding: 18px 18px 10px 18px; font-weight: bold; color: #333; background-color: rgba(255, 255, 255, .97); border-radius: 7px 7px 0 0;">' + that.settings.title + '</div>\
					<div id="' + key.message + '" style="padding: 10px 18px 18px 18px; min-height: 67px; color: #333; background-color: rgba(255, 255, 255, .97);">' + that.settings.message + '</div>\
					<div style="padding: 10px 18px; background: rgba(248, 249, 250, .97); text-align: right; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
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
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
					module.elements.alert.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 7px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08); outline: none;';
				that.elements.container.innerHTML = '\
					<div id="' + key.title + '" style="padding: 18px 18px 10px 18px; font-weight: bold; color: #333; background-color: rgba(255, 255, 255, .97); border-radius: 7px 7px 0 0;">' + that.settings.title + '</div>\
					<div id="' + key.message + '" style="padding: 10px 18px 18px 18px; min-height: 67px; color: #333; background-color: rgba(255, 255, 255, .97);">' + that.settings.message + '</div>\
					<div style="padding: 10px 18px; background: rgba(248, 249, 250, .97); text-align: right; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
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
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
					module.elements.push.appendChild(that.elements.mask);
				}

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 7px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08); outline: none;';
				that.elements.container.innerHTML = '\
					<div id="' + key.message + '" style="padding: 12px 12px 6px 12px; min-height: 33px; color: #333; background-color: rgba(255, 255, 255, .97); border-radius: 7px 7px 0 0;">' + that.settings.message + '</div>\
					<div style="padding: 6px 12px 12px 12px; background: rgba(248, 249, 250, .97); text-align: center; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
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

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// folder
	var ModalFolder = function(settings) {
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
				'title': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'grid': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.width = 300;
		that.width += env.browser.scrollbar; // 스크롤바 가로 픽셀

		// private init
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			// key
			key.header = getKey();
			key.title_input = getKey();
			key.title_button = getKey();
			key.close_button = getKey();
			key.grid = getKey();
			key.parent = getKey();

			// mask
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #F0F1F2 none repeat scroll 0 0; opacity: .7;';
				module.elements.push.appendChild(that.elements.mask);
			}else if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask = that.settings.mask;
				that.elements.mask.display = 'none';
			}

			// container
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; width: ' + that.width + 'px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .04); border: 1px solid rgb(240, 241, 242); border-radius: 7px; transition: left .5s, top .5s; outline: none;';
			that.elements.container.innerHTML = '\
				<!-- header //-->\
				<header id="' + key.header + '" style="margin: 0 auto; height: 50px; background-color: rgb(255, 255, 255); border-radius: 7px 7px 0 0;">\
					<!-- 폴더명 입력 //-->\
					<div style="position: absolute; left: 20px; top: 12px;">\
						<input type="text" name="" value="" id="' + key.title_input + '" style="padding: 5px; width: 170px; height: 17px; background-color: rgb(248, 249, 250); border: 0; font-size: 13px; color: #4C4D4E; border-radius: 7px;">\
						<button id="' + key.title_button + '" style="padding: 0px; display: inline-block; position: relative; left: -45px; border: 0; background-color: transparent; font-size: 13px;">Done</button>\
					</div>\
					<!-- 폴더 닫기 등 버튼 //-->\
					<div style="position: absolute; right: 20px; top: 14px;">\
						<button id="' + key.close_button + '" style="padding: 0px; border: 0; background-color: transparent; font-size: 13px;">Close</button>\
					</div>\
				</header>\
				<!-- grid //-->\
				<div style="max-height: 200px; background-color: rgba(255, 255, 255, .97); border-top: 1px dashed rgb(240, 241, 242); border-bottom: 1px dashed rgb(240, 241, 242); overflow-x: hidden; overflow-y: auto;">\
					<div id="' + key.grid + '" data-type="content" style="margin: 0 auto;">\
						<!-- grid 로딩 메시지 //-->\
						<div style="min-height: 100px; font-size: 14px; color: #E1E2E3; text-align: center;">Grid Lodding...</div>\
					</div>\
				</div>\
				<!-- parent grid move //-->\
				<div id="' + key.parent + '" data-type="parent" data-folder="' + that.settings['key'] + '" data-grid="' + that.settings['grid'] + '" style="margin: 0 auto; padding-top: 32px; height: 68px; font-size: 14px; color: #E1E2E3; text-align: center; background-color: rgb(255, 255, 255); border-radius: 0 0 7px 7px; -moz-user-select: none;">\
					<!-- 상위폴더로 이동할 경우 여기로 드래그 //-->\
					If you go to the parent folder<br>and drag it here\
				</div>\
			';
			fragment.appendChild(that.elements.container);
			module.elements.push.appendChild(fragment);

			// search element
			that.elements.header = that.elements.container.querySelector('#' + key.header);
			that.elements.title_input = that.elements.container.querySelector('#' + key.title_input);
			that.elements.title_button = that.elements.container.querySelector('#' + key.title_button);
			that.elements.close_button = that.elements.container.querySelector('#' + key.close_button);
			that.elements.grid = that.elements.container.querySelector('#' + key.grid);
			that.elements.parent = that.elements.container.querySelector('#' + key.parent);

			// event
			$(that.elements.title_button).on(env['event']['click'], function(e) {
				var event = e || window.event;
				var value = title_input.value;
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
				// 폴더 제목 변경
				if(typeof that.settings.callback.title === 'function') {
					that.settings.callback.title(encodeURIComponent(value || ''));
				}
			});
			// 폴더 닫기 버튼 이벤트
			$(that.elements.close_button).on(env['event']['down'], function(e) {
				var event = e || window.event;
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
				that.hide();
			});
		})();
	};
	ModalFolder.prototype = {
		change: function(settings) {

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
			
			// element
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
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
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			// element
			that.elements.container.style.display = 'none';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
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
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

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
			if(typeof parameter.callback === 'function') {
				parameter.callback.call(that);	
			}
		}
	};

	// story
	var ModalStory = (function() {
		// private init
		var init = (function() {
			// 모바일, PC 분기
			if(env['monitor'] === 'mobile') {
				return function() {
					var that = this;
					var fragment = document.createDocumentFragment();
					var key = {};

					// key
					key.header = getKey();
					key.progress = getKey();
					key.bar = getKey();
					key.content = getKey();
					key.iframe = getKey();
					key.button_group = getKey();
					key.button_refresh = getKey();
					key.button_hidden = getKey();
					key.button_close = getKey();

					// container
					/*
					-
					// 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
					-
					// iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
					// 그러므로 iframe 를 감싸는 content(div) 를 만든다.
					that.elements.content.style.boxSizing = that.elements.content.style.mozBoxSizing = that.elements.content.style.webkitBoxSizing = 'border-box';
					*/
					that.elements.container = document.createElement('section');
					that.elements.container.style.cssText = 'position: fixed; outline: none;'; // 모바일은 전체화면으로 출력
					that.elements.container.innerHTML = '\
						<!-- content //-->\
						<div id="' + key.content + '" style="clear: both; width: 100%; box-sizing: border-box; height: 382px;">\
							<iframe id="' + key.iframe + '" srcdoc="" marginheight="0" marginwidth="0" scrolling="auto" src="" style="margin: 0px; padding: 0px; pointer-events: auto; background-color: rgb(245, 246, 247); box-sizing: border-box;" frameborder="0" height="100%" width="100%"></iframe>\
						</div>\
						<!-- header //-->\
						<header id="' + key.header + '" style="position: fixed; bottom: 5px; right: 5px; box-sizing: border-box;">\
							<!-- progressbar //-->\
							<div id="' + key.progress + '" style="position: absolute; top: -4px; width: 100%;">\
								<div id="' + key.bar + '" style="background-color: rgba(237, 85, 101, 0.97); width: 100%; height: 3px; border-radius: 1px; display: none;"></div>\
							</div>\
							<!-- button //-->\
							<div id="' + key.button_group + '" style="background-color: rgba(44, 45, 46, 0.97); box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.1); border-radius: 7px;">\
								<button id="' + key.button_refresh + '" style="width: 40px; height: 40px; background-image: url(&quot;./images/popup-buttons-40.png&quot;); background-position: 0px 0px; background-repeat: no-repeat;"></button>\
								<button id="' + key.button_hidden + '" style="width: 40px; height: 40px; background-image: url(&quot;./images/popup-buttons-40.png&quot;); background-position: -40px 0px; background-repeat: no-repeat;"></button>\
								<button id="' + key.button_close + '" style="width: 40px; height: 40px; background-image: url(&quot;./images/popup-buttons-40.png&quot;); background-position: -80px 0px; background-repeat: no-repeat;"></button>\
							</div>\
						</header>\
					';
					fragment.appendChild(that.elements.container);
					module.elements.story.appendChild(fragment);

					// search element
					that.elements.header = that.elements.container.querySelector('#' + key.header);
					that.elements.progress = that.elements.container.querySelector('#' + key.progress);
					that.elements.bar = that.elements.container.querySelector('#' + key.bar);
					that.elements.content = that.elements.container.querySelector('#' + key.content);
					that.elements.iframe = that.elements.container.querySelector('#' + key.iframe);
					that.elements.button_group = that.elements.container.querySelector('#' + key.button_group);
					that.elements.button_refresh = that.elements.container.querySelector('#' + key.button_refresh);
					that.elements.button_hidden = that.elements.container.querySelector('#' + key.button_hidden);
					that.elements.button_close = that.elements.container.querySelector('#' + key.button_close);

					// safari 에서는 iframe 내부에 스크롤바가 생기도록 하려면 아래 div 가 필요하다.
					if(env['browser']['name'] === 'safari') {
						that.elements.content.style.cssText = "overflow: auto; -webkit-overflow-scrolling: touch;"; // webkitOverflowScrolling
					}

					// event
					that.elements.iframe.onload = that.imports.bind(that);
					$(that.elements.button_refresh).on(env['event']['down'], function(e) { // iframe 새로고침
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
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

						//that.elements.iframe.contentWindow.location.reload(true); // 비표준
						//that.elements.iframe.src += '';
						that.imports.call(that);
					});
					$(that.elements.button_hidden).on(env['event']['down'], function(e) { // 팝업 숨기기
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

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

						//that.elements.container.style.display = 'none';
						that.hide();
					});
					$(that.elements.button_close).on(env['event']['down'], function(e) { // 팝업 닫기 (element 삭제)
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
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

						// iframe 중지
						that.elements.iframe.onload = null;
						//that.elements.container.style.display = 'none';
						that.remove();
					});
				};
			}else {
				return function() {
					var that = this;
					var fragment = document.createDocumentFragment();
					var key = {};

					// key
					key.header = getKey();
					key.title = getKey();
					key.progress = getKey();
					key.bar = getKey();
					key.content = getKey();
					key.iframe = getKey();
					key.button_group = getKey();
					key.button_refresh = getKey();
					key.button_hidden = getKey();
					key.button_size = getKey();
					key.button_close = getKey();
					key.right_resize = getKey();
					key.bottom_resize = getKey();
					key.right_bottom_resize = getKey();

					// resize 버튼 크기
					var resize_domain = 0; 
					if(env['check']['touch'] === true) { // 터치 기기에서는 사용자 손가락 터치 영역을 고려하여 범위를 넓게 한다.
						resize_domain = 16;
					}else {
						resize_domain = 10;
					}

					// container
					that.elements.container = document.createElement('section');
					that.elements.container.style.cssText = 'position: fixed; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .04); border: 1px solid rgb(44, 45, 46); outline: none;'; // border 스타일 변경시 리사이즈 후 스타일도 함께 변경해 줘야한다.
					that.elements.container.innerHTML = '\
						<!-- header //-->\
						<header id="' + key.header + '" style="position: relative; width: 100%; height: 30px; background-color: rgba(44, 45, 46, 0.97); box-sizing: border-box;">\
							<!-- title //-->\
							<div id="' + key.title + '" style="position: absolute; top: 7px; left: 18px; font-size: 12px; color: rgb(217, 217, 217); cursor: move; -moz-user-select: none;">' + that.settings.title + '</div>\
							<!-- progress //-->\
							<div id="' + key.progress + '" style="position: absolute; width: 100%; bottom: -4px;">\
								<div id="' + key.bar + '" style="background-color: rgba(237, 85, 101, 0.97); width: 100%; height: 3px; border-radius: 1px; display: none;"></div>\
							</div>\
							<!-- button //-->\
							<div id="' + key.button_group + '" style="position: absolute; top: 0px; right: 0px; padding: 0px 9px;">\
								<button id="' + key.button_refresh + '" style="width: 30px; height: 30px; background-image: url(&quot;./images/popup-buttons-30.png&quot;); background-position: 0px 0px; background-repeat: no-repeat;"></button>\
								<button id="' + key.button_hidden + '" style="width: 30px; height: 30px; background-image: url(&quot;./images/popup-buttons-30.png&quot;); background-position: -30px 0px; background-repeat: no-repeat;"></button>\
								' + (env['check']['fullscreen'] === true ? '<button id="' + key.button_size + '" style="width: 30px; height: 30px; background-image: url(&quot;./images/popup-buttons-30.png&quot;); background-position: -60px 0px; background-repeat: no-repeat;"></button>' : '') + '\
								<button id="' + key.button_close + '" style="width: 30px; height: 30px; background-image: url(&quot;./images/popup-buttons-30.png&quot;); background-position: -90px 0px; background-repeat: no-repeat;"></button>\
							</div>\
						</header>\
						<!-- content //-->\
						<div id="' + key.content + '" style="width: 100%; clear: both; box-sizing: border-box; height: 352px;">\
							<iframe id="' + key.iframe + '" width="100%" height="100%" frameborder="0" style="margin: 0px; padding: 0px; pointer-events: auto; background-color: rgb(245, 246, 247); box-sizing: border-box;" src="" scrolling="auto" marginwidth="0" marginheight="0" srcdoc=""></iframe>\
						</div>\
						<!-- resize //-->\
						<div id="' + key.right_resize + '" style="top: 0px; right: -' + resize_domain + 'px; width: ' + resize_domain + 'px; height: 100%; cursor: e-resize; position: absolute; display: block;"></div>\
						<div id="' + key.bottom_resize + '" style="left: 0px; bottom: -' + resize_domain + 'px; width: 100%; height: ' + resize_domain + 'px; cursor: s-resize; position: absolute; display: block;"></div>\
						<div id="' + key.right_bottom_resize + '" style="right: -' + resize_domain + 'px; bottom: -' + resize_domain + 'px; width: ' + resize_domain + 'px; height: ' + resize_domain + 'px; cursor: se-resize; position: absolute; display: block;"></div>\
					';
					fragment.appendChild(that.elements.container);
					module.elements.story.appendChild(fragment);

					// search element
					/*
					-
					// 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
					-
					// iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
					// 그러므로 iframe 를 감싸는 content(div) 를 만든다.
					*/
					that.elements.header = that.elements.container.querySelector('#' + key.header);
					that.elements.title = that.elements.container.querySelector('#' + key.title);
					that.elements.progress = that.elements.container.querySelector('#' + key.progress);
					that.elements.bar = that.elements.container.querySelector('#' + key.bar);
					that.elements.content = that.elements.container.querySelector('#' + key.content);
					that.elements.iframe = that.elements.container.querySelector('#' + key.iframe);
					that.elements.button_group = that.elements.container.querySelector('#' + key.button_group);
					that.elements.button_refresh = that.elements.container.querySelector('#' + key.button_refresh);
					that.elements.button_hidden = that.elements.container.querySelector('#' + key.button_hidden);
					that.elements.button_size = that.elements.container.querySelector('#' + key.button_size);
					that.elements.button_close = that.elements.container.querySelector('#' + key.button_close);
					that.elements.right_resize = that.elements.container.querySelector('#' + key.right_resize);
					that.elements.bottom_resize = that.elements.container.querySelector('#' + key.bottom_resize);
					that.elements.right_bottom_resize = that.elements.container.querySelector('#' + key.right_bottom_resize);

					// event
					that.elements.iframe.onload = that.imports.bind(that);
					$(that.elements.button_refresh).on(env['event']['down'], function(e) { // iframe 새로고침
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
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

						//that.elements.iframe.contentWindow.location.reload(true); // 비표준
						//that.elements.iframe.src += '';
						that.imports.call(that);
					});
					$(that.elements.button_hidden).on(env['event']['down'], function(e) { // 팝업 숨기기
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

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

						//that.elements.container.style.display = 'none';
						that.hide();
					});
					$(that.elements.button_size).on(env['event']['down'], function(e) { // // fullscreen button
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						if(((document.fullscreenElement && document.fullscreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen)) {
							// 축소
							if(document.exitFullscreen) {
								document.exitFullscreen();
							}else if(document.mozCancelFullScreen) {
								document.mozCancelFullScreen();
							}else if(document.webkitExitFullscreen) {
								document.webkitExitFullscreen();
							}
						}else {
							// 확대
							if(that.elements.iframe.requestFullscreen) {
								that.elements.iframe.requestFullscreen();
							}else if(that.elements.iframe.mozRequestFullScreen) {
								that.elements.iframe.mozRequestFullScreen();
							}else if(that.elements.iframe.webkitRequestFullscreen) {
								that.elements.iframe.webkitRequestFullscreen();
							}else if(that.elements.iframe.msRequestFullscreen) {
								that.elements.iframe.msRequestFullscreen();
							}
						}

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
					});
					$(that.elements.button_close).on(env['event']['down'], function(e) { // 팝업 닫기 (삭제)
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
						
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

						// iframe 중지
						that.elements.iframe.onload = null;
						//that.elements.container.style.display = 'none';
						that.remove();
					});
					$(that.elements.header).on(env['event']['down'], function(e) { // 팝업이동 mouse down
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

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

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}

						// button_group 내부에서 클릭된 이벤트
						if($(that.elements.button_group).contains(event.target)) {
							console.log('[경고] button_group 내부 target');
							return false;
						}

						// 팝업의 마지막 left, top 값을 초기화 한다.
						that.left = 0;
						that.top = 0;

						// z-index
						module.zindex += 1;
						that.elements.container.style.zIndex = module.zindex;

						// 마우스 위치
						var mouse = {
							'down': {
								'left': 0,
								'top': 0
							},
							'move': {
								'left': 0,
								'top': 0
							}
						};
						if(touch) {
							mouse.down.top = touch[0].pageY;
							mouse.down.left = touch[0].pageX;
						}else {
							mouse.down.top = event.pageY;
							mouse.down.left = event.pageX;
						}
						mouse.down.top = mouse.down.top - Number(String(that.elements.container.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));
						mouse.down.left = mouse.down.left - Number(String(that.elements.container.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));

						// snap 대상 element 배열에 저장
						var snap = [];
						var section = module.elements.story.querySelectorAll('section');
						var i, max;
						for(i=0, max=section.length; i<max; i++) {
							// 현재 element(story)를 제외한 element 들을 리스트에 담는다 (현재 display되고 있는 다른 story layer)
							if(that.elements.container.isEqualNode(section[i]) === false && section[i].style && section[i].style.display !== 'none') { 
								snap.push({
									'top': parseInt(section[i].offsetTop),
									'left': parseInt(section[i].offsetLeft),
									'bottom': parseInt(section[i].offsetTop + section[i].offsetHeight),
									'right': parseInt(section[i].offsetLeft + section[i].offsetWidth)
								});
							}
						}

						// mouse move (left, top 이동)
						that.elements.iframe.style.pointerEvents = 'none';
						$(window).on(env['event']['move'] + '.EVENT_MOUSEMOVE_popup_story_move', function(e) {
							var event = e || window.event;
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches || event.changedTouches;

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

							// 마우스 위치
							if(touch) {
								mouse.move.top = touch[0].pageY;
								mouse.move.left = touch[0].pageX;
							}else {
								mouse.move.top = event.pageY;
								mouse.move.left = event.pageX;
							}

							// 현재 팝업의 위치(영역)
							var top = (mouse.move.top - mouse.down.top);
							var left = (mouse.move.left - mouse.down.left);
							var bottom = parseInt(top + that.elements.container.offsetHeight);
							var right = parseInt(left + that.elements.container.offsetWidth);

							// 스크롤 제어
							that.elements.container.scrollIntoView(false); // true 일 경우 엘리먼트가 스크롤 영역의 상단에 위치하도록 스크롤 됩니다. 만약  false 인 경우 스크롤 영역의 하단에 위치하게 됩니다.
							//that.elements.container.scrollIntoView({block: "end", behavior: "instant"}); // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView

							// snap 영역 검사
							var i, max;
							var interval = that.snap; // snap 을 발생시키도록하는 element와 element 간의 간격
							for(i=0, max=snap.length; i<max; i++) {
								/*
								-
								사각형(top, left, bottom, right) snap 가능 영역 산정
								top영역: (snap[i].top - interval)
								left영역: (snap[i].left - interval)
								bottom영역: (snap[i].bottom + interval)
								righr영역: (snap[i].right + interval)
								위 영역(다른 팝업 element)안으로 움직이고 있는 팝업이 들어오면 snap 을 검사한다.
								*/
								if(top < (snap[i].bottom + interval) && bottom > (snap[i].top - interval) && right > (snap[i].left - interval) && left < (snap[i].right + interval)) {
									// left 또는 right
									if(Math.abs(snap[i].left - left) <= interval) {
										left = snap[i].left;
									}else if(Math.abs(snap[i].left - right) <= interval) {
										left = snap[i].left - that.elements.container.offsetWidth;
									}else if(Math.abs(snap[i].right - right) <= interval) {
										left = snap[i].right - that.elements.container.offsetWidth;
									}else if(Math.abs(snap[i].right - left) <= interval) {
										left = snap[i].right;
									}

									// top 또는 bottom
									if(Math.abs(snap[i].top - top) <= interval) {
										top = snap[i].top;
									}else if(Math.abs(snap[i].top - bottom) <= interval) {
										top = snap[i].top - that.elements.container.offsetHeight;
									}if(Math.abs(snap[i].bottom - bottom) <= interval) {
										top = snap[i].bottom - that.elements.container.offsetHeight;
									}else if(Math.abs(snap[i].bottom - top) <= interval) {
										top = snap[i].bottom;
									}

									break;
								}
							}
							
							// 위치 적용
							if(0 <= top) {
								that.elements.container.style.top = top + 'px';
							}
							if(0 <= left) {
								that.elements.container.style.left = left + 'px';
							}
						});
						// mouse up
						$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_popup_story_move', function(e) {
							var event = e || window.event;
							var touch = event.changedTouches; // touchend

							// 현재 이벤트의 기본 동작을 중단한다.
							if(event.preventDefault) { 
								event.preventDefault();
							}else {
								event.returnValue = false;
							}

							$(window).off('.EVENT_MOUSEMOVE_popup_story_move');
							$(window).off('.EVENT_MOUSEUP_popup_story_move');
							that.elements.iframe.style.pointerEvents = 'auto';
						});
					});

					// resize event
					var setMousePositionOn = function(callback) {
						if(!callback || typeof callback !== 'function') {
							return false;
						}
						
						// z-index
						module.zindex += 1;
						that.elements.container.style.zIndex = module.zindex;

						console.log('on');
						that.elements.container.style.border = '1px dashed rgb(44, 45, 46)';
						$('iframe', module.elements.story).css({'pointerEvents': 'none'});
						$(window).on(env['event']['move'] + '.EVENT_MOUSEMOVE_popup_story_resize', function(e) {
							var event = e || window.event;
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches || event.changedTouches;

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

							/*
							pageX/pageY : <html> element in CSS pixels.
							clientX/clientY : viewport(browser) in CSS pixels.
							screenX/screenY : screen in device pixels.
							*/
							var top, left;
							// 마우스 위치
							if(touch) {
								top = touch[0].clientY;
								left = touch[0].clientX;
							}else {
								top = event.clientY;
								left = event.clientX;
							}

							//console.log('top: ' + top + ', left: ' + left);
							callback({'top': top, 'left': left});
						});
					};
					var setMousePositionOff = function(callback) {
						$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_popup_story_resize', function(e) {
							var event = e || window.event;
							var touch = event.changedTouches; // touchend

							console.log('off');
							$(window).off('.EVENT_MOUSEMOVE_popup_story_resize');
							$(window).off('.EVENT_MOUSEUP_popup_story_resize');
							$('iframe', module.elements.story).css({'pointerEvents': 'auto'});
							//that.elements.iframe.style.pointerEvents = 'auto';
							that.elements.container.style.border = '1px solid rgb(44, 45, 46)';
							document.documentElement.style.cursor = 'auto'; // <html>
							if(callback && typeof callback === 'function') {
								callback();
							}
						});
					};
					
					// localStorage 에 width, height 의 값을 저장한다.
					$(that.elements.right_resize).on(env['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
				
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

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}
				
						document.documentElement.style.cursor = 'e-resize'; // <html>
						setMousePositionOn(function(position) {
							var position = position || {};
							var left = position.left || 0;
							var top = position.top || 0;
				
							left -= Number(String(that.elements.container.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
							left -= resize_domain; // resize 버튼 크기
							if(0 <= left && that.settings.min.width <= left) {
								window.localStorage.setItem(('modal' + that.settings.key + 'width'), left);
								that.elements.container.style.width = left + 'px';
							}
						});
						setMousePositionOff();
					});
					$(that.elements.bottom_resize).on(env['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
				
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

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}
				
						document.documentElement.style.cursor = 's-resize'; // <html>
						setMousePositionOn(function(position) {
							var position = position || {};
							var left = position.left || 0;
							var top = position.top || 0;
				
							top -= Number(String(that.elements.container.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
							top -= resize_domain; // resize 버튼 크기
							if(0 <= top && that.settings.min.height <= top) {
								window.localStorage.setItem(('modal' + that.settings.key + 'height'), top);
								that.elements.container.style.height = top + 'px';
								//that.elements.content.style.height = (Number(String(that.elements.container.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.container.style.borderTopWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.container.style.borderBottomWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height)).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
								that.elements.content.style.height = (Number(String(that.elements.container.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
							}
						});
						setMousePositionOff();
					});
					$(that.elements.right_bottom_resize).on(env['event']['down'], function(e) {
						var event = e || window.event;
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart
				
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

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}
				
						document.documentElement.style.cursor = 'se-resize'; // <html>
						setMousePositionOn(function(position) {
							var position = position || {};
							var left = position.left || 0;
							var top = position.top || 0;
				
							left -= Number(String(that.elements.container.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
							left -= resize_domain;
							if(0 <= left && that.settings.min.width <= left) {
								window.localStorage.setItem(('modal' + that.settings.key + 'width'), left);
								that.elements.container.style.width = left + 'px';
							}
							top -= Number(String(that.elements.container.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
							top -= resize_domain;
							if(0 <= top && that.settings.min.height <= top) {
								window.localStorage.setItem(('modal' + that.settings.key + 'height'), top);
								that.elements.container.style.height = top + 'px';
								//that.elements.iframe.height = Number(String(that.elements.container.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));
								//that.elements.content.style.height = (Number(String(that.elements.container.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.container.style.borderTopWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.container.style.borderBottomWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
								that.elements.content.style.height = (Number(String(that.elements.container.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
							}
						});
						setMousePositionOff();
					});
				};
			}
		})();
		var ModalStory = function(settings) {
			var that = this;
			that.settings = {
				'key': '',
				'callback': {
					'show': null,
					'hide': null,
					'remove': null,
					'error': null
				},
				'theme:': {}, // 테마 (스타일 변경)
				'title': '',
				'min': { // 최소 크기
					'width': 300,
					'height': 300
				}
			};
			that.settings = module.setSettings(that.settings, settings);
			that.elements = {};

			// story 팝업간 차이
			that.gap = 20; 
			// snap 을 발생시키도록하는 element와 element 간의 간격
			that.snap = 10; 
			// 마지막 열었던 story 팝업 left, top 값
			that.left = 0;
			that.top = 0;

			// private init
			init.call(that);
		};
		ModalStory.prototype = {
			change: function(settings) {

			},
			show: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var size;

				// 이미 show 되어 있는 상태인지 확인

				
				// element
				if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				if(env['monitor'] === 'mobile') {
					// 모바일에서의 style
					size = module.getWinDocWidthHeight();
					that.elements.container.style.width = (size.window.width - env['browser']['scrollbar']) + 'px';
					that.elements.container.style.height = size.window.height + 'px';
					that.elements.content.style.height = size.window.height + 'px';
					
					//
					that.elements.container.style.left = '0px';
					that.elements.container.style.top = '0px';
				}else {
					// that.settings.key, 'modal' 값으로 localStorage 에 width, height 의 마지막 값이 저장되어 있는지 확인한다.
					that.elements.container.style.width = (window.localStorage.getItem(('modal' + that.settings.key + 'width')) || that.settings.min.width) + 'px';
					that.elements.container.style.height = (window.localStorage.getItem(('modal' + that.settings.key + 'height')) || that.settings.min.height) + 'px';
					that.elements.content.style.height = (Number(String(that.elements.container.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';

					// childElementCount 를 활용하여 story 팝업 element개수 * childElementCount 계산하여 사용하자
					if((that.gap * 5) < that.left || (that.gap * 5) < that.top) {
						that.left = 0;
						that.top = 0;
					}
					that.left += that.gap;
					that.top += that.gap;
					that.elements.container.style.left = that.left + 'px';
					that.elements.container.style.top = that.top + 'px';
				}
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';

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
			},
			hide: function(parameter) {
				var that = this;
				var parameter = parameter || {};

				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// story 팝업의 겹쳐서 열리는 것을 방지하기 위한 값 다시계산
				if(0 <= (that.left - that.gap)) {
					that.left -= that.gap;
				}
				if(0 <= (that.top - that.gap)) {
					that.top -= that.gap;
				}

				// callback
				if(typeof that.settings.callback.hide === 'function') {
					that.settings.callback.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			},
			remove: function(parameter) {
				var that = this;
				var parameter = parameter || {};

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
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);	
				}
			},
			imports: function(parameter) { // story 내부 html 불러오기
				var that = this;
				var parameter = parameter || {};

				/*
				오프라인 실행과 온라인 실행을 구분
				오프라인: that.settings.url 값이 있음
				*/
				$.ajax({
					'type': 'get',
					'url': './grid/story', 
					'data': {
						'block': that.settings['key']
					},
					'progressDownload': function(progress) {
						//console.log(progress);
						if(typeof that.elements.bar === 'object') {
							that.elements.bar.style.display = 'block';
							that.elements.bar.style.width = progress + '%';
							if(progress >= 100) {
								that.elements.bar.style.display = 'none';
							}
						}
					},
					'success': function(html) {
						that.elements.iframe.onload = null; // 이벤트 정지
						//console.log('load HTML: ' + html);

						// sandbox
						//that.elements.iframe.sandbox = "allow-script"; // iframe 내부 스크립트

						// srcdoc: 
						// 코드 중 큰따옴표("")를 사용해서는 안 되므로 대신 &quot;를 사용해야 한다.
						// src 속성과 srcdoc 속성을 둘다 지정했을 때는 srcdoc 속성이 우선되며, srcdoc가 지원하지 않는 브라우저에서는 src 속성이 동작하게 됩니다.
						// https://github.com/jugglinmike/srcdoc-polyfill
						that.elements.iframe.srcdoc = decodeURIComponent(html || ''); // encodeURIComponent / decodeURIComponent

						// html
						//(that.elements.iframe.contentDocument || that.elements.iframe.contentWindow.document).body.innerHTML = 'test'; // body
						//(that.elements.iframe.contentDocument || that.elements.iframe.contentWindow.document).write('test'); // body
						//(that.elements.iframe.contentDocument || that.elements.iframe.contentWindow.document).documentElement.innerHTML = html;

						// srcdoc 폴리필


						// callback
						if(typeof parameter.callback === 'function') {
							parameter.callback.call(that);	
						}
					}
				});
			}
		};
		//
		return ModalStory;
	})();

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// public return
	return {
		setup: function(settings) {
			// 인스턴스 생성
			var instance;
			if(settings['key'] && module.instance[settings['key']]) {
				instance = module.instance[settings['key']];
				if(instance.change) {
					instance.change(settings);
				}
			}else {				
				switch(settings['type']) {
					case 'layer':
						if(settings['key']) { // 중복생성 방지
							instance = new ModalLayer(settings);
						}
						break;
					case 'rect':
						if(settings['key']) { // 중복생성 방지
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
					case 'folder':
						if(settings['key']) { // 중복생성 방지
							instance = new ModalFolder(settings);
						}
						break;
					case 'story':
						if(settings['key']) { // 중복생성 방지
							instance = new ModalStory(settings);
						}
						break;
				}
				if(settings['key']) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		search: function(key) {
			return module.instance[key] || false;
		}
	};

}, this);
