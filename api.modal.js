/*
Modal

@date
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
element 위치
문서 내에서 렌더링 된 엘리먼트의 절대 위치를 계산해야 한다면,
getClientRects() 와 getBoundingClientRect() 메서드를 사용해 윈도우 기준으로 렌더링 된 위치를 가져온 후에,
문서의 스크롤 값을 더해주면 된다.

http://e-rooms.tistory.com/entry/HTML-Element-%EA%B0%9D%EC%B2%B4%EC%97%90%EC%84%9C-%EC%A0%9C%EA%B3%B5%ED%95%98%EB%8A%94-%ED%81%AC%EA%B8%B0-%EB%B0%8F-%EC%9C%84%EC%B9%98-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0%EC%99%80-%EB%A9%94%EC%86%8C%EB%93%9C
http://ohgyun.com/569

getClientRects
getBoundingClientRect 추천

// For scrollX
(((t = document.documentElement) || (t = document.body.parentNode)) && typeof t.ScrollLeft == 'number' ? t : document.body).ScrollLeft
// For scrollY
(((t = document.documentElement) || (t = document.body.parentNode)) && typeof t.ScrollTop == 'number' ? t : document.body).ScrollTop

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

	// key (일반적인 고유값)
	var getKey;
	if(global.api && global.api.key) {
		getKey = global.api.key;
	}else {
		getKey = function() {
			var arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'/*,'0','1','2','3','4','5','6','7','8','9'*/];
			var date = new Date();
			return [arr[Math.floor(Math.random() * arr.length)], Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), date.getFullYear(), (Number(date.getMonth()) + 1), date.getDay(), date.getHours(), date.getMinutes()].join('');
		};
	}

	// 스크롤바 사이즈
	var scrollbar = (function() { // 브라우저별 스크롤바 폭 (모바일브라우저 주의)
		var div = document.createElement("div");
		var scrollbar = 0;
		div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.documentElement.appendChild(div);
		scrollbar = div.offsetWidth - div.clientWidth;
		document.documentElement.removeChild(div);
		return scrollbar;
	})();

	// 모듈 (공통 사용기능)
	var module = (function() {
		function Module() {
			var that = this;
			// 팝업 z-index 관리
			that.zindex = 100;
			// 현재 포커스 위치
			that.active;
			// key가 있는 인스턴스
			that.instance = {}; 
			//
			that.elements = {};
			//
			that.init();
		}
		Module.prototype = {
			init: function() {
				// fragment
				var fragment = document.createDocumentFragment();

				// container
				this.elements.container = document.createElement('div');
				this.elements.container.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				fragment.appendChild(this.elements.container);

				// layer
				this.elements.layer = document.createElement('div');
				this.elements.layer.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.layer);

				// confirm
				this.elements.confirm = document.createElement('div');
				this.elements.confirm.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.confirm);

				// alert
				this.elements.alert = document.createElement('div');
				this.elements.alert.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.alert);

				// push
				this.elements.push = document.createElement('div');
				this.elements.push.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.push);

				//
				$(document).ready(function() {
					document.body.appendChild(fragment);
				});
			},
			setSettings: function(settings, options) {
				var key;
				for(key in options) {
					if(options[key].constructor === Object) {
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
			// 위치설정
			setLeftTop: function(position, element) {
				// 위치 설정
				var width = 0;
				var height = 0;
				var size = {};
				var center = {'left': 0, 'top': 0};
				var tmp_height, tmp_top;
				if(typeof position === 'string') {
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
			}
		};
		return new Module();
	})();

	// 레이어
	var Layer = function(settings) {
		var that = this;
		that.type = 'layer';
		that.settings = {
			'key': '',
			'position': 'center',
			'rect': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null
			},
			'target': '', // #id
			'close': '' // .class
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		(function() { 
			// contents
			that.elements.contents = $('#' + that.settings.target).get(0);
			that.elements.contents.style.position = 'relative';

			// mask
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #363738 none repeat scroll 0 0; opacity: .6;';
				module.elements.layer.appendChild(that.elements.mask);
			}else if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask = that.settings.mask;
				that.elements.mask.display = 'none';
			}

			// container
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; display: none;';
			that.elements.container.appendChild(that.elements.contents);
			module.elements.layer.appendChild(that.elements.container);
			
			// 팝업내부 close 버튼 클릭시 닫기
			if(that.settings.close) {
				$(that.elements.contents).find('.' + that.settings.close).on(env['event']['click'], function(event) {
					that.hide();
				});
			}
		})();
	};
	Layer.prototype = {
		postion: function(postion) {
			var that = this;
			return that;
		},
		show: function() {
			var that = this;

			// 스크롤바 사이즈만큼 여백
			if(document.documentElement.clientHeight < document.body.offsetHeight) {
				$('html').css({'margin-right': scrollbar + 'px', 'overflow': 'hidden'});
			}

			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			module.setLeftTop(that.settings.position, that.elements.contents);
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';

			// focus (웹접근성)
			module.active = document.activeElement;
			that.elements.container.setAttribute('tabindex', -1);
			that.elements.container.focus();
		},
		hide: function() {
			var that = this;

			$('html').css({'margin-right': '', 'overflow': ''});
			that.elements.container.style.display = 'none';
			//module.elements.layer.style.display = 'none';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}
		},
		resizeOn: function() {

		},
		resizeOff: function() {

		}
	};

	// 확인
	var Confirm = function(settings) {
		var that = this;
		that.type = 'confirm';
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'rect': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null,
				'ok': function() {
					return true;
				},
				'cancel': function() {
					return false;
				}
			},
			'title': '',
			'message': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			// key
			key.title = getKey();
			key.message = getKey();
			key.ok = getKey();
			key.cancel = getKey();

			// mask
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #363738 none repeat scroll 0 0; opacity: .6;';
				module.elements.confirm.appendChild(that.elements.mask);
			}else if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask = that.settings.mask;
				that.elements.mask.display = 'none';
			}

			// container
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div id="' + key.title + '" style="padding: 18px;">' + that.settings.title + '</div>\
				<div id="' + key.message + '" style="padding: 18px; min-height: 60px; background-color: #FAFBFC;">' + that.settings.message + '</div>\
				<div style="padding: 18px; text-align: right;">\
					<button id="' + key.ok + '" style="margin: 0 0 0 18px; padding: 0; font-size: 12px; color: #333; background-color: transparent; border: 0 none; cursor: pointer;">OK</button>\
					<button id="' + key.cancel + '" style="margin: 0 0 0 18px; padding: 0; font-size: 12px; color: #999; background-color: transparent; border: 0 none; cursor: pointer;">CANCEL</button>\
				</div>\
			';
			fragment.appendChild(that.elements.container);
			module.elements.confirm.appendChild(fragment);

			// search element
			that.elements.title = that.elements.container.querySelector('#' + key.title);
			that.elements.message = that.elements.container.querySelector('#' + key.message);
			that.elements.ok = that.elements.container.querySelector('#' + key.ok);
			that.elements.cancel = that.elements.container.querySelector('#' + key.cancel);

			// event
			$(that.elements.ok).on(env['event']['click'], function() {
				that.hide();
				//callback
				if(typeof that.settings.callback.ok === 'function') {
					return that.settings.callback.ok();
				}
			});
			$(that.elements.cancel).on(env['event']['click'], function() {
				that.hide();
				//callback
				if(typeof that.settings.callback.cancel === 'function') {
					return that.settings.callback.cancel();
				}
			});
		})();
	};
	Confirm.prototype = {
		title: function(title) {
			var that = this;
			that.elements.title.textContent = title || '';
			return that;
		},
		message: function(message) {
			var that = this;
			that.elements.message.textContent = message || '';
			return that;
		},
		callback: function(callback) {
			var that = this;
			var key;
			for(key in callback) {
				if(callback.hasOwnProperty(key) && typeof callback[key] === 'function') {
					that.settings.callback[key] = callback[key];
				}
			}
			return that;
		},
		show: function() {
			var that = this;

			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			module.setLeftTop(that.settings.position, that.elements.container);
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';

			// focus (웹접근성)
			module.active = document.activeElement;
			that.elements.container.setAttribute('tabindex', -1);
			that.elements.container.focus();

			//callback
			if(typeof that.settings.callback.show === 'function') {
				that.settings.callback.show();
			}
		},
		hide: function() {
			var that = this;
			that.elements.container.style.display = 'none';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}

			//callback
			if(typeof that.settings.callback.hide === 'function') {
				return that.settings.callback.hide();
			}
		}
	};

	// 경고
	var Alert = function(settings) {
		var that = this;
		that.type = 'alert';
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'rect': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null
			},
			'title': '',
			'message': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			// key
			key.title = getKey();
			key.message = getKey();
			key.ok = getKey();

			// mask
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #363738 none repeat scroll 0 0; opacity: .6;';
				module.elements.alert.appendChild(that.elements.mask);
			}else if(that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType) {
				that.elements.mask = that.settings.mask;
				that.elements.mask.display = 'none';
			}

			// container
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div id="' + key.title + '" style="padding: 18px;">' + that.settings.title + '</div>\
				<div id="' + key.message + '" style="padding: 18px; min-height: 60px; background-color: #FAFBFC;">' + that.settings.message + '</div>\
				<div style="padding: 18px; text-align: right;">\
					<button id="' + key.ok + '" style="margin: 0 0 0 18px; padding: 0; font-size: 12px; color: #333; background-color: transparent; border: 0 none; cursor: pointer;">OK</button>\
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
		})();
	};
	Alert.prototype = {
		title: function(title) {
			var that = this;
			that.elements.title.textContent = title || '';
			return that;
		},
		message: function(message) {
			var that = this;
			that.elements.message.textContent = message || '';
			return that;
		},
		callback: function(callback) {
			var that = this;
			var key;
			for(key in callback) {
				if(callback.hasOwnProperty(key) && typeof callback[key] === 'function') {
					that.settings.callback[key] = callback[key];
				}
			}
			return that;
		},
		show: function() {
			var that = this;
			
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			module.setLeftTop(that.settings.position, that.elements.container);
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';

			// focus (웹접근성)
			module.active = document.activeElement;
			that.elements.container.setAttribute('tabindex', -1);
			that.elements.container.focus();

			//callback
			if(typeof that.settings.callback.show === 'function') {
				that.settings.callback.show();
			}
		},
		hide: function() {
			var that = this;
			that.elements.container.style.display = 'none';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}

			//callback
			if(typeof that.settings.callback.hide === 'function') {
				that.settings.callback.hide();
			}
		}
	};

	// 푸시
	var Push = function(settings) {
		var that = this;
		that.type = 'push';
		that.settings = {
			'key': '',
			'position': 'topright',
			'rect': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null
			},
			'time': 0, // 0 보다 큰 값은 자동닫기 설정
			'message': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

			// key
			key.close = getKey();
			key.message = getKey();

			// mask
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; display: none; left: 0px; top: 0px; width: 100%; height: 100%; background: #363738 none repeat scroll 0 0; opacity: .6;';
				module.elements.push.appendChild(that.elements.mask);
			}else if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask = that.settings.mask;
				that.elements.mask.display = 'none';
			}

			// container
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div style="padding: 18px 18px 0 0; text-align: right;">\
					<button id="' + key.close + '" style="margin: 0 0 0 18px; padding: 0; font-size: 12px; color: #333; background-color: transparent; border: 0 none; cursor: pointer;">CLOSE</button>\
				</div>\
				<div id="' + key.message + '" style="padding: 18px;">' + that.settings.message + '</div>\
			';
			fragment.appendChild(that.elements.container);
			module.elements.push.appendChild(fragment);

			// search element
			that.elements.close = that.elements.container.querySelector('#' + key.close);
			that.elements.message = that.elements.container.querySelector('#' + key.message);

			// event
			$(that.elements.close).on(env['event']['click'], function() {
				that.hide();
			});
		})();
	};
	Push.prototype = {
		message: function(message) {
			var that = this;
			that.elements.message.textContent = message || '';
			return that;
		},
		callback: function(callback) {
			var that = this;
			var key;

			for(key in callback) {
				if(callback.hasOwnProperty(key) && typeof callback[key] === 'function') {
					that.settings.callback[key] = callback[key];
				}
			}
			return that;
		},
		show: function() {
			var that = this;

			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			module.setLeftTop(that.settings.position, that.elements.container);
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';

			// auto hide
			if(typeof that.settings.time === 'number' && that.settings.time > 0) {
				global.setTimeout(function() {
					that.hide();
				}, that.settings.time);
			}

			//callback
			if(typeof that.settings.callback.show === 'function') {
				that.settings.callback.show();
			}
		},
		hide: function() {
			var that = this;

			that.elements.container.style.display = 'none';
			if(that.settings.mask && typeof that.elements.mask === 'object' && that.elements.mask.nodeType) {
				that.elements.mask.style.display = 'none';
			}

			//callback
			if(typeof that.settings.callback.hide === 'function') {
				return that.settings.callback.hide();
			}
		}
	};

	// public return
	return {
		'setup': function(settings) {
			// 인스턴스 생성
			var instance;
			if(settings['key'] && module.instance[settings['key']]) {
				instance = module.instance[settings['key']];
			}else {
				switch(settings['type']) {
					case 'layer':
						instance = new Layer(settings);
						break;
					case 'confirm':
						instance = new Confirm(settings);
						break;
					case 'alert':
						instance = new Alert(settings);
						break;
					case 'push':
						instance = new Push(settings);
						break;
				}
				if(settings['key']) {
					module.instance[settings['key']] = instance;
				}
			}
			return instance;
		},
		'instance': function(key) {
			return module.instance[key] || null;
		}
	};

}, this);
