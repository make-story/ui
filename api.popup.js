/*
Div Popup 

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
*/

(function(factory, global) {

	'use strict'; // ES5
	var $;
	if(typeof global === undefined || global !== window) {
		return false;	
	}
	// jQuery || api.dom 구분
	if(typeof global.jQuery !== undefined) {
		$ = global.jQuery;
	}else if(global.api && typeof global.api.$ !== undefined) {
		$ = global.api.$;
	}else {
		return false;
	}
	return factory($, global);

})(function($, global, undefined) {

	'use strict'; // ES5

	var active_element; // 현재 포커스 위치
	//var current_scroll; // 현재 스크롤바 위치
	var Popup = function(parameter) {
		// return instance
		if(!(this instanceof Popup)) {
			//return new arguments.callee; // callee: 없어지는 스팩
			return new Popup(parameter);
		}
		
		var that = this;
		var parameter = parameter || {}; // 사용자 설정값

		// settings
		that.settings = {
			'element': null, // popup element
			'mask': true // is mask
		};
		var setSettings = function(settings, options) {
			var key;
			for(key in options) {
				if(options[key] && options[key].constructor === Object) {
					settings[key] = setSettings(settings[key], options[key]);
				}else {
					settings[key] = options[key];
				}
			}
			return settings;
		};
		that.settings = setSettings(that.settings, parameter);
		if(that.settings.element === null || typeof that.settings.element !== 'object') {
			return false;
		}

		// element
		that.element = {};
		that.element.container;
		that.element.popup = $(that.settings.element);
		that.element.mask;

		// 스크롤바 사이즈
		if(!('scrollbarSize' in global)) {
			that.scrollbar();
		}

		// init
		that.init();
	};

	// init
	Popup.prototype.init = function() {
		var that = this;
		//var fragment = document.createDocumentFragment();
		/*
		// mask
		if(that.settings.mask === true) {
			//if($(document.body).find('#api_popup_mask').length > 0) {
			if(document.getElementById('api_mask')) {
				//that.element.mask = $(document.body).find('#api_mask');
				that.element.mask = $(document.getElementById('api_mask'));
			}else {
				that.element.mask = $('<div>').attr({'id': 'api_popup_mask', 'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 90000; display: none; opacity: 0.5; background-color: #FFF;'});
				document.body.insertBefore(that.element.mask[0], document.body.firstChild);
			}
		}
		*/

		// container (mask 와 container 를 별도로 두는 이유는 mask에 opacity 값이 적용되기 때문이다.)
		//if($(document.body).find('#api_container').length > 0) {
		if(document.getElementById('api_container')) {
			//that.element.container = $(document.body).find('#api_container');
			that.element.container = $(document.getElementById('api_container'));
		}else {
			that.element.container = $('<div>').attr({'id': 'api_container', 'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto; display: none; background-color: rgba(255, 255, 255, 0.5);'});
			//that.element.container[0].cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto; display: none; background-color: rgba(255, 255, 255, 0.5);';
			document.body.insertBefore(that.element.container[0], document.body.firstChild);
		}

		// popup
		that.element.popup[0].style.position = 'relative';
		that.element.popup[0].style.display = 'none';
		that.element.container.append(that.element.popup);		
	};

	// scrollbar
	Popup.prototype.scrollbar = function() {
		var div = document.createElement("div");
		var scrollbar;

		div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.documentElement.appendChild(div);
		scrollbar = div.offsetWidth - div.clientWidth;
		document.documentElement.removeChild(div);

		global.scrollbarSize = scrollbar;
	};

	// 위치값
	Popup.prototype.position = function(element) {
		var that = this;
		var left = 0;
		var top = 0;
		var width = {
			'window': Math.round($(global).width()),
			'document': Math.round($('body').width()),
			'element': Math.round(element.outerWidth()) // width + padding + border
		};
		var height = {
			'window': Math.round($(global).height()),
			'document': Math.round($('body').height()),
			'element': Math.round(element.outerHeight()) // width + padding + border
		};
		var tmp_height, tmp_top;

		// 계산
		if(width.window > width.element) left = Math.round(width.window / 2) - Math.round(width.element / 2);
		//else left = 0; // 윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
		if(height.window > height.element) top = Math.round(height.window / 2) - Math.round(height.element / 2);
		//else top = 0; // 윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우

		// top값 + div높이 > body(window) 전체 높이보다 클경우 (div가 페이지보다 더 아래로 내려가지 않도록함.)
		tmp_height = Math.max(height.window, height.document);
		tmp_top = Math.round(top + height.element);
		if(tmp_top > tmp_height) {
			top = top - Math.round(tmp_top - tmp_height);
		}
		
		// 위치값이 0보다 작지않도록 제어
		if(left < 0) left = 0;
		if(top < 0) top = 0;

		return {'top': top, 'left': left};
	};

	// resize
	Popup.prototype.resize = function() {
		var position = this.position(this.element.popup);
		//this.element.popup.css({'left': position.left + 'px', 'top': position.top + 'px'});
		this.element.popup.animate({'left': position.left + 'px', 'top': position.top + 'px'});
	};

	// 열기
	Popup.prototype.open = function(options) {
		var that = this;
		var options = options || {};
		var callback = options.callback;
		var position;
		var setOpen = function() { // popup 실행
			// 스크롤바 사이즈만큼 여백
			if(document.documentElement.clientHeight < document.body.offsetHeight) {
				$('html').css({'margin-right': scrollbarSize + 'px', 'overflow': 'hidden'});
			}

			// container
			that.element.container.css({'display': 'block'});

			// popup
			position = that.position(that.element.popup);
			that.element.popup.css({'left': position.left + 'px', 'top': (position.top - 20) + 'px'});
			that.element.popup.animate({'top': position.top + 'px', 'opacity': 'show'}, {'duration': 200, 'complete': function() { // popup
				if(callback && typeof callback === 'function') { // 콜백
					callback.call(that.element.popup);
				}
			}});

			// focus (접근성)
			active_element = document.activeElement;
			that.element.popup.attr('tabindex', -1)[0].focus();
		};

		// mask 에 따른 실행
		if(that.element.mask) {
			// mask 실행
			that.element.mask.animate({'opacity': 'show'}, {'complete': function() {
				setOpen();
			}});
		}else {
			setOpen();
		}

		//resize on
		var time = null;
		$(global).on('resize.api_popup_resize', function() {
			global.clearTimeout(time);
			time = global.setTimeout(function() { 
				that.resize();
			}, 500);
		});

		// esc click close on
		$(document).on('keyup.api_popup_keyup', function(event) {
			if(that.element.container.css('display') === 'block' && event.keyCode == 27) {
				that.close();
			}
		});
	};

	Popup.prototype.close = function(options) {
		var that = this;
		var options = options || {};
		var callback = options.callback;
		var setClose = function() {
			// 스크롤 관련 여백 초기화
			$('html').css({'margin-right': null, 'overflow': null});

			//focus (접근성)
			if(active_element) {
				active_element.focus();
			}

			//콜백
			if(callback && typeof callback === 'function') { 
				callback.call(that.element.popup);
			}
		};

		that.element.popup.animate({'top': '-=20px', 'opacity': 'hide'}, {'duration': 300, 'complete': function() {
			// container
			that.element.container.css({'display': 'none'});

			// mask
			if(that.element.mask) {
				that.element.mask.animate({'opacity': 'hide'}, {'duration': 300, 'complete': function() {
					setClose();
				}});
			}else {
				setClose();
			}
		}});

		//resize off
		$(global).off('.api_popup_resize');

		// esc click close off
		$(document).off('.api_popup_keyup');
	};

	if(!global.api) global.api = {};
	global.api.popup = Popup;

}, this);