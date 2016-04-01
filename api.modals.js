/*
Modals

@date
2016.03

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
IE8 이상
querySelectorAll: Chrome 1, Firefox 3.5, Internet Explorer 8, Opera 10, Safari 3.2
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || ((!global.api || !global.api.dom) && !global.jQuery)) {
		return false;
	}else if(!global.api) {
		global.api = {};
	}
	global.api.modals = factory(global, global.jQuery || global.api.dom);

})(function(global, $, undefined) {

	'use strict'; // ES5

	//
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

				// push
				this.elements.push = document.createElement('div');
				this.elements.push.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.push);

				// confirm
				this.elements.confirm = document.createElement('div');
				this.elements.confirm.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.confirm);

				// alert
				this.elements.alert = document.createElement('div');
				this.elements.alert.style.cssText = 'position: fixed; left: 0px; top: 0px;';
				this.elements.container.appendChild(this.elements.alert);

				document.body.appendChild(fragment);
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
			'domain': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
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
			// create element
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; left: 0px; top: 0px; width: 100%; height: 100%; overflow: auto; background-color: rgba(255, 255, 255, 0.5);';
				module.elements.layer.appendChild(that.elements.mask);
			}
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: absolute; z-index: ' + (++module.zindex) + '; display: none;';
			module.elements.layer.appendChild(that.elements.container);
			that.elements.container.appendChild($('#' + that.settings.target).get(0));
			
			// 팝업내부 close 버튼 클릭시 닫기
			if(that.settings.close) {
				$(that.elements.container).find('.' + that.settings.close).on(env['event']['click'], function(event) {
					that.close();
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

			//module.elements.layer.style.display = 'block';
			module.setLeftTop(that.settings.position, that.elements.container);
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

	// 푸시
	var Push = function(settings) {
		var that = this;
		that.type = 'push';
		that.settings = {
			'key': '',
			'position': 'topright',
			'domain': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
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
			key.message = getKey();
			key.close = getKey();

			// create element
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; left: 0px; top: 0px; width: 100%; height: 100%; overflow: auto; background-color: rgba(255, 255, 255, 0.5);';
				module.elements.push.appendChild(that.elements.mask);
			}
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div id="' + key.title + '" style="padding: 18px 18px 0 0; text-align: right;">\
					<button id="' + key.close + '" style="margin: 0 0 0 18px; padding: 0; font-size: 12px; color: #333; background-color: transparent; border: 0 none; cursor: pointer;">CLOSE</button>\
				</div>\
				<div id="' + key.message + '" style="padding: 18px;">' + that.settings.message + '</div>\
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

			module.setLeftTop(that.settings.position, that.elements.container);
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

			//callback
			if(typeof that.settings.callback.hide === 'function') {
				return that.settings.callback.hide();
			}
		}
	};

	// 확인
	var Confirm = function(settings) {
		var that = this;
		that.type = 'confirm';
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'domain': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
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

			// create element
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; left: 0px; top: 0px; width: 100%; height: 100%; overflow: auto; background-color: rgba(255, 255, 255, 0.5);';
				module.elements.confirm.appendChild(that.elements.mask);
			}
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, .08);';
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
			module.setLeftTop(that.settings.position, that.elements.container);
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
			'domain': null, // 기본은 document(body) 이나 값이 있을 경우 해당 타겟기준으로 위치가 설정됨
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

			// create element
			if(typeof that.settings.mask === 'boolean' && that.settings.mask === true) { // mask 값이 element 가 아닌 boolean 타입일 때
				that.elements.mask = document.createElement('div');
				that.elements.mask.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; left: 0px; top: 0px; width: 100%; height: 100%; overflow: auto; background-color: rgba(255, 255, 255, 0.5);';
				module.elements.alert.appendChild(that.elements.mask);
			}
			that.elements.container = document.createElement('div');
			that.elements.container.style.cssText = 'position: fixed; z-index: ' + (++module.zindex) + '; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, .08);';
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
			module.setLeftTop(that.settings.position, that.elements.container);
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
					case 'push':
						instance = new Push(settings);
						break;
					case 'confirm':
						instance = new Confirm(settings);
						break;
					case 'alert':
						instance = new Alert(settings);
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
