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
			'browser': {
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

	// ajax
	if(!global.jQuery && global.api && global.api.xhr) {
		$.ajax = global.api.xhr;
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
					this.elements.container.style.cssText = 'position: fixed; left: 0px; top: 0px; z-index: 2147483647;'; // z-index 최대값: 2147483647
					fragment.appendChild(this.elements.container);

					// layer
					this.elements.layer = document.createElement('div');
					this.elements.layer.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.layer);

					// step
					this.elements.step = document.createElement('div');
					this.elements.step.style.cssText = 'position: fixed; left: 0px; top: 0px;';
					this.elements.container.appendChild(this.elements.step);

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
					}else if(options[key] && typeof options[key] === 'object' && !options[key].nodeType) {
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
				var scroll = (function() {
					if('pageXOffset' in window && 'pageYOffset' in window) {
						return {'left': window.pageXOffset, 'top': window.pageYOffset};
					}else if(document.body && ('scrollLeft' in document.body && 'scrollTop' in document.body)) {
						return {'left': document.body.scrollLeft, 'top': document.body.scrollTop};
					}else if(document.documentElement && ('scrollLeft' in document.documentElement && 'scrollTop' in document.documentElement)) {
						return {'left': document.documentElement.scrollLeft, 'top': document.documentElement.scrollTop};
					}
				})();
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
				if(/^top/.test(position)) {
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
				}
			}
		};
		return new ModalModule();
	})();

	// 레이어
	var ModalLayer = function(settings) {
		var that = this;
		that.type = 'layer';
		that.settings = {
			'key': '',
			'position': 'center',
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
		module.init();
		(function() { 
			// contents
			that.elements.contents = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $('#' + that.settings.target).get(0));
			that.elements.contents.style.position = 'relative';

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
			that.elements.container.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; display: none;';
			that.elements.container.appendChild(that.elements.contents);
			module.elements.layer.appendChild(that.elements.container);
			if(that.elements.contents.style.display === 'none') {
				that.elements.contents.style.display = 'block';
			}
			
			// 팝업내부 close 버튼 클릭시 닫기
			if(that.settings.close) {
				$(that.elements.contents).find('.' + that.settings.close).on(env['event']['click'], function(event) {
					that.hide();
				});
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
			module.setPosition(that.settings.position, that.elements.contents);
			return that;
		},
		show: function() {
			var that = this;

			// 스크롤바 사이즈만큼 여백
			if(document.documentElement.clientHeight < document.body.offsetHeight) {
				$('html').css({'margin-right': env['browser']['scrollbar'] + 'px', 'overflow': 'hidden'});
			}

			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			that.position();
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
			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}
		},
		remove: function() {
			var that = this;

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
		},
		find: function(selector) {
			var that = this;
			return $(that.elements.container).find(selector);
		},
		resize: function() {
			// width, height 변동에 따른 위치 재조정

		},
		resizeOn: function() {

		},
		resizeOff: function() {

		}
	};

	// Rect
	var ModalRect = function(settings) {
		var that = this;
		that.type = 'rect';
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'mask': null, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null
			},
			'target': '', // #id
			'rect': ''
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		module.init();
		(function() { 
			// contents
			that.elements.contents = (typeof that.settings.target === 'object' && that.settings.target.nodeType ? that.settings.target : $('#' + that.settings.target).get(0));
			that.elements.contents.style.position = 'relative';

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
			that.elements.container.style.cssText = 'position: absolute; left: 0; top: 0; display: none;';
			that.elements.container.appendChild(that.elements.contents);
			document.body.appendChild(that.elements.container);
			if(that.elements.contents.style.display === 'none') {
				that.elements.contents.style.display = 'block';
			}

			// rect
			that.elements.rect = (typeof that.settings.rect === 'object' && that.settings.rect.nodeType ? that.settings.rect : $('#' + that.settings.rect).get(0));
		})();
	};
	ModalRect.prototype = {
		change: function(settings) {

		},
		position: function() {
			var that = this;
			module.setRect(that.settings.position, that.elements.container, that.elements.rect);
			return that;
		},
		show: function() {
			var that = this;

			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			that.position();
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';

			// focus (웹접근성)
			module.active = document.activeElement;
			that.elements.container.setAttribute('tabindex', -1);
			that.elements.container.focus();
		},
		hide: function() {
			var that = this;

			that.elements.container.style.display = 'none';
			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.display = 'none';
			}

			// focus (웹접근성)
			if(module.active) {
				module.active.focus();
			}
		},
		remove: function() {
			var that = this;

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
		}
	};

	// step
	var ModalStep = function(settings) {
		var that = this;
		that.type = 'confirm';
		that.settings = {
			'key': '',
			'callback': {
				'show': null,
				'hide': null
			},
			'step': [] // 각 step 별로 설정값이 들어가 있음
		};
		that.settings = module.setSettings(that.settings, settings);
		that.elements = {};

		// private init
		module.init();
		(function() { 

		})();
	};
	ModalStep.prototype = {

	};

	// 확인
	var ModalConfirm = function(settings) {
		var that = this;
		that.type = 'confirm';
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'mask': true, // 값이 있으면 해당 mask element 를 실행한다.
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
			that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div id="' + key.title + '" style="padding: 18px 18px 10px 18px; font-weight: bold; color: #333; background-color: rgba(255, 255, 255, .97); border-radius: 3px 3px 0 0;">' + that.settings.title + '</div>\
				<div id="' + key.message + '" style="padding: 10px 18px 18px 18px; min-height: 67px; color: #333; background-color: rgba(255, 255, 255, .97);">' + that.settings.message + '</div>\
				<div style="padding: 10px 18px; background: rgba(248, 249, 250, .97); text-align: right; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 3px 3px;">\
					<button id="' + key.cancel + '" style="margin-left: 10px; padding: 5px 10px; background-color: rgb(248, 249, 250); background: linear-gradient(#FFF, #F0F1F2); border: 1px solid #CCC; color: #AAACAD; font-weight: bold; text-shadow: 0 1px #FFF; white-space: nowrap; border-radius: 3px; vertical-align: middle; cursor: pointer;">CANCEL</button>\
					<button id="' + key.ok + '" style="margin-left: 10px; padding: 5px 10px; background-color: rgb(248, 249, 250); background: linear-gradient(#FFF, #F0F1F2); border: 1px solid #CCC; color: #5F6061; font-weight: bold; text-shadow: 0 1px #FFF; white-space: nowrap; border-radius: 3px; vertical-align: middle; cursor: pointer;">OK</button>\
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
		})();
	};
	ModalConfirm.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;
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
			return that;
		},
		position: function() {
			var that = this;
			module.setPosition(that.settings.position, that.elements.container);
			return that;
		},
		show: function() {
			var that = this;

			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			that.position();
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
		},
		hide: function() {
			var that = this;
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
		},
		remove: function() {
			var that = this;

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
		},
		resize: function() {
			// width, height 변동에 따른 위치 재조정

		}
	};

	// 경고
	var ModalAlert = function(settings) {
		var that = this;
		that.type = 'alert';
		that.settings = {
			'key': '',
			'position': 'topcenter',
			'mask': true, // 값이 있으면 해당 mask element 를 실행한다.
			'callback': {
				'show': null,
				'hide': null
			},
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
			that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div id="' + key.title + '" style="padding: 18px 18px 10px 18px; font-weight: bold; color: #333; background-color: rgba(255, 255, 255, .97); border-radius: 3px 3px 0 0;">' + that.settings.title + '</div>\
				<div id="' + key.message + '" style="padding: 10px 18px 18px 18px; min-height: 67px; color: #333; background-color: rgba(255, 255, 255, .97);">' + that.settings.message + '</div>\
				<div style="padding: 10px 18px; background: rgba(248, 249, 250, .97); text-align: right; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 3px 3px;">\
					<button id="' + key.ok + '" style="margin-left: 10px; padding: 5px 10px; background-color: rgb(248, 249, 250); background: linear-gradient(#FFF, #F0F1F2); border: 1px solid #CCC; color: #5F6061; font-weight: bold; text-shadow: 0 1px #FFF; white-space: nowrap; border-radius: 3px; vertical-align: middle; cursor: pointer;">OK</button>\
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
	ModalAlert.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;
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
			return that;
		},
		position: function() {
			var that = this;
			module.setPosition(that.settings.position, that.elements.container);
			return that;
		},
		show: function() {
			var that = this;

			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			that.position();
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
		},
		hide: function() {
			var that = this;
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
		},
		remove: function() {
			var that = this;

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
		},
		resize: function() {
			// width, height 변동에 따른 위치 재조정

		}
	};

	// 푸시
	var ModalPush = function(settings) {
		var that = this;
		that.type = 'push';
		that.settings = {
			'key': '',
			'position': 'topright',
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
		that.time;

		// private init
		module.init();
		(function() { 
			var fragment = document.createDocumentFragment();
			var key = {};

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
			that.elements.container.style.cssText = 'position: fixed; display: none; margin: 10px; width: 290px; font-size: 12px; color: #333; border: 1px solid #D7D8D9; background-color: #FFF; border-radius: 3px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .08);';
			that.elements.container.innerHTML = '\
				<div id="' + key.message + '" style="padding: 12px 12px 6px 12px; min-height: 33px; color: #333; background-color: rgba(255, 255, 255, .97); border-radius: 3px 3px 0 0;">' + that.settings.message + '</div>\
				<div style="padding: 6px 12px 12px 12px; background: rgba(248, 249, 250, .97); text-align: center; border-top: 1px solid rgb(240, 241, 242); border-radius: 0 0 3px 3px;">\
					<button id="' + key.close + '" style="color: #5F6061; text-shadow: 0 1px #FFF; white-space: nowrap; cursor: pointer; background: transparent; border: none;">CLOSE</button>\
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
		})();
	};
	ModalPush.prototype = {
		change: function(settings) {
			var that = this;
			var key, tmp;
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
			return that;
		},
		position: function() {
			var that = this;
			module.setPosition(that.settings.position, that.elements.container);
			return that;
		},
		show: function() {
			var that = this;

			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.zIndex = ++module.zindex;
				that.elements.mask.style.display = 'block';
			}
			that.position();
			that.elements.container.style.zIndex = ++module.zindex;
			that.elements.container.style.display = 'block';

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
		},
		hide: function() {
			var that = this;

			that.elements.container.style.display = 'none';
			if(that.settings.mask === true || (that.settings.mask && typeof that.settings.mask === 'object' && that.settings.mask.nodeType)) {
				that.elements.mask.style.display = 'none';
			}

			// callback
			if(typeof that.settings.callback.hide === 'function') {
				return that.settings.callback.hide.call(that);
			}
		},
		remove: function() {
			var that = this;

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
		},
		resize: function() {
			// width, height 변동에 따른 위치 재조정
			
		}
	};

	// public return
	return {
		setup: function(settings) {
			// 인스턴스 생성
			var instance;
			if(settings['key'] && module.instance[settings['key']]) {
				instance = module.instance[settings['key']];
				instance.change(settings);
			}else {				
				switch(settings['type']) {
					case 'layer':
						if(settings['key']) {
							instance = new ModalLayer(settings);
						}
						break;
					case 'rect':
						if(settings['key']) {
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
		instance: function(key) {
			return module.instance[key] || false;
		}
	};

}, this);
