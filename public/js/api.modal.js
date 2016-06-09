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
