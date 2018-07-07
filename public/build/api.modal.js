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

-
mask(딤드) 배경색
연함: layer, rect
진함: confirm, alert, puch
진함: folder,
아주연함: bunch, market

-
contents: left, top 위치 설정된 영역
container(wrap): contents를 감싸고 있는 영역
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

	// ajax (folder, story, market 등에서 사용)
	if(!global.jQuery && global.api && global.api.xhr) {
		$.ajax = global.api.xhr;
	}

	// 환경정보
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
				"click": "click"
			}
		};
		(function() {
			var agent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
			var platform = navigator.platform;
			var offset_name, offset_version;

			// monitor
			if(/android/i.test(agent)) { // 안드로이드
				// mobile 없으면 태블릿임
				if(/mobile/i.test(agent)) {
					env['monitor'] = 'mobile';
				}else {
					env['monitor'] = 'tablet';
				}
			}else if(/(iphone|ipad|ipod)/i.test(agent)) { // 애플
				if(/ipad/i.test(agent)) {
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
			if((offset_version = agent.indexOf("opr/")) !== -1) {
				env['browser']['name'] = "opera";
				env['browser']['version'] = agent.substring(offset_version + 4);
			}else if((offset_version = agent.indexOf("opera")) !== -1) {
				env['browser']['name'] = "opera";
				env['browser']['version'] = agent.substring(offset_version + 6);
				if((offset_version = agent.indexOf("version")) !== -1) {
					env['browser']['version'] = agent.substring(offset_version + 8);
				}
			}else if((offset_version = agent.indexOf("msie")) !== -1) {
				env['browser']['name'] = "explorer";
				env['browser']['version'] = agent.substring(offset_version + 5);
			}else if((offset_version = agent.indexOf("chrome")) !== -1) {
				env['browser']['name'] = "chrome";
				env['browser']['version'] = agent.substring(offset_version + 7);
			}else if((offset_version = agent.indexOf("safari")) !== -1) {
				env['browser']['name'] = "safari";
				env['browser']['version'] = agent.substring(offset_version + 7);
				if((offset_version = agent.indexOf("version")) !== -1) {
					env['browser']['version'] = agent.substring(offset_version + 8);
				}
			}else if((offset_version = agent.indexOf("firefox")) !== -1) {
				env['browser']['name'] = "firefox";
				env['browser']['version'] = agent.substring(offset_version + 8);
			}else if((offset_name = agent.lastIndexOf(' ') + 1) < (offset_version = agent.lastIndexOf('/'))) {
				env['browser']['name'] = agent.substring(offset_name, offset_version);
				env['browser']['version'] = agent.substring(offset_version + 1);
				if(env['browser']['name'].toLowerCase() === env['browser']['name'].toUpperCase()) {
					env['browser']['name'] = navigator.appName;
				}
			}
			if((offset_version = env['browser']['version'].indexOf(';')) !== -1) {
				env['browser']['version'] = env['browser']['version'].substring(0, offset_version);
			}
			if((offset_version = env['browser']['version'].indexOf(' ')) !== -1) {
				env['browser']['version'] = env['browser']['version'].substring(0, offset_version);
			}

			// event
			if(env['check']['touch'] === true) {
				env['event']['down'] = 'touchstart';
				env['event']['move'] = 'touchmove';
				env['event']['up'] = 'touchend';
				if(/(iphone|ipad|ipod)/i.test(agent)) {
					env['event']['click'] = 'touchend';
				}
			}
		})();
	}

	// 모듈 (private)
	var module = (function() {
		function ModalModule() {
			var that = this;
			// IOS여부
			that.isIOS = /(iphone|ipad|ipod)/i.test((navigator.userAgent || navigator.vendor || window.opera).toLowerCase());
			// 팝업 z-index 관리
			that.zindex = 200;
			// 현재 포커스 위치
			that.active;
			// key가 있는 인스턴스
			that.instance = {};
			// element
			that.elements = {};
			// 실행 큐
			that.queue = {
				// 현재 show 되어있는 모달 순서
				'order': [],
				// 순차적으로 실행 (confirm, alert)
				'wait': [],
				// 위치 (겹쳐서 보이는 것 방지)
				'position': {
					'topleft': [],
					'topcenter': [],
					'topright': [],
					'bottomleft': [],
					'bottomcenter': [],
					'bottomright': [],
					'centerleft': [],
					'center': [],
					'centerright': []
				}
			};
			// 현재 설정된 기본 Style
			that.before = (function() {
				var html = $('html');
				return {
					'margin-right': html.css('margin-right') || 0, // document.documentElement.style.marginRight
					'overflow': html.css('overflow') || 'visible', // document.documentElement.style.overflow
					'position': html.css('position') || 'static' // document.documentElement.style.position
				};
			})();
			// 초기실행 
			that.init();
			that.event();
		}
		ModalModule.prototype = {
			// 초기화 
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

					// folder
					this.elements.folder = document.createElement('div');
					//this.elements.folder.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.folder);

					// story
					this.elements.story = document.createElement('div');
					//this.elements.story.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.story);

					// bunch
					this.elements.bunch = document.createElement('div');
					//this.elements.bunch.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.bunch);

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
			// 공통 이벤트 실행 
			event: function(is) {
				var that = this;
				var isCheck = function(key) {
					var is = false;
					if(key && key in that.instance && typeof that.instance[key].settings === 'object') {
						is = true;
					}
					return is;
				};

				// true: 이벤트 on, false: 이벤트 off
				if(typeof is !== 'boolean') {
					is = true;
				}

				// 키보드 이벤트
				$(document).off('.EVENT_KEYUP_DOCUMENT_MODAL');
				if(is === true) {
					$(document).on('keyup.EVENT_KEYUP_DOCUMENT_MODAL', function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						var code = event.which || event.keyCode;
						var count = that.queue.order.length;
						var key = count && that.queue.order[count-1] || null;

						// settings 에 esc 닫기실행 값이 true인 것만 작동한다.
						if(code === 27 && key && isCheck(key) && that.instance[key].settings.esc === true) { // esc
							if(typeof that.instance[key].hide === 'function') {
								that.instance[key].hide();
							}
						}
					});
				}
			},
			// 기본 설정값 변경 
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
			// key (일반적인 고유값)
			getKey: (function(){
				if(global.api && global.api.key) {
					return global.api.key;
				}else {
					return function() {
						return ['api', new Date().getTime(), (Math.random() * (1 << 30)).toString(16).replace('.', '')].join('').substr(0, 24);
					};
				}
			})(),
			// window, document 사이즈
			getWindowDocumentSize: function() {
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
			getBrowserScroll: function() {
				if('pageXOffset' in window && 'pageYOffset' in window) {
					return {'left': window.pageXOffset, 'top': window.pageYOffset};
				}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
					return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
				}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
					return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
				}else {
					return {'left': 0, 'top': 0};
				}
			},
			// Get the focused element
			getFocusElement: function() {
				var focused = document.activeElement;

				if(!focused || focused === document.body) {
					focused = null;
				}else if(document.querySelector) {
					focused = document.querySelector(':focus');
				}

				return focused;
			},
			// element 가 현재 브라우저창 크기보다 더 큰지 여부
			isBrowserOut: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var element = parameter['element']; // 출력할 element

				var is = false;
				var browser = {};
				var info = {};
				var width = 0, height = 0;

				browser = {
					'width': window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
					'height': window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight
				};
				info = element.getBoundingClientRect(); // getBoundingClientRect 함수는 읽기 전용값 반환
				if('width' in info && 'height' in info) {
					width = info.width;
					height = info.height;
				}else {
					//width = offsetWidth;
					width = info.right - info.left;
					//height = offsetHeight;
					height = info.bottom - info.top;
				}
				if(browser.width < width || browser.height < height) {
					is = true;
				}

				return is;
			},
			// 위치설정
			setPosition: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var position = parameter['position'];
				var element = parameter['element'];

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
						size = this.getWindowDocumentSize();

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
			// 서로 겹치지 않도록 제어
			setQueuePosition: function(parameter) {
				/*
				position: 이동할 위치
				element: 우선 보이도록 할 modal
				out: 브라우저 영역 밖으로 이동가능(true), 브라우저 영역 밖으로 이동불가능(false)

				element 값이 없을 경우,
				현재 출력되고 있는 layer의 위치를 자동 조절한다.
				*/
				var that = this;
				var parameter = parameter || {};
				var position = parameter['position'];
				var element = parameter['element'];
				var out = parameter['out'];

				var i, min;
				var key, rect, tmp;
				var width = 0, height = 0;
				var left = 0, right = 0, top = 0, bottom = 0;
				var size = that.getWindowDocumentSize();

				if(position && that.queue['position'][position] && that.queue['position'][position].length) {
					// 화면에 출력할 element 크기
					if(typeof element === 'object') {
						width = Math.round($(element).outerWidth(true));
						height = Math.round($(element).outerHeight(true));
					}
					left += width;
					right += width;
					top += height;
					bottom += height;
					// 현재 출력되어 있는 element 위치 조정
					for(i=(that.queue['position'][position].length-1), min=0; min<=i; i--) {
						key = that.queue['position'][position][i];
						if(that.instance[key] && that.instance[key].elements && that.instance[key].elements.contents) {
							// mask 는 제외한다.
							if(that.instance[key].settings && that.instance[key].settings.mask) {
								continue;
							}

							// center
							// topleft, topcenter, topright
							// bottomleft, bottomcenter, bottomright
							// centerleft, center, centerright
							if(/^top/.test(position)) {
								// 브라우저 크기를 벗어나면 이동정지
								/*if(out === false && size.window.height < top) {
									break;
								}*/
								that.instance[key].elements.contents.style.top = top + 'px';
							}else if(/^bottom/.test(position)) {
								/*if(out === false && size.window.height < bottom) {
									break;
								}*/
								that.instance[key].elements.contents.style.bottom = bottom + 'px';
							}

							// 다음 element 위치
							// 현재 element 기준 width, height 값만큼 이동
							/*
							rect = that.instance[key].elements.contents.getBoundingClientRect();
							width = 'width' in rect ? rect.width : rect.right - rect.left;
							height = 'height' in rect ? rect.height : rect.bottom - rect.top;
							*/
							width = Math.round($(that.instance[key].elements.contents).outerWidth(true));
							height = Math.round($(that.instance[key].elements.contents).outerHeight(true));
							left += width;
							right += width;
							top += height;
							bottom += height;
						}
					}
				}
			},
			// 지정된 위치 기준점으로 modal 출력
			setRect: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var position = parameter['position'];
				var element = parameter['element']; // 출력할 element
				var rect = parameter['rect']; // 출력위치 기준이 되는 element
				var fixed = parameter['fixed']; // 화면 고정된 element 여부 (position: fixed; 여부)

				var width, height;
				var target = {};
				var info = rect.getBoundingClientRect();
				var scroll = this.getBrowserScroll();
				var tmp;

				// element 크기
				width = Math.round($(element).outerWidth(true));
				height = Math.round($(element).outerHeight(true));

				// target 정보 (rect)
				target.left = info.left + (fixed === true ? 0 : scroll.left);
				target.top = info.top + (fixed === true ? 0 : scroll.top);
				target.width = Math.round($(rect).outerWidth()); // margin 값까지 포함하면 오차발생
				target.height = Math.round($(rect).outerHeight()); // margin 값까지 포함하면 오차발생

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

				// auto
				// topleft, topcenter, topright
				// bottomleft, bottomcenter, bottomright
				// lefttop, leftmiddle, leftbottom
				// righttop, rightmiddle, rightbottom
				if(position === 'auto') {
					// 최적화된 영역을 찾아 position 값을 자동 설정해준다.
					position = (function() {
						var position = 'bottomcenter';
						var browser = {};
						var center = {};
						var middle = {};

						// 브라우저 크기를 3등분하여 중앙영역을 구한다.
						// 중앙영역에 위치할 경우는 center 위치
						browser = {
							'width': window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
							'height': window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight
						};
						if(browser.width < info.left || browser.width < info.right || info.top < 0 || browser.height < info.bottom) { // 브라우저창 영역밖에 위치하는지 확인
							// window(브라우저창) 기준에서 document(body) 기준으로 크기를 변경한다.
							browser.width = Math.max(
								document.body.scrollWidth, document.documentElement.scrollWidth,
								document.body.offsetWidth, document.documentElement.offsetWidth,
								document.documentElement.clientWidth
							);
							browser.height = Math.max(
								document.body.scrollHeight, document.documentElement.scrollHeight,
								document.body.offsetHeight, document.documentElement.offsetHeight,
								document.documentElement.clientHeight
							);
						}
						center = {
							'left': browser.width / 2,
							'top': browser.height / 2
						};
						middle = {
							'left': center.left - ((browser.width / 3) / 2), // 중앙영역 좌측
							'right': center.left + ((browser.width / 3) / 2), // 중앙영역 우측
							'top': center.top - ((browser.height / 3) / 2), // 중앙영역 상단
							'bottom': center.top + ((browser.height / 3) / 2) // 중앙영역 하단
						};
						/*
						스크린 화면기준 상단좌측, 상단우측, 중앙, 하단좌측, 하단우측으로 분리하여
						출력기준이 되는 rect 가 어디에 위치하는지 확인한다.
						-------------------------
						| 3    | 2  |    |    4 |
						|      |    |    |      |
						|      -----------      |
						|      | 1  |    |      |
						|------|----|----|------|
						|      |    |    |      |
						|      -----------      |
						|      |    |    |      |
						| 6    | 5  |    |    7 |
						-------------------------
						1: bottomcenter
						2: bottomleft
						3: bottomright
						4: topleft
						5: topright
						*/
						if((middle.left <= info.left && info.left <= middle.right) && (middle.top <= info.top && info.top <= middle.bottom)) { // 1
							position = 'bottomcenter';
						}else if(info.top <= center.top) {
							if(middle.left <= info.left && info.left <= middle.right) { // 2
								position = 'bottomcenter';
							}else if(info.left <= center.left) { // 3
								position = 'bottomleft';
							}else if(center.left <= info.left) { // 4
								position = 'bottomright';
							}
						}else if(center.top <= info.top) {
							if(middle.left <= info.left && info.left <= middle.right) { // 5
								position = 'topcenter';
							}else if(info.left <= center.left) { // 6
								position = 'topleft';
							}else if(center.left <= info.left) { // 7
								position = 'topright';
							}
						}

						return position;
					})();
				}

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
			},
			// 현재 이벤트의 기본 동작을 중단한다.
			preventDefault: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.preventDefault) {
					event.preventDefault();
				}else {
					event.returnValue = false;
				}
			},
			// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
			stopPropagation: function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				if(event.stopPropagation) {
					event.stopPropagation();
				}else {
					event.cancelBubble = true;
				}
			},
			// 숫자여부 확인
			isNumeric: function(value) {
				return !isNaN(parseFloat(value)) && isFinite(value);
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
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'resize': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'target': '', // #id 또는 element
			'close': '', // .class
			'esc': true // 키보드 esc 닫기실행
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.before = { // 값 변경전 기존 설정값 저장
			'scrollLeft': 0,
			'scrollTop': 0
		};
		that.time = null;

		// private init
		module.init();
		(function() {
			try {
				// target
				that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
				that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));
				that.elements.target.style.position = 'static';

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object') {
					that.elements.mask = that.settings.mask.nodeType ? that.settings.mask : $(that.settings.mask).get(0);
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(250, 251, 252) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
					module.elements.layer.appendChild(that.elements.mask);
				}

				// contents (target 에 margin 등이 설정되었을 경우 position: absolute; overflow: auto; 에 의해 여백이 적용되지 않는 것 방지)
				that.elements.contents = document.createElement('div');
				that.elements.contents.style.cssText = 'position: absolute;';
				that.elements.contents.appendChild(that.elements.target);

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				that.elements.container.appendChild(that.elements.contents);
				module.elements.layer.appendChild(that.elements.container);
				if(that.elements.target.style.display === 'none') {
					that.elements.target.style.display = 'block';
				}

				// IOS 의 position: fixed 버그 대응
				/*
				if(module.isIOS === true) {
					// 아래 코드를 사용할 경우, 레이어 내부 슬라이드 또는 관련 이벤트가 작동하지 않는다.
					$(that.elements.container).on(env['event']['down'] + '.EVENT_MOUSEDOWN_' + that.settings.key, function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						module.stopPropagation(event);
					});
					$(that.elements.container).on(env['event']['move'] + '.EVENT_MOUSEMOVE_' + that.settings.key, function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						module.stopPropagation(event);
					});
					$(that.elements.container).on(env['event']['up'] + '.EVENT_MOUSEUP_' + that.settings.key, function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						module.stopPropagation(event);
					});
				}
				*/

				// 팝업내부 close 버튼 클릭시 닫기
				if(that.settings.close && (typeof that.settings.close === 'string' || typeof that.settings.close === 'object')) {
					if(typeof that.settings.close === 'string' && /^[a-z]+/i.test(that.settings.close)) {
						that.settings.close = '.' + that.settings.close;
					}
					$(that.elements.target).find(that.settings.close).on(env['event']['click'] + '.EVENT_CLICK_CLOSE_' + that.settings.key, function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						module.preventDefault(event);
						module.stopPropagation(event);
						that.hide();
					});
				}

				// 팝업내부 click 시 zindex 값 변경 (해당 layer 가장위에 보이도록함)
				$(that.settings.target).on(env['event']['down'] + '.EVENT_MOUSEDOWN_ZINDEX_' + that.settings.key, function() {
					that.above();
				});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		})();
	};
	ModalLayer.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
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
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;
			var size, scroll;

			try {
				// IOS 의 position: fixed 버그 대응
				/*if(module.isIOS === true) {
					// 방법 1
					size = module.getWindowDocumentSize();
					scroll = module.getBrowserScroll();
					that.elements.container.style.position = 'absolute';
					that.elements.container.style.left = scroll.left + 'px';
					that.elements.container.style.top = scroll.top + 'px';
					// 방법 2
					//that.elements.container.style.width = (Math.max(size.window.width, size.document.width) - env['browser']['scrollbar']) + 'px';
					//that.elements.container.style.height = (Math.max(size.window.height, size.document.height) - env['browser']['scrollbar']) + 'px';
					//that.elements.contents.style.left = (Number(String(that.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) + scroll.left) + 'px';
					//that.elements.contents.style.top = (Number(String(that.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) + scroll.top) + 'px';
				}*/
				module.setPosition({'position': that.settings.position, 'element': that.elements.contents});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		above: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var display = parameter['display'];

			try {
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					if(display) {
						that.elements.mask.style.display = display;
					}
				}
				that.elements.container.style.zIndex = ++module.zindex;
				if(display) {
					that.elements.container.style.display = display;
				}
			}catch(e) {}
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var size, scroll;

			try {
				size = module.getWindowDocumentSize();
				scroll = module.getBrowserScroll();

				// 스크롤바 사이즈만큼 여백
				if(size.window.height < size.document.height) {
					$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
				}

				// IOS 의 position: fixed 버그 대응
				if(module.isIOS === true) {
					$('html').css({'position': 'fixed'});
					that.before['scrollLeft'] = scroll.left;
					that.before['scrollTop'] = scroll.top;
				}

				// element
				that.above({'display': 'block'});
				that.position(); // parent element 가 페인팅되어있지 않으면, child element 의 width, height 값을 구할 수 없다. (that.elements.contents 의 정확한 width, height 값을 알려면, 이를 감싸고 있는 that.elements.container 가 diplay block 상태에 있어야 한다.)
				if(env['monitor'] === 'pc') {
					that.elements.contents.style.webkitTransition = that.elements.contents.style.MozTransition = that.elements.contents.style.msTransition = that.elements.contents.style.OTransition = that.elements.contents.style.transition = 'left .5s, top .5s';
				}

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				module.queue['order'].push(that.settings.key);

				// resize 이벤트 실행 (이벤트 키는 that.settings.key 를 활용한다.)
				$(window).on('resize.EVENT_RESIZE_' + that.settings.key, function(e) {
					window.clearTimeout(that.time);
					that.time = window.setTimeout(function(){
						that.position();
					}, 50);
				});

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

				// IOS
				if(module.isIOS === true) {
					$('html').css({'position': module.before['position']});
					window.scrollTo(that.before['scrollLeft'], that.before['scrollTop']);
				}

				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

				// IOS
				if(module.isIOS === true) {
					$('html').css({'position': module.before['position']});
					window.scrollTo(that.before['scrollLeft'], that.before['scrollTop']);
				}

				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.remove === 'function') {
					that.settings.listeners.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		find: function(selector) {
			var that = this;

			try {
				return $(that.elements.container).find(selector);
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		}
	};

	// Rect
	var ModalRect = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'bottomcenter', // auto: 자동으로 최적화된 영역에 출력한다.
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'target': '', // #id 또는 element (출력레이어 타겟)
			'close': '', // .class
			'rect': '', // #id 또는 element (위치기준 타켓)
			'out': true, // 화면(viewport) 영역 안에 표시되도록 자동 위치조절
			'fixed': false, // 화면 고정 여부
			'esc': true // 키보드 esc 닫기실행
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.time = null;

		// private init
		module.init();
		(function() {
			try {
				// target
				that.settings.target = (typeof that.settings.target === 'string' && /^[a-z]+/i.test(that.settings.target) ? '#' + that.settings.target : that.settings.target);
				that.elements.target = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $(that.settings.target).get(0));

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object') {
					that.elements.mask = that.settings.mask.nodeType ? that.settings.mask : $(that.settings.mask).get(0);
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(250, 251, 252) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
					document.body.appendChild(that.elements.mask);
				}

				// contents
				that.elements.contents = document.createElement('div');
				that.elements.contents.style.cssText = (that.settings.fixed === true ? 'position: fixed;' : 'position: absolute;') + ' display: none; left: 0; top: 0; outline: none; transition: left 0s, top 0s, right 0s, bottom 0s; -webkit-overflow-scrolling: touch; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				that.elements.contents.appendChild(that.elements.target);
				document.body.appendChild(that.elements.contents);
				if(that.elements.target.style.display === 'none') {
					that.elements.target.style.display = 'block';
				}

				// rect (target 의 출력위치 기준점이 될 element)
				that.settings.rect = (typeof that.settings.rect === 'string' && /^[a-z]+/i.test(that.settings.rect) ? '#' + that.settings.rect : that.settings.rect);
				that.elements.rect = (typeof that.settings.rect === 'object' && that.settings.rect.nodeType ? that.settings.rect : $(that.settings.rect).get(0));

				// 팝업내부 close 버튼 클릭시 닫기
				if(that.settings.close && (typeof that.settings.close === 'string' || typeof that.settings.close === 'object')) {
					if(typeof that.settings.close === 'string' && /^[a-z]+/i.test(that.settings.close)) {
						that.settings.close = '.' + that.settings.close;
					}
					$(that.elements.target).find(that.settings.close).on(env['event']['click'] + '.EVENT_CLICK_CLOSE_' + that.settings.key, function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						module.preventDefault(event);
						module.stopPropagation(event);
						that.hide();
					});
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		})();
	};
	ModalRect.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'rect':
							// rect (target 의 출력위치 기준점이 될 element)
							that.settings.rect = (typeof settings[key] === 'string' && /^[a-z]+/i.test(settings[key]) ? '#' + settings[key] : settings[key]);
							that.elements.rect = (typeof that.settings.rect === 'object' && that.settings.rect.nodeType ? that.settings.rect : $(that.settings.rect).get(0));
							break;
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
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
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setRect({'position': that.settings.position, 'element': that.elements.contents, 'rect': that.elements.rect, 'fixed': that.settings.fixed});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		above: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var display = parameter['display'];

			try {
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					if(display) {
						that.elements.mask.style.display = display;
					}
				}
				that.elements.contents.style.zIndex = ++module.zindex;
				if(display) {
					that.elements.contents.style.display = display;
				}
			}catch(e) {}
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.above({'display': 'block'});
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.contents.setAttribute('tabindex', -1);
				that.elements.contents.focus();

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				module.queue['order'].push(that.settings.key);

				// resize 이벤트 실행 (이벤트 키는 that.settings.key 를 활용한다.)
				$(window).on('resize.EVENT_RESIZE_' + that.settings.key, function(e) {
					window.clearTimeout(that.time);
					that.time = window.setTimeout(function(){
						that.position();
					}, 50);
				});

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.elements.contents.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
				if(that.elements.contents) {
					that.elements.contents.parentNode.removeChild(that.elements.contents);
				}
				that.elements = {};

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// resize 이벤트 종료
				$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.remove === 'function') {
					that.settings.listeners.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		toggle: function() {
			var that = this;

			try {
				if(that.elements.contents.style.display === 'none') {
					that.show();
				}else {
					that.hide();
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
			'listeners': {
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
			try {
				//var fragment = document.createDocumentFragment();
				var key = {};

				// key
				key.title = module.getKey();
				key.message = module.getKey();
				key.cancel = module.getKey();
				key.ok = module.getKey();

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object') {
					that.elements.mask = that.settings.mask.nodeType ? that.settings.mask : $(that.settings.mask).get(0);
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
					module.elements.confirm.appendChild(that.elements.mask);
				}

				// contents
				that.elements.contents = document.createElement('div');
				that.elements.contents.style.cssText = 'position: fixed; margin: 5px; width: 290px; font-size: 12px; color: rgb(44, 45, 46); border: 1px solid rgb(230, 231, 232); background-color: rgba(253, 254, 255, .96); border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none;';
				that.elements.contents.innerHTML = '\
					<div style="padding: 20px 20px 10px 20px; font-weight: bold; color: rgb(44, 45, 46); border-radius: 7px 7px 0 0; word-wrap: break-word; word-break: break-all;">\
						<div style="margin-right: 2px; width: 7px; height: 7px; color: rgba(253, 254, 255, .96); background-color: rgba(231, 68, 78, .96); border-radius: 100%; display: inline-block;"></div>\
						<div style="display: inline-block;" id="' + key.title + '">' + that.settings.title + '</div>\
					</div>\
					<div id="' + key.message + '" style="padding: 10px 20px; min-height: 45px; color: rgb(44, 45, 46); word-wrap: break-word; word-break: break-all;">' + that.settings.message + '</div>\
					<div style="padding: 10px 20px 20px 20px; text-align: right; border-radius: 0 0 7px 7px;">\
						<button id="' + key.cancel + '" style="margin: 0 0 0 10px; padding: 5px 10px; color: rgb(140, 141, 142); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: rgb(240, 241, 242); border: 0 none; border-radius: 5px; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">CANCEL</button>\
						<button id="' + key.ok + '" style="margin: 0 0 0 10px; padding: 5px 10px; color: rgb(120, 121, 122); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: rgb(240, 241, 242); border: 0 none; border-radius: 5px; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">OK</button>\
					</div>\
				';

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				that.elements.container.appendChild(that.elements.contents);
				module.elements.confirm.appendChild(that.elements.container);

				// search element
				that.elements.title = that.elements.contents.querySelector('#' + key.title);
				that.elements.message = that.elements.contents.querySelector('#' + key.message);
				that.elements.cancel = that.elements.contents.querySelector('#' + key.cancel);
				that.elements.ok = that.elements.contents.querySelector('#' + key.ok);

				// event
				$(that.elements.cancel).on(env['event']['click'] + '.EVENT_CLICK_CANCEL_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					module.preventDefault(event);
					module.stopPropagation(event);
					that.cancel();
				});
				$(that.elements.ok).on(env['event']['click'] + '.EVENT_CLICK_OK_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					module.preventDefault(event);
					module.stopPropagation(event);
					that.ok();
				});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
							that.elements.title.textContent = settings[key] || 'Message';
							break;
						case 'message':
							//that.elements.message.textContent = settings[key] || '';
							that.elements.message.innerHTML = settings[key] || '';
							break;
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition({'position': that.settings.position, 'element': that.elements.contents});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		above: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var display = parameter['display'];

			try {
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					if(display) {
						that.elements.mask.style.display = display;
					}
				}
				that.elements.container.style.zIndex = ++module.zindex;
				if(display) {
					that.elements.container.style.display = display;
				}
			}catch(e) {}
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var size, scroll;

			// 실행되고 있는 최우선 modal 확인
			if(module.queue['wait'].length > 0 && module.queue['wait'][0] !== that.settings.key /* 순차 실행의 첫번째 요소 여부 */) {
				module.queue['wait'].push(that.settings.key);
				return;
			}

			try {
				size = module.getWindowDocumentSize();
				scroll = module.getBrowserScroll();

				// 스크롤바 사이즈만큼 여백
				if(size.window.height < size.document.height) {
					$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
				}

				// element
				that.above({'display': 'block'});
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				module.queue['order'].push(that.settings.key);
				if(module.queue['wait'].indexOf(that.settings.key) === -1) {
					module.queue['wait'].push(that.settings.key);
				}
				/*if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) === -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.setQueuePosition({'position': that.settings.position, 'element': that.elements.contents, 'out': false});
					module.queue['position'][that.settings.position].push(that.settings.key);
				}*/

				// mousedown (사용자 터치영역 감시, modal 영역을 제외한 다른 영역 터치 이벤트 불가능)
				$(that.elements.container).on(env.event.down + '.EVENT_MOUSEDOWN_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					//if(event.target && (that.elements.container.isEqualNode(event.target) || !that.elements.contents.contains(event.target)) {
					if(event.target && !that.elements.contents.contains(event.target)) {
						event.preventDefault(); // 기본이벤트 정지
						event.stopPropagation(); // 상위 전파 방지
						event.stopImmediatePropagation(); // 상위 전파 + 같은 레벨 이벤트 전파 방지 (하나의 element에 여러개의 이벤트)
						return false; // jQuery stop
					}
				});

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				if(module.queue['wait'].indexOf(that.settings.key) !== -1) {
					module.queue['wait'].splice(module.queue['wait'].indexOf(that.settings.key), 1);
				}
				/*if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) !== -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.queue['position'][that.settings.position].splice(module.queue['position'][that.settings.position].indexOf(that.settings.key), 1);
					module.setQueuePosition({'position': that.settings.position, 'out': false});
				}*/

				// mousedown
				$(that.elements.container).off(env.event.down + '.EVENT_MOUSEDOWN_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					return that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			// 다음 실행할 최우선 modal 확인
			(function loop() {
				if(module.queue['wait'].length > 0) {
					if(!module.instance[module.queue['wait'][0]]) {
						// wait 에는 존재하나 instance 에는 존재하지 않는 것
						module.queue['wait'].shift();
						loop(); // 재귀
					}else if(typeof module.instance[module.queue['wait'][0]].show === 'function') {
						module.instance[module.queue['wait'][0]].show();
					}
				}
			})();
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.container) {
					that.elements.container.parentNode.removeChild(that.elements.container);
				}
				that.elements = {};

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				if(module.queue['wait'].indexOf(that.settings.key) !== -1) {
					module.queue['wait'].splice(module.queue['wait'].indexOf(that.settings.key), 1);
				}
				/*if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) !== -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.queue['position'][that.settings.position].splice(module.queue['position'][that.settings.position].indexOf(that.settings.key), 1);
					module.setQueuePosition({'position': that.settings.position, 'out': false});
				}*/

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// mousedown
				$(that.elements.container).off(env.event.down + '.EVENT_MOUSEDOWN_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.remove === 'function') {
					that.settings.listeners.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			// 다음 실행할 최우선 modal 확인
			(function loop() {
				if(module.queue['wait'].length > 0) {
					if(!module.instance[module.queue['wait'][0]]) {
						// wait 에는 존재하나 instance 에는 존재하지 않는 것
						module.queue['wait'].shift();
						loop(); // 재귀
					}else if(typeof module.instance[module.queue['wait'][0]].show === 'function') {
						module.instance[module.queue['wait'][0]].show();
					}
				}
			})();
		},
		cancel: function() {
			var that = this;

			that.hide();
			// listeners
			if(typeof that.settings.listeners.cancel === 'function') {
				return that.settings.listeners.cancel.call(that);
			}
		},
		ok: function() {
			var that = this;

			that.hide();
			// listeners
			if(typeof that.settings.listeners.ok === 'function') {
				return that.settings.listeners.ok.call(that);
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
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'title': 'Message',
			'message': '',
			'esc': true // 키보드 esc 닫기실행
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		module.init();
		(function() {
			try {
				//var fragment = document.createDocumentFragment();
				var key = {};

				// key
				key.title = module.getKey();
				key.message = module.getKey();
				key.ok = module.getKey();

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object') {
					that.elements.mask = that.settings.mask.nodeType ? that.settings.mask : $(that.settings.mask).get(0);
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
					module.elements.alert.appendChild(that.elements.mask);
				}

				// contents
				that.elements.contents = document.createElement('div');
				that.elements.contents.style.cssText = 'position: fixed; margin: 5px; width: 290px; font-size: 12px; color: rgb(44, 45, 46); border: 1px solid rgb(230, 231, 232); background-color: rgba(253, 254, 255, .96); border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none;';
				that.elements.contents.innerHTML = '\
					<div style="padding: 20px 20px 10px 20px; font-weight: bold; color: rgb(44, 45, 46); border-radius: 7px 7px 0 0; word-wrap: break-word; word-break: break-all;">\
						<div style="margin-right: 2px; width: 7px; height: 7px; color: rgba(253, 254, 255, .96); background-color: rgba(231, 68, 78, .96); border-radius: 100%; display: inline-block;"></div>\
						<div style="display: inline-block;" id="' + key.title + '">' + that.settings.title + '</div>\
					</div>\
					<div id="' + key.message + '" style="padding: 10px 20px; min-height: 45px; color: rgb(44, 45, 46); word-wrap: break-word; word-break: break-all;">' + that.settings.message + '</div>\
					<div style="padding: 10px 20px 20px 20px; text-align: right; border-radius: 0 0 7px 7px;">\
						<button id="' + key.ok + '" style="margin: 0 0 0 10px; padding: 5px 10px; color: rgb(120, 121, 122); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: rgb(240, 241, 242); border: 0 none; border-radius: 5px; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">OK</button>\
					</div>\
				';

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				that.elements.container.appendChild(that.elements.contents);
				module.elements.alert.appendChild(that.elements.container);

				// search element
				that.elements.title = that.elements.contents.querySelector('#' + key.title);
				that.elements.message = that.elements.contents.querySelector('#' + key.message);
				that.elements.ok = that.elements.contents.querySelector('#' + key.ok);

				// event
				$(that.elements.ok).on(env['event']['click'] + '.EVENT_CLICK_OK_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					module.preventDefault(event);
					module.stopPropagation(event);
					that.hide();
				});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
							that.elements.title.textContent = settings[key] || 'Message';
							break;
						case 'message':
							//that.elements.message.textContent = settings[key] || '';
							that.elements.message.innerHTML = settings[key] || '';
							break;
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition({'position': that.settings.position, 'element': that.elements.contents});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		above: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var display = parameter['display'];

			try {
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					if(display) {
						that.elements.mask.style.display = display;
					}
				}
				that.elements.container.style.zIndex = ++module.zindex;
				if(display) {
					that.elements.container.style.display = display;
				}
			}catch(e) {}
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var size, scroll;

			// 실행되고 있는 최우선 modal 확인
			if(module.queue['wait'].length > 0 && module.queue['wait'][0] !== that.settings.key /* 순차 실행의 첫번째 요소 여부 */) {
				module.queue['wait'].push(that.settings.key);
				return;
			}

			try {
				size = module.getWindowDocumentSize();
				scroll = module.getBrowserScroll();

				// 스크롤바 사이즈만큼 여백
				if(size.window.height < size.document.height) {
					$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
				}

				// element
				that.above({'display': 'block'});
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				//that.elements.container.focus();
				that.elements.ok.focus();

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				module.queue['order'].push(that.settings.key);
				if(module.queue['wait'].indexOf(that.settings.key) === -1) {
					module.queue['wait'].push(that.settings.key);
				}
				/*if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) === -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.setQueuePosition({'position': that.settings.position, 'element': that.elements.contents, 'out': false});
					module.queue['position'][that.settings.position].push(that.settings.key);
				}*/

				// mousedown (사용자 터치영역 감시, modal 영역을 제외한 다른 영역 터치 이벤트 불가능)
				$(that.elements.container).on(env.event.down + '.EVENT_MOUSEDOWN_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					//if(event.target && (that.elements.container.isEqualNode(event.target) || !that.elements.contents.contains(event.target)) {
					if(event.target && !that.elements.contents.contains(event.target)) {
						event.preventDefault(); // 기본이벤트 정지
						event.stopPropagation(); // 상위 전파 방지
						event.stopImmediatePropagation(); // 상위 전파 + 같은 레벨 이벤트 전파 방지 (하나의 element에 여러개의 이벤트)
						return false; // jQuery stop
					}
				});

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

				// element
				that.elements.container.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				if(module.queue['wait'].indexOf(that.settings.key) !== -1) {
					module.queue['wait'].splice(module.queue['wait'].indexOf(that.settings.key), 1);
				}
				/*if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) !== -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.queue['position'][that.settings.position].splice(module.queue['position'][that.settings.position].indexOf(that.settings.key), 1);
					module.setQueuePosition({'position': that.settings.position, 'out': false});
				}*/

				// mousedown
				$(that.elements.container).off(env.event.down + '.EVENT_MOUSEDOWN_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			// 다음 실행할 최우선 modal 확인
			(function loop() {
				if(module.queue['wait'].length > 0) {
					if(!module.instance[module.queue['wait'][0]]) {
						// wait 에는 존재하나 instance 에는 존재하지 않는 것
						module.queue['wait'].shift();
						loop(); // 재귀
					}else if(typeof module.instance[module.queue['wait'][0]].show === 'function') {
						module.instance[module.queue['wait'][0]].show();
					}
				}
			})();
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

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

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				if(module.queue['wait'].indexOf(that.settings.key) !== -1) {
					module.queue['wait'].splice(module.queue['wait'].indexOf(that.settings.key), 1);
				}
				/*if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) !== -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.queue['position'][that.settings.position].splice(module.queue['position'][that.settings.position].indexOf(that.settings.key), 1);
					module.setQueuePosition({'position': that.settings.position, 'out': false});
				}*/

				// mousedown
				$(that.elements.container).off(env.event.down + '.EVENT_MOUSEDOWN_' + that.settings.key);

				// listeners
				if(typeof that.settings.listeners.remove === 'function') {
					that.settings.listeners.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			// 다음 실행할 최우선 modal 확인
			(function loop() {
				if(module.queue['wait'].length > 0) {
					if(!module.instance[module.queue['wait'][0]]) {
						// wait 에는 존재하나 instance 에는 존재하지 않는 것
						module.queue['wait'].shift();
						loop(); // 재귀
					}else if(typeof module.instance[module.queue['wait'][0]].show === 'function') {
						module.instance[module.queue['wait'][0]].show();
					}
				}
			})();
		}
	};

	// 푸시
	var ModalPush = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'topright',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null
			},
			'theme:': {}, // 테마 (스타일 변경)
			'title': 'Message',
			'message': '',
			'time': 0 // 0 보다 큰 값은 자동닫기 설정
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
				key.title = module.getKey();
				key.message = module.getKey();
				key.close = module.getKey();

				// mask
				if(that.settings.mask && typeof that.settings.mask === 'object') {
					that.elements.mask = that.settings.mask.nodeType ? that.settings.mask : $(that.settings.mask).get(0);
					that.elements.mask.display = 'none';
				}else {
					that.elements.mask = document.createElement('div');
					that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
					module.elements.push.appendChild(that.elements.mask);
				}

				// contents
				that.elements.contents = document.createElement('div');
				that.elements.contents.style.cssText = 'position: fixed; display: none; margin: 5px; width: 290px; font-size: 12px; color: rgb(44, 45, 46); border: 1px solid rgb(230, 231, 232); background-color: rgba(253, 254, 255, .96); border-radius: 7px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); outline: none; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				/*that.elements.contents.innerHTML = '\
					<div id="' + key.message + '" style="padding: 12px 12px 5px 12px; min-height: 33px; color: rgb(44, 45, 46); background-color: rgba(253, 254, 255, .96); border-radius: 7px 7px 0 0; word-wrap: break-word; word-break: break-all;">' + that.settings.message + '</div>\
					<div style="padding: 5px 12px 12px 12px; background: rgba(250, 251, 252, .96); text-align: center; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 7px 7px;">\
						<button id="' + key.close + '" style="margin: 0; padding: 0; color: rgb(120, 121, 122); font-size: 12px; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; background: transparent; border: none; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">CLOSE</button>\
					</div>\
				';*/
				that.elements.contents.innerHTML = '\
					<div style="padding: 15px 15px 5px 15px; font-weight: bold; color: rgb(44, 45, 46); border-radius: 7px 7px 0 0; word-wrap: break-word; word-break: break-all;">\
						<div style="margin-right: 2px; width: 7px; height: 7px; color: rgba(253, 254, 255, .96); background-color: rgba(231, 68, 78, .96); border-radius: 100%; display: inline-block;"></div>\
						<div style="display: inline-block;" id="' + key.title + '">' + that.settings.title + '</div>\
					</div>\
					<div id="' + key.message + '" style="padding: 5px 15px 15px 15px; color: rgb(44, 45, 46); border-radius: 7px; word-wrap: break-word; word-break: break-all;">' + that.settings.message + '</div>\
					<div style="position: absolute; top: 10px; right: 15px;">\
						<button id="' + key.close + '" style="margin: 0; padding: 0; color: rgb(120, 121, 122); font-size: 12px; font-weight: bold; text-align: center; text-shadow: 0 1px #FFF; white-space: nowrap; vertical-align: middle; background-color: transparent; border: 0 none; cursor: pointer; -webkit-touch-callout: none; -webkit-touch-select: none; user-select: none;">CLOSE</button>\
					</div>\
				';
				fragment.appendChild(that.elements.contents);
				module.elements.push.appendChild(fragment);

				// search element
				that.elements.title = that.elements.contents.querySelector('#' + key.title);
				that.elements.message = that.elements.contents.querySelector('#' + key.message);
				that.elements.close = that.elements.contents.querySelector('#' + key.close);

				// event
				$(that.elements.close).on(env['event']['click'] + '.EVENT_CLICK_CLOSE_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					module.preventDefault(event);
					module.stopPropagation(event);
					that.hide();
				});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
						case 'position':
							that.settings[key] = settings[key];
							break;
						case 'title':
							that.elements.title.textContent = settings[key] || 'Message';
							break;
						case 'message':
							//that.elements.message.textContent = settings[key] || '';
							that.elements.message.innerHTML = settings[key] || '';
							break;
						case 'time':
							that.settings.time = module.isNumeric(settings[key]) && settings[key] || 0;
							break;
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition({'position': that.settings.position, 'element': that.elements.contents});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		above: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var display = parameter['display'];

			try {
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.zIndex = ++module.zindex;
					if(display) {
						that.elements.mask.style.display = display;
					}
				}
				that.elements.contents.style.zIndex = ++module.zindex;
				if(display) {
					that.elements.contents.style.display = display;
				}
			}catch(e) {}
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.above({'display': 'block'});
				that.position();

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				module.queue['order'].push(that.settings.key);
				if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) === -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.setQueuePosition({'position': that.settings.position, 'element': that.elements.contents, 'out': false});
					module.queue['position'][that.settings.position].push(that.settings.key);
				}

				// auto hide
				global.clearTimeout(that.time);
				if(typeof that.settings.time === 'number' && that.settings.time > 0) {
					that.time = global.setTimeout(function() {
						that.hide();
					}, that.settings.time);
				}

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			try {
				// element
				that.elements.contents.style.display = 'none';
				if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
					that.elements.mask.style.display = 'none';
				}

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) !== -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.queue['position'][that.settings.position].splice(module.queue['position'][that.settings.position].indexOf(that.settings.key), 1);
					module.setQueuePosition({'position': that.settings.position, 'out': false});
				}

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					return that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
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
				if(that.elements.contents) {
					that.elements.contents.parentNode.removeChild(that.elements.contents);
				}
				that.elements = {};

				// queue
				while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
					module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
				}
				if(!that.settings.mask && module.queue['position'][that.settings.position].indexOf(that.settings.key) !== -1) { // 같은 위치에 다른 모달과 서로 겹치지 않도록 한다.
					module.queue['position'][that.settings.position].splice(module.queue['position'][that.settings.position].indexOf(that.settings.key), 1);
					module.setQueuePosition({'position': that.settings.position, 'out': false});
				}

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// listeners
				if(typeof that.settings.listeners.remove === 'function') {
					that.settings.listeners.remove.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}
		}
	};

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------

	// folder (폴더가 다른 grid 로 이동할 경우 data-parent 값이 변경되지 않으므로, 폴더 생성 당시의 parent grid로 이동할 수 있다.)
	var ModalFolder = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'position': 'center',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'listeners': {
				'show': null,
				'hide': null,
				'remove': null,
				'error': null,
				'title': null // 폴더명 변경 이벤트 콜백
			},
			'theme:': {}, // 테마 (스타일 변경)
			'mode': 'view', // 방식 (폴더 제목등 수정가능한지 상태값) - view: 읽기모드, edit: 수정모드
			'grid': '', // 상위 grid 값 (parent grid key)
			'title': 'Folder',
			'esc': true // 키보드 esc 닫기실행
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};
		that.time = null;
		that.width = 300;
		that.width += env.browser.scrollbar; // 스크롤바 가로 픽셀

		// private init
		(function() {
			var fragment = document.createDocumentFragment();
			var key = {};

			// key
			key.header = module.getKey();
			key.title_input = module.getKey();
			key.close_button = module.getKey();
			key.grid = module.getKey();
			key.parent = module.getKey();

			// mask
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(240, 241, 242) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				module.elements.folder.appendChild(that.elements.mask);
			}else if(that.settings.mask && typeof that.elements.mask === 'object') {
				that.elements.mask = that.settings.mask.nodeType ? that.settings.mask : $(that.settings.mask).get(0);
				that.elements.mask.display = 'none';
			}

			// contents
			that.elements.contents = document.createElement('div');
			that.elements.contents.style.cssText = 'position: fixed; width: ' + that.width + 'px; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); border: 1px solid rgb(240, 241, 242); border-radius: 7px; outline: none; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
			that.elements.contents.innerHTML = '\
				<!-- header //-->\
				<header id="' + key.header + '" style="margin: 0 auto; height: 50px; background-color: rgb(253, 254, 255); border-radius: 7px 7px 0 0; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none;">\
					<!-- 폴더명 입력 //-->\
					<input type="text" name="" value="' + decodeURIComponent(that.settings.title) + '" id="' + key.title_input + '" style="position: absolute; left: 20px; top: 12px; padding: 5px; width: 170px; height: 17px; border: 0; font-size: 13px; color: rgb(76, 77, 78); border-radius: 5px; outline: none;" />\
					<!-- 폴더 닫기 등 버튼 //-->\
					<button id="' + key.close_button + '" style="position: absolute; right: 20px; top: 12px; padding: 5px; border: 0; background-color: transparent; font-size: 13px; color: rgb(76, 77, 78);">close</button>\
				</header>\
				<!-- grid //-->\
				<div style="min-height: 100px; max-height: 200px; background-color: rgba(253, 254, 255, .96); border-top: 1px dashed rgb(240, 241, 242); border-bottom: 1px dashed rgb(240, 241, 242); overflow-x: hidden; overflow-y: auto;">\
					<div id="' + key.grid + '" data-type="content" style="margin: 0 auto;">\
						<!-- grid 로딩 메시지 //-->\
						<div class="loading">\
							<div class="icon">\
								<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve">\
									<rect x="0" y="10" width="4" height="10">\
										<animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" />\
										<animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />\
										<animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />\
									</rect>\
									<rect x="8" y="10" width="4" height="10">\
										<animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" />\
										<animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />\
										<animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />\
									</rect>\
									<rect x="16" y="10" width="4" height="10">\
										<animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" />\
										<animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />\
										<animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />\
									</rect>\
								</svg>\
							</div>\
							<p class="message">Loading...</p>\
						</div>\
					</div>\
				</div>\
				<!-- parent grid move //-->\
				<div id="' + key.parent + '" data-type="parent" data-folder="' + that.settings['key'] + '" data-grid="' + that.settings['grid'] + '" style="margin: 0 auto; padding-top: 32px; height: 68px; font-size: 14px; color: rgb(225, 226, 227); text-align: center; background-color: rgb(253, 254, 255); border-radius: 0 0 7px 7px; -webkit-touch-callout: none; -webkit-touch-select: none; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; cursor: default;">\
					<!-- 상위폴더로 이동할 경우 여기로 드래그 //-->\
					If you go to the parent folder<br>and drag it here\
				</div>\
			';
			that.elements.contents.setAttribute('data-type', 'folder');
			that.elements.contents.setAttribute('data-key', that.settings['key']);
			if('dataset' in that.elements.contents) {
				that.elements.contents.dataset.type = 'folder';
				that.elements.contents.dataset.key = that.settings['key'];
			}
			fragment.appendChild(that.elements.contents);
			module.elements.folder.appendChild(fragment);

			// search element
			that.elements.header = that.elements.contents.querySelector('#' + key.header);
			that.elements.title_input = that.elements.contents.querySelector('#' + key.title_input);
			that.elements.close_button = that.elements.contents.querySelector('#' + key.close_button);
			that.elements.grid = that.elements.contents.querySelector('#' + key.grid);
			that.elements.parent = that.elements.contents.querySelector('#' + key.parent);

			// element storage
			that.elements.parent.storage = {
				'type': 'parent',
				'folder': that.settings['key'], // folder key
				'grid': that.settings['grid'] // parent grid key
			};

			// event
			$(that.elements.title_input).on('blur' + '.EVENT_BLUR_TITLE_' + that.settings.key, function(e) { // 폴터 타이틀 변경 이벤트
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				var value = this.value;
				module.preventDefault(event);
				module.stopPropagation(event);
				// 폴더 제목 변경
				if(that.settings.mode === 'edit' && typeof that.settings.listeners.title === 'function') {
					that.settings.listeners.title(encodeURIComponent(value || ''));
				}
			});
			(function() {
				var before; // 이전 타이틀 설정값 (계속 엔터키를 눌렀을 때 불필요한 동기화 방지)
				$(that.elements.title_input).on('keyup' + '.EVENT_KEYUP_TITLE_' + that.settings.key, function(e) { // 폴터 타이틀 변경 이벤트 (enter key)
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					var code = event.which || event.keyCode;
					var value = this.value;

					if(that.settings.mode === 'edit') {
						if(code === 13 && before !== value && typeof that.settings.listeners.title === 'function') {
							// 폴더 제목 변경
							that.settings.listeners.title(encodeURIComponent(value || ''));
							before = value;
						}else {
							// 화면 title 변경 (실시간 변경)
							//console.log('폴터 타이틀 변경: ' + value);
						}
					}
				});
			})();
			$(that.elements.close_button).on(env['event']['click'] + '.EVENT_CLICK_CLOSE_' + that.settings.key, function(e) { // 폴더 닫기 버튼 이벤트
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				module.preventDefault(event);
				module.stopPropagation(event);
				that.hide();
			});
		})();
	};
	ModalFolder.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						case 'mode':
							that.settings[key] = settings[key];
							break;
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
								}
							}
							break;
					}
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;
			var scroll, result;

			try {
				//scroll = module.getBrowserScroll();
				result = module.setPosition({'position': that.settings.position, 'element': that.elements.contents});
				//that.elements.contents.style.left = (scroll.left + result.left) + 'px';
				//that.elements.contents.style.top = (scroll.top + result.top) + 'px';
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var size = module.getWindowDocumentSize();

			// 폴더 제목 작업모드
			that.titleToggle();

			// 스크롤바 사이즈만큼 여백
			if(size.window.height < size.document.height) {
				$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
			}

			// element
			that.elements.contents.style.webkitTransition = that.elements.contents.style.MozTransition = that.elements.contents.style.msTransition = that.elements.contents.style.OTransition = that.elements.contents.style.transition = 'left 0s, top 0s';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			that.elements.contents.style.zIndex = ++module.zindex;
			that.elements.contents.style.display = 'block';
			that.position();
			if(env['monitor'] === 'pc') {
				that.elements.contents.style.webkitTransition = that.elements.contents.style.MozTransition = that.elements.contents.style.msTransition = that.elements.contents.style.OTransition = that.elements.contents.style.transition = 'left .5s, top .5s';
				//that.elements.contents.style.transition = 'left .5s, top .5s';
			}

			// focus (웹접근성)
			module.active = document.activeElement;
			that.elements.contents.setAttribute('tabindex', -1);
			that.elements.contents.focus();

			// queue
			while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
				module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
			}
			module.queue['order'].push(that.settings.key);

			// resize 이벤트 실행 (이벤트 키는 that.settings.key 를 활용한다.)
			$(window).on('resize.EVENT_RESIZE_' + that.settings.key, function(e) {
				window.clearTimeout(that.time);
				that.time = window.setTimeout(function(){
					that.position();
				}, 50);
			});

			// listeners
			if(typeof that.settings.listeners.show === 'function') {
				that.settings.listeners.show.call(that);
			}
			if(typeof parameter.callback === 'function') {
				parameter.callback.call(that);
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			// 폴더 제목 작업모드
			that.titleToggle();

			// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
			$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

			// element
			that.elements.contents.style.display = 'none';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}

			// queue
			while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
				module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
			}

			// resize 이벤트 종료
			$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

			// listeners
			if(typeof that.settings.listeners.hide === 'function') {
				that.settings.listeners.hide.call(that);
			}
			if(typeof parameter.callback === 'function') {
				parameter.callback.call(that);
			}
		},
		remove: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
			$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

			// element
			if(that.elements.mask) {
				that.elements.mask.parentNode.removeChild(that.elements.mask);
			}
			if(that.elements.contents) {
				that.elements.contents.parentNode.removeChild(that.elements.contents);
			}
			that.elements = {};

			// queue
			while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
				module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
			}

			// instance
			if(that.settings['key'] && module.instance[that.settings['key']]) {
				delete module.instance[that.settings['key']];
			}

			// resize 이벤트 종료
			$(window).off('resize.EVENT_RESIZE_' + that.settings.key);

			// listeners
			if(typeof parameter.callback === 'function') {
				parameter.callback.call(that);
			}
		},
		titleToggle: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var mode = parameter['mode'] || that.settings['mode'];

			// 폴더 제목 작업모드
			if(mode !== 'edit') {
				that.elements.title_input.readOnly = true;
				that.elements.title_input.style.backgroundColor = 'transparent';
			}else {
				that.elements.title_input.readOnly = false;
				that.elements.title_input.style.backgroundColor = 'rgba(240, 241, 242, .86)';
			}

			that.settings['mode'] = mode;
		}
	};

	// story
	// 모바일에서 전체화면으로 open했을 때 body 의 포지션을 변경
	var ModalStory = (function() {
		// 마지막 열었던 story 팝업 left, top 값
		var last = {
			'left': 0,
			'top': 0
		};

		// private init
		var init = (function() {
			// 모바일, PC 분기
			if(env['monitor'] === 'mobile') {
				return function() {
					var that = this;
					var fragment = document.createDocumentFragment();
					var key = {};

					// key
					key.header = module.getKey();
					key.progress = module.getKey();
					key.bar = module.getKey();
					key.main = module.getKey();
					key.iframe = module.getKey();
					key.button_group = module.getKey();
					key.button_refresh = module.getKey();
					key.button_hidden = module.getKey();
					key.button_close = module.getKey();

					// contents
					/*
					-
					// 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
					-
					// iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
					// 그러므로 iframe 를 감싸는 main(div) 를 만든다.
					that.elements.main.style.boxSizing = that.elements.main.style.mozBoxSizing = that.elements.main.style.webkitBoxSizing = 'border-box';
					*/
					that.elements.contents = document.createElement('section');
					that.elements.contents.style.cssText = 'position: fixed; outline: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;'; // 모바일은 전체화면으로 출력
					that.elements.contents.innerHTML = '\
						<!-- main //-->\
						<div id="' + key.main + '" style="clear: both; width: 100%; box-sizing: border-box; height: 382px;">\
							<iframe id="' + key.iframe + '" src="" srcdoc="" height="100%" width="100%" style="margin: 0px; padding: 0px; pointer-events: auto; background-color: rgb(245, 246, 247); border: 0; box-sizing: border-box;"></iframe>\
						</div>\
						<!-- header //-->\
						<header id="' + key.header + '" style="position: fixed; bottom: 5px; right: 5px; box-sizing: border-box;">\
							<!-- progressbar //-->\
							<div id="' + key.progress + '" style="position: absolute; top: -4px; width: 100%;">\
								<div id="' + key.bar + '" style="background-color: rgba(231, 68, 78, .86); width: 0%; height: 3px; border-radius: 1px; display: none;"></div>\
							</div>\
							<!-- button //-->\
							<div id="' + key.button_group + '" style="background-color: rgba(44, 45, 46, 0.86); box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.1); border-radius: 5px;">\
								<button id="' + key.button_refresh + '" style="width: 40px; height: 40px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-40.png&quot;); background-position: 0px 0px; background-repeat: no-repeat;"></button>\
								<button id="' + key.button_hidden + '" style="width: 40px; height: 40px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-40.png&quot;); background-position: -40px 0px; background-repeat: no-repeat;"></button>\
								<button id="' + key.button_close + '" style="width: 40px; height: 40px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-40.png&quot;); background-position: -80px 0px; background-repeat: no-repeat;"></button>\
							</div>\
						</header>\
					';
					fragment.appendChild(that.elements.contents);
					module.elements.story.appendChild(fragment);

					// search element
					that.elements.header = that.elements.contents.querySelector('#' + key.header);
					that.elements.progress = that.elements.contents.querySelector('#' + key.progress);
					that.elements.bar = that.elements.contents.querySelector('#' + key.bar);
					that.elements.main = that.elements.contents.querySelector('#' + key.main);
					that.elements.iframe = that.elements.contents.querySelector('#' + key.iframe);
					that.elements.button_group = that.elements.contents.querySelector('#' + key.button_group);
					that.elements.button_refresh = that.elements.contents.querySelector('#' + key.button_refresh);
					that.elements.button_hidden = that.elements.contents.querySelector('#' + key.button_hidden);
					that.elements.button_close = that.elements.contents.querySelector('#' + key.button_close);

					// storage (bunch modal 등에서 사용됨)
					that.elements.contents.storage = {
						'key': that.settings.key,
						//'title': encodeURIComponent(that.settings.title) // decodeURIComponent
						'title': that.settings.title
					};

					// safari 에서는 iframe 내부에 스크롤바가 생기도록 하려면 아래 div 가 필요하다.
					if(module.isIOS === true) {
						that.elements.main.style.cssText = "overflow: auto; -webkit-overflow-scrolling: touch;"; // webkitOverflowScrolling
					}

					// event
					that.elements.iframe.onload = that.imports.bind(that);
					$(that.elements.button_refresh).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_REFRESH', function(e) { // iframe 새로고침
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						//that.elements.iframe.contentWindow.location.reload(true); // 비표준
						//that.elements.iframe.src += '';
						that.imports.call(that);
					});
					$(that.elements.button_hidden).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN', function(e) { // 팝업 숨기기
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						//that.elements.contents.style.display = 'none';
						that.hide();
					});
					$(that.elements.button_close).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_CLOSE', function(e) { // 팝업 닫기 (element 삭제)
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						// iframe 중지
						that.elements.iframe.onload = null;
						//that.elements.contents.style.display = 'none';
						that.remove();
					});
				};
			}else {
				return function() {
					var that = this;
					var resize_domain = 0; // 리사이즈 버튼 영역
					var fragment = document.createDocumentFragment();
					var key = {};

					// resize 버튼 크기
					if(env['check']['touch'] === true) { // 터치 기기에서는 사용자 손가락 터치 영역을 고려하여 범위를 넓게 한다.
						resize_domain = 16;
					}else {
						resize_domain = 10;
					}

					// key
					key.header = module.getKey();
					key.title = module.getKey();
					key.progress = module.getKey();
					key.bar = module.getKey();
					key.main = module.getKey();
					key.iframe = module.getKey();
					key.button_group = module.getKey();
					key.button_refresh = module.getKey();
					key.button_hidden = module.getKey();
					key.button_fullscreen = module.getKey();
					key.button_close = module.getKey();
					key.right_resize = module.getKey();
					key.bottom_resize = module.getKey();
					key.right_bottom_resize = module.getKey();

					// contents
					that.elements.contents = document.createElement('section');
					//that.elements.contents.style.cssText = 'position: fixed; box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, .05); border: 1px solid rgb(44, 45, 46); outline: none;'; // border 스타일 변경시 리사이즈 후 스타일도 함께 변경해 줘야한다.
					that.elements.contents.style.cssText = 'position: fixed; box-shadow: -1px 1px 1px rgba(0, 0, 0, .10), 1px 1px 1px rgba(0, 0, 0, .10); border: 1px solid rgb(44, 45, 46); outline: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;'; // border 스타일 변경시 리사이즈 후 스타일도 함께 변경해 줘야한다.
					that.elements.contents.innerHTML = '\
						<!-- header //-->\
						<header id="' + key.header + '" style="position: relative; width: 100%; height: 30px; background-color: rgba(44, 45, 46, 0.86); box-sizing: border-box;">\
							<!-- title //-->\
							<div id="' + key.title + '" style="position: absolute; top: 7px; left: 18px; font-size: 12px; color: rgb(253, 254, 255); user-select: none;">' + decodeURIComponent(that.settings.title) + '</div>\
							<!-- progress //-->\
							<div id="' + key.progress + '" style="position: absolute; width: 100%; bottom: -3px;">\
								<div id="' + key.bar + '" style="background-color: rgba(231, 68, 78, .86); width: 0%; height: 3px; display: none;"></div>\
							</div>\
							<!-- button //-->\
							<div id="' + key.button_group + '" style="position: absolute; top: 0px; right: 0px; padding: 0px 9px;">\
								<button id="' + key.button_refresh + '" style="width: 30px; height: 30px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-30.png&quot;); background-position: 0px 0px; background-repeat: no-repeat;"></button>\
								<button id="' + key.button_hidden + '" style="width: 30px; height: 30px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-30.png&quot;); background-position: -30px 0px; background-repeat: no-repeat;"></button>\
								' + (env['check']['fullscreen'] === true ? '<button id="' + key.button_fullscreen + '" style="width: 30px; height: 30px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-30.png&quot;); background-position: -60px 0px; background-repeat: no-repeat;"></button>' : '') + '\
								<button id="' + key.button_close + '" style="width: 30px; height: 30px; background-image: url(&quot;//' + window.location.host + '/images/popup-buttons-30.png&quot;); background-position: -90px 0px; background-repeat: no-repeat;"></button>\
							</div>\
						</header>\
						<!-- main //-->\
						<div id="' + key.main + '" style="width: 100%; clear: both; box-sizing: border-box; height: 352px;">\
							<iframe id="' + key.iframe + '" src="" srcdoc="" width="100%" height="100%" style="margin: 0px; padding: 0px; pointer-events: auto; background-color: rgb(245, 246, 247); border: 0; box-sizing: border-box;"></iframe>\
						</div>\
						<!-- resize //-->\
						<div id="' + key.right_resize + '" style="top: 0px; right: -' + resize_domain + 'px; width: ' + resize_domain + 'px; height: 100%; cursor: e-resize; position: absolute; display: block;"></div>\
						<div id="' + key.bottom_resize + '" style="left: 0px; bottom: -' + resize_domain + 'px; width: 100%; height: ' + resize_domain + 'px; cursor: s-resize; position: absolute; display: block;"></div>\
						<div id="' + key.right_bottom_resize + '" style="right: -' + resize_domain + 'px; bottom: -' + resize_domain + 'px; width: ' + resize_domain + 'px; height: ' + resize_domain + 'px; cursor: se-resize; position: absolute; display: block;"></div>\
					';
					fragment.appendChild(that.elements.contents);
					module.elements.story.appendChild(fragment);

					// search element
					/*
					-
					// 팝업 타이틀, 제어 버튼 등 toolkit (모바일에서는 하단에 적용)
					-
					// iframe 은 상위 element의 고정된 height 픽셀값이 있어야 정확한 height="100%" 가 적용된다.
					// 그러므로 iframe 를 감싸는 main(div) 를 만든다.
					*/
					that.elements.header = that.elements.contents.querySelector('#' + key.header);
					that.elements.title = that.elements.contents.querySelector('#' + key.title);
					that.elements.progress = that.elements.contents.querySelector('#' + key.progress);
					that.elements.bar = that.elements.contents.querySelector('#' + key.bar);
					that.elements.main = that.elements.contents.querySelector('#' + key.main);
					that.elements.iframe = that.elements.contents.querySelector('#' + key.iframe);
					that.elements.button_group = that.elements.contents.querySelector('#' + key.button_group);
					that.elements.button_refresh = that.elements.contents.querySelector('#' + key.button_refresh);
					that.elements.button_hidden = that.elements.contents.querySelector('#' + key.button_hidden);
					that.elements.button_fullscreen = that.elements.contents.querySelector('#' + key.button_fullscreen);
					that.elements.button_close = that.elements.contents.querySelector('#' + key.button_close);
					that.elements.right_resize = that.elements.contents.querySelector('#' + key.right_resize);
					that.elements.bottom_resize = that.elements.contents.querySelector('#' + key.bottom_resize);
					that.elements.right_bottom_resize = that.elements.contents.querySelector('#' + key.right_bottom_resize);

					// storage (bunch modal 등에서 사용됨)
					that.elements.contents.storage = {
						'key': that.settings.key,
						//'title': encodeURIComponent(that.settings.title) // decodeURIComponent
						'title': that.settings.title
					};

					// event
					that.elements.iframe.onload = that.imports.bind(that);
					$(that.elements.button_refresh).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_REFRESH', function(e) { // iframe 새로고침
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						//that.elements.iframe.contentWindow.location.reload(true); // 비표준
						//that.elements.iframe.src += '';
						that.imports.call(that);
					});
					$(that.elements.button_hidden).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_HIDDEN', function(e) { // 팝업 숨기기
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						//that.elements.contents.style.display = 'none';
						that.hide();
					});
					$(that.elements.button_fullscreen).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_FULLSCREEN', function(e) { // fullscreen button
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						/*
						-
						풀스크린상태여부
						!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement
						-
						body를 전체화면 타겟으로 설정할경우: document.requestFullscreen -> document.documentElement.requestFullscreen (전체화면 취소는 document.exitFullscreen 형태)
						본문 요소를 전체 화면으로 구현하는 것이 당연하다고 생각할 수 있지만, WebKit 또는 Blink 기반 렌더링 엔진을 사용하는 경우 본문 너비가 촤대한 작은 크기로 줄어들고 그 안에 모든 콘텐츠가 들어가는 이상한 현상을 보게 될 것입니다. (Mozilla Gecko는 괜찮습니다.)
						*/
						if(((document.fullscreenElement && document.fullscreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen)) {
							// 축소
							if(document.exitFullscreen) { // hrome, Firefox 및 IE에서 프리픽스됨.
								document.exitFullscreen();
							}else if(document.mozCancelFullScreen) {
								document.mozCancelFullScreen();
							}else if(document.webkitExitFullscreen) {
								document.webkitExitFullscreen();
							}
						}else {
							// 확대
							if(that.elements.iframe.requestFullscreen) { // Chrome, Firefox, IE에서 프리픽스됨
								that.elements.iframe.requestFullscreen();
							}else if(that.elements.iframe.mozRequestFullScreen) {
								that.elements.iframe.mozRequestFullScreen();
							}else if(that.elements.iframe.webkitRequestFullscreen) {
								that.elements.iframe.webkitRequestFullscreen();
							}else if(that.elements.iframe.msRequestFullscreen) {
								that.elements.iframe.msRequestFullscreen();
							}
						}

						module.preventDefault(event);
						module.stopPropagation(event);
					});
					$(that.elements.button_close).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_CLOSE', function(e) { // 팝업 닫기 (삭제)
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						// iframe 중지
						that.elements.iframe.onload = null;
						//that.elements.contents.style.display = 'none';
						that.remove();
					});
					$(that.elements.header).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_MOVE', function(e) { // 팝업이동 mouse down
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						// 초기화
						$(window).off('.EVENT_MOUSEMOVE_POPUP_STORY_MOVE');
						$(window).off('.EVENT_MOUSEUP_POPUP_STORY_MOVE');
						that.elements.iframe.style.pointerEvents = 'auto';

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
						last.left = 0;
						last.top = 0;

						// z-index
						module.zindex += 1;
						that.elements.contents.style.zIndex = module.zindex;

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
						mouse.down.top = mouse.down.top - Number(String(that.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));
						mouse.down.left = mouse.down.left - Number(String(that.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));

						// snap 대상 element 배열에 저장
						var snap = [];
						var section = module.elements.story.querySelectorAll('section');
						var i, max;
						for(i=0, max=section.length; i<max; i++) {
							// 현재 element(story)를 제외한 element 들을 리스트에 담는다 (현재 display되고 있는 다른 story layer)
							if(that.elements.contents.isEqualNode(section[i]) === false && section[i].style && section[i].style.display !== 'none') {
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
						$(window).on(env['event']['move'] + '.EVENT_MOUSEMOVE_POPUP_STORY_MOVE', function(e) {
							var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches || event.changedTouches;

							module.preventDefault(event);
							module.stopPropagation(event);

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
							var bottom = parseInt(top + that.elements.contents.offsetHeight);
							var right = parseInt(left + that.elements.contents.offsetWidth);

							// 스크롤 제어
							that.elements.contents.scrollIntoView(false); // true 일 경우 엘리먼트가 스크롤 영역의 상단에 위치하도록 스크롤 됩니다. 만약  false 인 경우 스크롤 영역의 하단에 위치하게 됩니다.
							//that.elements.contents.scrollIntoView({block: "end", behavior: "instant"}); // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView

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
										left = snap[i].left - that.elements.contents.offsetWidth;
									}else if(Math.abs(snap[i].right - right) <= interval) {
										left = snap[i].right - that.elements.contents.offsetWidth;
									}else if(Math.abs(snap[i].right - left) <= interval) {
										left = snap[i].right;
									}

									// top 또는 bottom
									if(Math.abs(snap[i].top - top) <= interval) {
										top = snap[i].top;
									}else if(Math.abs(snap[i].top - bottom) <= interval) {
										top = snap[i].top - that.elements.contents.offsetHeight;
									}if(Math.abs(snap[i].bottom - bottom) <= interval) {
										top = snap[i].bottom - that.elements.contents.offsetHeight;
									}else if(Math.abs(snap[i].bottom - top) <= interval) {
										top = snap[i].bottom;
									}

									break;
								}
							}

							// 위치 적용
							if(0 <= top) {
								that.elements.contents.style.top = top + 'px';
							}
							if(0 <= left) {
								that.elements.contents.style.left = left + 'px';
							}
						});
						// mouse up
						$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_POPUP_STORY_MOVE', function(e) {
							var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
							var touch = event.changedTouches; // touchend

							module.preventDefault(event);

							// 초기화
							$(window).off('.EVENT_MOUSEMOVE_POPUP_STORY_MOVE');
							$(window).off('.EVENT_MOUSEUP_POPUP_STORY_MOVE');
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
						that.elements.contents.style.zIndex = module.zindex;

						//console.log('on');
						that.elements.contents.style.border = '1px dashed rgb(44, 45, 46)';
						$('iframe', module.elements.story).css({'pointerEvents': 'none'});
						$(window).on(env['event']['move'] + '.EVENT_MOUSEMOVE_POPUP_STORY_RESIZE', function(e) {
							var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
							//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
							var touch = event.touches || event.changedTouches;

							module.preventDefault(event);
							module.stopPropagation(event);

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
						$(window).on(env['event']['up'] + '.EVENT_MOUSEUP_POPUP_STORY_RESIZE', function(e) {
							var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
							var touch = event.changedTouches; // touchend

							//console.log('off');
							$(window).off('.EVENT_MOUSEMOVE_POPUP_STORY_RESIZE');
							$(window).off('.EVENT_MOUSEUP_POPUP_STORY_RESIZE');
							$('iframe', module.elements.story).css({'pointerEvents': 'auto'});
							//that.elements.iframe.style.pointerEvents = 'auto';
							that.elements.contents.style.border = '1px solid rgb(44, 45, 46)';
							document.documentElement.style.cursor = 'auto'; // <html>
							if(callback && typeof callback === 'function') {
								callback();
							}
						});
					};

					// localStorage 에 width, height 의 값을 저장한다.
					$(that.elements.right_resize).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHT', function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						// 초기화
						$(window).off('.EVENT_MOUSEMOVE_POPUP_STORY_RESIZE');
						$(window).off('.EVENT_MOUSEUP_POPUP_STORY_RESIZE');

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}

						document.documentElement.style.cursor = 'e-resize'; // <html>
						setMousePositionOn(function(position) {
							var position = position || {};
							var left = position.left || 0;
							var top = position.top || 0;

							left -= Number(String(that.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
							left -= resize_domain; // resize 버튼 크기
							if(0 <= left && that.settings.min.width <= left) {
								window.localStorage.setItem(('modal' + that.settings.key + 'width'), left);
								that.elements.contents.style.width = left + 'px';
							}
						});
						setMousePositionOff();
					});
					$(that.elements.bottom_resize).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_BOTTOM', function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						// 초기화
						$(window).off('.EVENT_MOUSEMOVE_POPUP_STORY_RESIZE');
						$(window).off('.EVENT_MOUSEUP_POPUP_STORY_RESIZE');

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}

						document.documentElement.style.cursor = 's-resize'; // <html>
						setMousePositionOn(function(position) {
							var position = position || {};
							var left = position.left || 0;
							var top = position.top || 0;

							top -= Number(String(that.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
							top -= resize_domain; // resize 버튼 크기
							if(0 <= top && that.settings.min.height <= top) {
								window.localStorage.setItem(('modal' + that.settings.key + 'height'), top);
								that.elements.contents.style.height = top + 'px';
								//that.elements.main.style.height = (Number(String(that.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.contents.style.borderTopWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.contents.style.borderBottomWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height)).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
								that.elements.main.style.height = (Number(String(that.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
							}
						});
						setMousePositionOff();
					});
					$(that.elements.right_bottom_resize).on(env['event']['down'] + '.EVENT_MOUSEDOWN_POPUP_STORY_RESIZE_RIGHTBOTTOM', function(e) {
						var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
						//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
						var touch = event.touches; // touchstart

						module.preventDefault(event);
						module.stopPropagation(event);

						// 초기화
						$(window).off('.EVENT_MOUSEMOVE_POPUP_STORY_RESIZE');
						$(window).off('.EVENT_MOUSEUP_POPUP_STORY_RESIZE');

						// 멀티터치 방지
						if(touch && touch.length && 1 < touch.length) {
							return;
						}

						document.documentElement.style.cursor = 'se-resize'; // <html>
						setMousePositionOn(function(position) {
							var position = position || {};
							var left = position.left || 0;
							var top = position.top || 0;

							left -= Number(String(that.elements.contents.style.left).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 left 값
							left -= resize_domain;
							if(0 <= left && that.settings.min.width <= left) {
								window.localStorage.setItem(('modal' + that.settings.key + 'width'), left);
								that.elements.contents.style.width = left + 'px';
							}
							top -= Number(String(that.elements.contents.style.top).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')); // 현재 팝업의 top 값
							top -= resize_domain;
							if(0 <= top && that.settings.min.height <= top) {
								window.localStorage.setItem(('modal' + that.settings.key + 'height'), top);
								that.elements.contents.style.height = top + 'px';
								//that.elements.iframe.height = Number(String(that.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'));
								//that.elements.main.style.height = (Number(String(that.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.contents.style.borderTopWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.contents.style.borderBottomWidth).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
								that.elements.main.style.height = (Number(String(that.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';
							}
						});
						setMousePositionOff();
					});
				};
			}
		})();

		// public
		var ModalStory = function(settings) {
			var that = this;
			that.settings = {
				'key': '',
				'listeners': {
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
			that.before = { // 값 변경전 기존 설정값 저장
				'scrollLeft': 0,
				'scrollTop': 0
			};

			// story 팝업간 차이
			that.gap = 20;
			// snap 을 발생시키도록하는 element와 element 간의 간격
			that.snap = 10;

			// private init
			init.call(that);
		};
		ModalStory.prototype = {
			change: function(settings) {
				var that = this;
				var key, tmp;

				try {
					for(key in settings) {
						switch(key) {
							/*
							case 'min':
							case 'listeners':
								for(tmp in settings[key]) {
									if(settings[key].hasOwnProperty(tmp)) {
										that.settings.listeners[tmp] = settings[key][tmp];
									}
								}
								break;
							default:
								that.settings[key] = settings[key];
								break;
							*/
						}
					}
				}catch(e) {
					if(typeof that.settings.listeners.error === 'function') {
						that.settings.listeners.error.call(that, e);
					}
				}

				return that;
			},
			/*position: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var top = parameter['top'] || null;
				var left = parameter['left'] || null;
				var target = that.elements.contents;

				target.style.webkitTransitionDuration = target.style.MozTransitionDuration = target.style.msTransitionDuration = target.style.OTransitionDuration = target.style.transitionDuration = '0s';
				if(top && left) {
					target.style.webkitTransform = 'translate(' + left + 'px, ' + top + 'px)' + 'translateZ(0)';
					target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translate(' + left + 'px, ' + top + 'px)';
				}else if(top) {
					target.style.webkitTransform = 'translateY(' + top + 'px)' + 'translateZ(0)';
					target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translateY(' + top + 'px)';
				}else if(left) {
					target.style.webkitTransform = 'translateX(' + left + 'px)' + 'translateZ(0)';
					target.style.msTransform = target.style.MozTransform = target.style.OTransform = 'translateX(' + left + 'px)';
				}
			},*/
			show: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var size, scroll = module.getBrowserScroll();

				// 이미 show 되어 있는 상태인지 확인


				// IOS 의 position: fixed 버그 대응
				if(module.isIOS === true) {
					$('html').css({'position': 'fixed'});
					that.before['scrollLeft'] = scroll.left;
					that.before['scrollTop'] = scroll.top;
				}

				// element
				if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
					that.elements.mask.style.zIndex = ++module.zindex;
					that.elements.mask.style.display = 'block';
				}
				if(env['monitor'] === 'mobile') { // 모바일에서의 style
					size = module.getWindowDocumentSize();

					that.elements.contents.style.width = (size.window.width - env['browser']['scrollbar']) + 'px';
					that.elements.contents.style.height = size.window.height + 'px';
					that.elements.main.style.height = size.window.height + 'px';

					//
					that.elements.contents.style.left = '0px';
					that.elements.contents.style.top = '0px';
				}else {
					// that.settings.key, 'modal' 값으로 localStorage 에 width, height 의 마지막 값이 저장되어 있는지 확인한다.
					that.elements.contents.style.width = (window.localStorage.getItem(('modal' + that.settings.key + 'width')) || that.settings.min.width) + 'px';
					that.elements.contents.style.height = (window.localStorage.getItem(('modal' + that.settings.key + 'height')) || that.settings.min.height) + 'px';
					that.elements.main.style.height = (Number(String(that.elements.contents.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5')) - Number(String(that.elements.header.style.height).replace(/^(-?)([0-9]*)(\.?)([^0-9]*)([0-9]*)([^0-9]*)/, '$1$2$3$5'))) + 'px';

					// childElementCount 를 활용하여 story 팝업 element개수 * childElementCount 계산하여 사용하자
					if((that.gap * 5) < last.left || (that.gap * 5) < last.top) {
						last.left = 0;
						last.top = 0;
					}
					last.left += that.gap;
					last.top += that.gap;
					that.elements.contents.style.left = last.left + 'px';
					that.elements.contents.style.top = last.top + 'px';
				}
				that.elements.contents.style.zIndex = ++module.zindex;
				that.elements.contents.style.display = 'block';

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.contents.setAttribute('tabindex', -1);
				that.elements.contents.focus();

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			},
			hide: function(parameter) {
				var that = this;
				var parameter = parameter || {};

				// IOS
				if(module.isIOS === true) {
					$('html').css({'position': module.before['position']});
					window.scrollTo(that.before['scrollLeft'], that.before['scrollTop']);
				}

				// element
				that.elements.contents.style.display = 'none';
				if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
					that.elements.mask.style.display = 'none';
				}

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// story 팝업의 겹쳐서 열리는 것을 방지하기 위한 값 다시계산
				if(0 <= (last.left - that.gap)) {
					last.left -= that.gap;
				}
				if(0 <= (last.top - that.gap)) {
					last.top -= that.gap;
				}

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			},
			remove: function(parameter) {
				var that = this;
				var parameter = parameter || {};

				// IOS
				if(module.isIOS === true) {
					$('html').css({'position': module.before['position']});
					window.scrollTo(that.before['scrollLeft'], that.before['scrollTop']);
				}

				// element
				if(that.elements.mask) {
					that.elements.mask.parentNode.removeChild(that.elements.mask);
				}
				if(that.elements.contents) {
					that.elements.contents.parentNode.removeChild(that.elements.contents);
				}
				that.elements = {};

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// story 팝업의 겹쳐서 열리는 것을 방지하기 위한 값 다시계산
				if(0 <= (last.left - that.gap)) {
					last.left -= that.gap;
				}
				if(0 <= (last.top - that.gap)) {
					last.top -= that.gap;
				}

				// instance
				if(that.settings['key'] && module.instance[that.settings['key']]) {
					delete module.instance[that.settings['key']];
				}

				// listeners
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
					'url': "//" + window.location.host + "/data/story",
					'data': {
						'block': that.settings['key']
					},
					'progressDownload': function(progress) {
						//console.log(progress);
						if(typeof that.elements.bar === 'object') {
							that.elements.bar.style.display = 'block';
							that.elements.bar.style.width = progress + '%';
							if(progress >= 100) {
								window.setTimeout(function() {
									that.elements.bar.style.display = 'none';
								}, 300);
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

		// public return
		return ModalStory;
	})();

	// 실행중인 story 팝업 리스트
	var ModalBunch = function(settings) {
		var that = this;
		that.settings = {
			'key': '',
			'listeners': {
				'show': null,
				'hide': null,
				'error': null
			},
			'esc': true // 키보드 esc 닫기실행
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		(function() {
			var fragment = document.createDocumentFragment();
			var key = {};
			var size, li, count;

			// 화면 중앙에 contents 가 위치하도록 계산
			size = module.getWindowDocumentSize();
			li = 100; // 리스트 (li태그) 1개 기준 가로 px (padding, margin 포함)
			count = Math.floor(size.document.width / li);
			if(9 < count) { // 최대 가로 출력 개수 제한
				count = 9;
			}

			// key
			key.close_button = module.getKey();
			key.list = module.getKey();

			// mask
			that.elements.mask = document.createElement('div');
			that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(253, 254, 255) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
			module.elements.bunch.appendChild(that.elements.mask);

			// contents
			that.elements.contents = document.createElement('div');
			that.elements.contents.style.cssText = 'position: absolute; margin: 0 auto; width: ' + (li * count) + 'px;';
			that.elements.contents.innerHTML = '\
				<header style="padding: 30px 10px 0px 10px;">\
					This is the running kit list.\
					<nav style=""></nav>\
				</header>\
				<div style="padding: 20px 0px 30px 0px;">\
					<!-- app 리스트 //-->\
					<ul id="' + key.list + '" class="clear-after" style=""></ul>\
				</div>\
				<!-- close button //-->\
				<div style="position: fixed; top: 20px; right: 20px;">\
					<button id="' + key.close_button + '" style="padding: 2px 4px; background-color: rgba(253, 254, 255, .86); border-radius: 5px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" style="fill: rgb(44, 45, 46);"><path style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Bitstream Vera Sans" d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 L 9.15625 6.3125 z" color="#000" overflow="visible" enable-background="accumulate" font-family="Bitstream Vera Sans"/></svg></button>\
				</div>\
			';

			// container
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
			that.elements.container.appendChild(that.elements.contents);
			fragment.appendChild(that.elements.container);
			module.elements.bunch.appendChild(fragment);

			// search element
			that.elements.close_button = that.elements.container.querySelector('#' + key.close_button);
			that.elements.list = that.elements.container.querySelector('#' + key.list);

			// event
			$(that.elements.close_button).on(env['event']['click'] + '.EVENT_CLICK_CLOSE_' + that.settings.key, function(e) {
				var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
				module.preventDefault(event);
				module.stopPropagation(event);
				that.hide();
			});
		})();
	};
	ModalBunch.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;

			try {
				for(key in settings) {
					switch(key) {
						/*
						case 'listeners':
							for(tmp in settings[key]) {
								if(settings[key].hasOwnProperty(tmp)) {
									that.settings.listeners[tmp] = settings[key][tmp];
								}
							}
							break;
						default:
							that.settings[key] = settings[key];
							break;
						*/
					}
				}
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		position: function() {
			var that = this;

			try {
				module.setPosition({'position': 'topcenter', 'element': that.elements.contents});
			}catch(e) {
				if(typeof that.settings.listeners.error === 'function') {
					that.settings.listeners.error.call(that, e);
				}
			}

			return that;
		},
		show: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var size = module.getWindowDocumentSize();

			// 실행중인 stroy
			(function(that) {
				var i, max;
				var child = module.elements.story.children;
				var fragment = document.createDocumentFragment();
				var li;

				// TextNode 포함 내부 element 전체 제거
				while(that.elements.list.hasChildNodes()) {
					that.elements.list.removeChild(that.elements.list.lastChild);
				}
				// story elements 검색
				for(i=0, max=child.length; i<max; i++) {
					// story storage (title 이 modal 생성시 저장된다.)
					if(child[i].storage) {
						// li 생성
						li = document.createElement('li');
						li.style.cssText = "float: left; position: relative; margin: 5px; padding: 10px; width: 68px; height: 68px; border: 1px solid rgba(44, 45, 46, .96); border-radius: 5px; overflow: hidden;";
						li.innerHTML = '\
							<button style="margin: 0; padding: 0; color: rgb(44, 45, 46); word-wrap:break-word; word-break:break-all" data-type="title">' + decodeURIComponent(child[i].storage.title) + '</button>\
							<button style="position: absolute; right: 10px; bottom: 10px; margin: 0; padding: 0px; color: rgb(44, 45, 46);" data-type="close">close</button>\
						';
						// event
						(function(li, key) {
							var title_button, close_button;
							if(module.instance[key]) {
								// 레이어가 종료(삭제)될 때 하위 이벤트도 같이 해제 되어야 한다.
								title_button = li.querySelector('button[data-type="title"]');
								$(title_button).on(env['event']['down'], function() {
									// story 삭제
									module.instance[key].show();
									// bunch 닫기
									that.hide();
								});
								close_button = li.querySelector('button[data-type="close"]');
								$(close_button).on(env['event']['down'], function() {
									// story 삭제
									module.instance[key].remove();
									// li 삭제
									li.parentNode.removeChild(li);
								});
							}
						})(li, child[i].storage.key);
						//
						fragment.appendChild(li);
					}
				}
				that.elements.list.appendChild(fragment);
			})(that);

			// 스크롤바 사이즈만큼 여백
			if(size.window.height < size.document.height) {
				$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
			}

			// element
			that.elements.mask.style.zIndex = ++module.zindex;
			that.elements.mask.style.display = 'block';
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';
			that.position();

			// focus (웹접근성)
			module.active = document.activeElement;
			that.elements.container.setAttribute('tabindex', -1);
			that.elements.container.focus();

			// queue
			while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
				module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
			}
			module.queue['order'].push(that.settings.key);

			// listeners
			if(typeof that.settings.listeners.show === 'function') {
				that.settings.listeners.show.call(that);
			}
			if(typeof parameter.callback === 'function') {
				parameter.callback.call(that);
			}
		},
		hide: function(parameter) {
			var that = this;
			var parameter = parameter || {};

			// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
			$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

			// element
			that.elements.container.style.display = 'none';
			that.elements.mask.style.display = 'none';

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}

			// queue
			while(module.queue['order'].indexOf(that.settings.key) !== -1) { // 기존값 제거
				module.queue['order'].splice(module.queue['order'].indexOf(that.settings.key), 1);
			}

			// listeners
			if(typeof that.settings.listeners.hide === 'function') {
				that.settings.listeners.hide.call(that);
			}
			if(typeof parameter.callback === 'function') {
				parameter.callback.call(that);
			}
		}
	};

	// market
	var ModalMarket = (function() {
		// private
		var worker;

		// public
		var ModalMarket = function(settings) {
			var that = this;
			that.settings = {
				'key': '',
				'listeners': {
					'show': null,
					'hide': null,
					'error': null,
					'add': null // block 추가 이벤트 콜벡
				}
			};
			that.settings = module.setSettings(that.settings, settings);
			that.elements = {};

			// private init
			(function() {
				var fragment = document.createDocumentFragment();
				var key = {};
				var size, li, count;

				// 화면 중앙에 contents 가 위치하도록 계산
				size = module.getWindowDocumentSize();
				li = 150; // 리스트 (li태그) 1개 기준 가로 px (padding, margin 포함)
				count = Math.floor(size.document.width / li);
				if(5 < count) { // 최대 가로 출력 개수 제한
					count = 5;
				}

				// key
				key.close_button = module.getKey();
				key.loading = module.getKey();
				key.list = module.getKey();
				key.view = module.getKey();

				// mask
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: rgb(253, 254, 255) none repeat scroll 0 0; opacity: .96; -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				module.elements.market.appendChild(that.elements.mask);

				// contents
				that.elements.contents = document.createElement('div');
				that.elements.contents.style.cssText = 'position: absolute; margin: 0 auto; width: ' + (li * count) + 'px;';
				that.elements.contents.innerHTML = '\
					<header style="padding: 30px 10px 0px 10px;">\
						Market\
						<nav style=""></nav>\
					</header>\
					<div style="padding: 20px 0px 30px 0px;">\
						<!-- loading //-->\
						<div id="' + key.loading + '" class="loading" style="display: none;">\
							<div class="icon">\
								<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve"><rect x="0" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="8" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="16" y="10" width="4" height="10"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect></svg>\
							</div>\
						</div>\
						<!-- app 리스트 //-->\
						<ul id="' + key.list + '" class="clear-after" style=""></ul>\
						<!-- app 뷰(설명 등 보기) //-->\
						<div id="' + key.view + '" style="display: none;"></div>\
					</div>\
					<!-- close button //-->\
					<div style="position: fixed; top: 20px; right: 20px;">\
						<button id="' + key.close_button + '" style="padding: 2px 4px; background-color: rgba(253, 254, 255, .86); border-radius: 5px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" style="fill: rgb(44, 45, 46);"><path style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Bitstream Vera Sans" d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 L 9.15625 6.3125 z" color="#000" overflow="visible" enable-background="accumulate" font-family="Bitstream Vera Sans"/></svg></button>\
					</div>\
				';

				// container
				that.elements.container = document.createElement('div');
				that.elements.container.style.cssText = 'position: fixed; display: none; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; outline: none; -webkit-overflow-scrolling: touch;  -khtml-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-touch-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -webkit-tap-highlight-color: transparent;';
				that.elements.container.appendChild(that.elements.contents);
				fragment.appendChild(that.elements.container);
				module.elements.market.appendChild(fragment);

				// search element
				that.elements.close_button = that.elements.container.querySelector('#' + key.close_button);
				that.elements.loading = that.elements.container.querySelector('#' + key.loading);
				that.elements.list = that.elements.container.querySelector('#' + key.list);
				that.elements.view = that.elements.container.querySelector('#' + key.view);

				// event
				$(that.elements.close_button).on(env['event']['click'] + '.EVENT_CLICK_CLOSE_' + that.settings.key, function(e) {
					var event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
					module.preventDefault(event);
					module.stopPropagation(event);
					that.hide();
				});

				// worker
				function setMarketList(result) { // 리스트 생성
					var fragment;
					var i, max;

					// html
					if(!result.page) {
						that.elements.list.innerHTML = result.html;
					}else {
						that.elements.list.appendChild(api.util.fragmentHtml(result.html));
					}
					// json
					for(i=0, max=result.json.list.length; i<max; i++) {
						(function(block, form) { // 콜바이 레퍼런트가 발생하지 않도록 값복사 한다. (스코프 체이닝)
							$(that.elements.list.querySelector('button[data-block="' + block + '"]')).on(env['event']['down'], function() {
								// 버튼 숨기기
								this.style.display = 'none';
								// block add listeners
								that.settings.listeners.add(block, form);
							});
						})(result.json.list[i].block, result.json.list[i].form);
					}
				}
				worker = api.worker({
					'url': "//" + window.location.host + "/js/worker.template.min.js",
					'listeners': {
						'message': function(data) {
							var data = data || {};
							var message = data.message || {};
							var result = data.result;

							//console.log('template 응답');
							//console.dir(data);

							// loading
							that.elements.loading.style.display = 'none';

							switch(message.call) {
								case 'marketList': // 리스트 
									if(typeof result === 'object' && result.json && result.html) {
										setMarketList(result);
									}
									break;
								case 'marketMore': // 자세히 보기

									break;
								case 'marketBest': // 베스트 리스트

									break;
							}

							// 위치 재조정
							//that.position();
						}
					}
				});
			})();
		};
		ModalMarket.prototype = {
			change: function(settings) {
				var that = this;
				var key, tmp;

				try {
					for(key in settings) {
						switch(key) {
							/*
							case 'listeners':
								for(tmp in settings[key]) {
									if(settings[key].hasOwnProperty(tmp)) {
										that.settings.listeners[tmp] = settings[key][tmp];
									}
								}
								break;
							default:
								that.settings[key] = settings[key];
								break;
							*/
						}
					}
				}catch(e) {
					if(typeof that.settings.listeners.error === 'function') {
						that.settings.listeners.error.call(that, e);
					}
				}

				return that;
			},
			position: function() {
				var that = this;

				try {
					module.setPosition({'position': 'topcenter', 'element': that.elements.contents});
				}catch(e) {
					if(typeof that.settings.listeners.error === 'function') {
						that.settings.listeners.error.call(that, e);
					}
				}

				return that;
			},
			show: function(parameter) {
				var that = this;
				var parameter = parameter || {};
				var size = module.getWindowDocumentSize();

				// loading
				that.elements.loading.style.display = 'block';

				// ajax (서버에서 블록 리스트를 받아와서 템플릿을 이용해서 페인팅한다.)
				worker.send({'call': 'marketList', 'parameter': {}});

				// 스크롤바 사이즈만큼 여백
				if(size.window.height < size.document.height) {
					$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
				}

				// element
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
				that.elements.container.style.zIndex = ++module.zindex;
				that.elements.container.style.display = 'block';
				that.position();

				// focus (웹접근성)
				module.active = document.activeElement;
				that.elements.container.setAttribute('tabindex', -1);
				that.elements.container.focus();

				// listeners
				if(typeof that.settings.listeners.show === 'function') {
					that.settings.listeners.show.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			},
			hide: function(parameter) {
				var that = this;
				var parameter = parameter || {};

				// 스크롤바 관련 (닫을 때 document 사이즈가 변경되었을 수 있기 때문에 if(조건문) 검사를 안한다.)
				$('html').css({'margin-right': module.before['margin-right'], 'overflow': module.before['overflow']});

				// element
				that.elements.container.style.display = 'none';
				that.elements.mask.style.display = 'none';

				// focus (웹접근성)
				if(module.active) {
					module.active.focus();
				}

				// listeners
				if(typeof that.settings.listeners.hide === 'function') {
					that.settings.listeners.hide.call(that);
				}
				if(typeof parameter.callback === 'function') {
					parameter.callback.call(that);
				}
			}
		};

		// public return
		return ModalMarket;
	})();

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------

	// public return
	return {
		search: function(key) {
			return module.instance[key] || false;
		},
		setup: function(settings) {
			var instance;

			settings['key'] = settings['key'] || settings['type'] || ''; // 중복생성 방지 key 검사
			if(settings['key'] && this.search(settings['key'])) {
				instance = this.search(settings['key']);
				if(instance.change/* && JSON.stringify(instance.settings) !== JSON.stringify(settings)*/) {
					instance.change(settings);
				}
			}else if(settings['type']) {
				switch(settings['type']) {
					case 'layer':
						instance = new ModalLayer(settings);
						break;
					case 'rect':
						instance = new ModalRect(settings);
						break;
					case 'confirm':
						instance = new ModalConfirm(settings);
						break;
					case 'alert':
						instance = new ModalAlert(settings);
						break;
					case 'push':
						instance = new ModalPush(settings);
						break;
					case 'folder':
						if(settings['all']) {
							// 전체 폴더 제목 상태 변경
							(function() {
								var key;
								for(key in module.instance) {
									if(module.instance[key].settings && module.instance[key].settings['type'] === 'folder') {
										module.instance[key].titleToggle({'mode': settings['all']['mode']});
									}
								}
							})();
						}else {
							instance = new ModalFolder(settings);
						}
						break;
					case 'story':
						instance = new ModalStory(settings);
						break;
					case 'bunch':
						instance = new ModalBunch(settings);
						break;
					case 'market':
						instance = new ModalMarket(settings);
						break;
				}
				if(settings['key'] && instance) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		show: function(parameter) { // 전체 또는 해당 key
			var parameter = parameter || {};
			var key = parameter['key'];
			var type = parameter['type'];
			var setShow = function(instance, type) {
				if(typeof instance.hide === 'function') {
					instance.hide();
				}
			};

			if(key) {
				this.search(key) && this.search(key).show();
			}else {
				for(key in module.instance) {
					module.instance.hasOwnProperty(key) && setShow(module.instance[key], type);
				}
			}
		},
		hide: function(parameter) { // 전체 또는 해당 key
			var parameter = parameter || {};
			var key = parameter['key'];
			var type = parameter['type'];
			var setHide = function(instance, type) {
				if(typeof instance.hide === 'function') {
					instance.hide();
				}
			};

			if(key) {
				this.search(key) && this.search(key).hide();
			}else {
				for(key in module.instance) {
					module.instance.hasOwnProperty(key) && setHide(module.instance[key], type);
				}
			}
		}
	};

}, this);
