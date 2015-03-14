/*
Div Popup

The MIT License (MIT)
Copyright (c) Sung-min Yu
*/

(function(api, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) return false;	
	var $;

	// jQuery || api.dom 구분
	if(typeof global.jQuery !== 'undefined') {
		$ = global.jQuery;
	}else if(global.api && typeof global.api.dom !== 'undefined') {
		$ = global.api.$;
	}else {
		return false;
	}

	return api($, global);

})(function($, global) {

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
		var key;

		// settings
		that.settings = { // 기본 설정값
			// selector
			'selector': null, // #id
			'close': 'close', // .class (버튼 event)
			// is
			'header': true,
			'mask': true,
			// html
			'html': {
				'title': null,
				'close': '닫기'
			},
			// css
			'css': {
				'selector': 'popup_selector',
				'header': 'popup_header',
				'title': 'popup_title',
				'close': 'popup_close',
				'mask': 'popup_mask'
			}
		};

		var setOverriding = function(settings, options) {
			var key;
			for(key in options) {
				try {
					if(options[key].constructor === Object) {
						settings[key] = setOverriding(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}catch(e) {
					settings[key] = options[key];
				}
			}
			return settings;
		};
		that.settings = setOverriding(that.settings, parameter);

		// element
		that.element = {
			'container': null,
			'popup': null, 
			'header': null,
			'content': null, 
			'mask': null
		};

		// 스크롤바 사이즈
		if(!('scrollbarSize' in global)) {
			that.scrollbar();
		}

		// init
		that.init();

		// event
		that.eventOn();
	};

	// init
	Popup.prototype.init = function() {
		var that = this;
		var selector = $('#' + that.settings.selector);
		var fragment = $(document.createDocumentFragment());

		// container
		that.element.container = $('<div>').attr({'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto; display: none;'});
		fragment.append(that.element.container);

		// popup
		that.element.popup = $('<div>').attr({'class': that.settings.css.selector, 'style': 'position: relative; z-index: 10000; width: ' + selector.outerWidth(true) + 'px; display: none;'});
		that.element.container.append(that.element.popup);

		// header
		if(that.settings.header === true) {
			that.element.header = $('<div>').attr({'class': that.settings.css.header});
			// title
			that.element.header.append($('<div>').attr({'class': that.settings.css.title}).html(that.settings.html.title));	
			// close btn
			that.element.header.append($('<div>').attr({'class': that.settings.css.close}).html('<a href="#none" class="' + that.settings.close + '">' + that.settings.html.close + '</a>'));	
			//that.element.popup.prepend(that.element.header);
			that.element.popup.append(that.element.header);
		}

		// content
		that.element.content = selector.clone();
		that.element.popup.append(that.element.content);

		// mask
		if(that.settings.mask === true) {
			if($('body').find('#api_mask').length > 0) {
				that.element.mask = $('body').find('#api_mask');
			}else {
				that.element.mask = $('<div>').attr({'id': 'api_mask', 'class': that.settings.css.mask, 'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 90000; display: none;'});
				$('body').prepend(that.element.mask);
			}
		}

		// selector 요소 위치 <-> container 바꿔치기
		//selector.replaceWith(that.element.container);
		selector.replaceWith(fragment);
	};

	// scrollbar
	Popup.prototype.scrollbar = function() {
		var div = document.createElement("div");
		var scrollbar;

		div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.body.appendChild(div);
		scrollbar = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);

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

	// 이벤트
	Popup.prototype.eventOn = function() {
		var that = this;
		// 팝업내부 close 버튼 클릭시 닫기
		$(that.element.popup).find('.' + that.settings.close).on('click', function(event) {
			that.close();
		});
		// esc 클릭시 닫기
		$(document).on('keyup', function(event) {
			if(that.element.container.css('display') === 'block' && event.keyCode == 27) {
				that.close();
			}
		});
	};
	Popup.prototype.eventOff = function() {
		var that = this;
		
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
		var title = options.title || that.settings.html.title;
		var callback_open = options.callback_open || that.settings.callback_open;
		var position;
		var setOpen = function() { // popup 실행
			// title 유동적 변경
			if(typeof title === 'string' && title !== '') {
				that.element.popup.find('.' + that.settings.css.title).html(title);
			}

			// 스크롤바 사이즈만큼 여백
			if(document.documentElement.clientHeight < document.body.offsetHeight) {
				$('html').css({'margin-right': scrollbarSize + 'px', 'overflow': 'hidden'});
			}

			// container
			that.element.container.css({'display': 'block'});

			// popup
			position = that.position(that.element.popup);
			that.element.popup.css({'left': position.left + 'px', 'top': (position.top - 20) + 'px'});
			that.element.popup.animate({'top': position.top + 'px', 'opacity': 'show'}, {'duration': 300, 'complete': function() { // popup
				if(callback_open && typeof callback_open === 'function') { // 콜백
					callback_open.call(that.element.popup);
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
		$(global).on('resize.api_popup', function() {
			global.clearTimeout(time);
			time = global.setTimeout(function() { 
				that.resize();
			}, 500);
		});
	};

	Popup.prototype.close = function(options) {
		var that = this;
		var options = options || {};
		var callback_close = options.callback_close || that.settings.callback_close;
		var setClose = function() {
			// 스크롤 관련 여백 초기화
			$('html').css({'margin-right': null, 'overflow': null});

			//focus (접근성)
			if(active_element) {
				active_element.focus();
			}

			//콜백
			if(callback_close && typeof callback_close === 'function') { 
				callback_close.call(that.element.popup);
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
		$(global).off('.api_popup');
	};

	if(!global.api) global.api = {};
	global.api.popup = Popup;

}, this);