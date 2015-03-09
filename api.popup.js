/*
Div Popup

The MIT License (MIT)
Copyright (c) Sung-min Yu
*/

void function(global) {
	'use strict'; // ES5
	if(typeof global === 'undefined') return false;

	// jQuery || api.dom 구분
	var $;
	if(typeof global.jQuery !== 'undefined') {
		$ = global.jQuery;
	}else if(typeof global.api !== 'undefined' && typeof global.api.dom !== 'undefined') {
		$ = global.api.$;
	}else {
		return false;
	}

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
			'id_selector': null, // #id
			'class_open': null, // .class (버튼 event)
			'class_close': 'close', // .class (버튼 event)
			// is
			'is_header': 'Y',			
			'is_mask': 'Y',
			// css
			'css_selector': 'popup_selector',
			'css_header': 'popup_header',
			'css_title': 'popup_title',
			'css_close': 'popup_close',
			'css_mask': 'popup_mask',
			// html
			'html_title': null,
			'html_close': '닫기',
			// callback
			'callback_close': null
		};
		for(key in that.settings) {
			if(that.settings.hasOwnProperty(key)) {
				if(parameter[key]) {
					that.settings[key] = parameter[key];
				}
			}
		}

		// element
		that.element = {
			'container': null,
			'popup': null, 
			'header': null,
			'content': null, 
			'mask': null
		};

		// 스크롤바 사이즈
		if(!('scrollbarSize' in window)) {
			that.scrollbar();
		}

		// init
		that.init();

		// event
		that.event();
	};

	// init
	Popup.prototype.init = function() {
		var that = this;
		var selector = $('#' + that.settings.id_selector);
		//var fragment = $(document.createDocumentFragment());

		// popup
		that.element.popup = $('<div>').attr({'class': that.settings.css_selector, 'style': 'position: relative; z-index: 10000; width: ' + selector.outerWidth(true) + 'px; display: none;'});
	
		// content
		that.element.content = selector.clone();
		that.element.popup.append(that.element.content);

		// header
		if(that.settings.is_header === 'Y') {
			that.element.header = $('<div>').attr({'class': that.settings.css_header});
			// title
			if(typeof that.settings.html_title === 'string' && that.settings.html_title !== '') {
				that.element.header.append($('<div>').attr({'class': that.settings.css_title}).html(that.settings.html_title));	
			}
			// close btn
			that.element.header.append($('<div>').attr({'class': that.settings.css_close}).html('<a href="#none" class="' + that.settings.class_close + '">' + that.settings.html_close + '</a>'));	
			that.element.popup.prepend(that.element.header);
		}

		// container
		that.element.container = $('<div>').attr({'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto; display: none;'});
		that.element.container.append(that.element.popup);

		// selector 요소 위치 <-> container 바꿔치기
		selector.replaceWith(that.element.container);

		// mask
		if(that.settings.is_mask === 'Y') {
			if($('body').find('#api_mask').length > 0) {
				that.element.mask = $('body').find('#api_mask');
			}else {
				that.element.mask = $('<div>').attr({'id': 'api_mask', 'class': that.settings.css_mask, 'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 90000; display: none;'});
				$('body').prepend(that.element.mask);
			}
		}
	};

	// scrollbar
	Popup.prototype.scrollbar = function() {
		var div = document.createElement("div");
		var scrollbar;

		div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.body.appendChild(div);
		scrollbar = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);

		window.scrollbarSize = scrollbar;
	};

	// 위치값
	Popup.prototype.position = function(element) {
		var that = this;
		var left = 0;
		var top = 0;
		var width = {
			'screen': Math.max($(window).width(), $('body').width()),
			'element': element.outerWidth(true) // width + padding + border + margin
		};
		var height = {
			'screen': Math.max($(window).height(), $('body').height()),
			'element': element.outerHeight(true) // width + padding + border + margin
		};
		var tmp_height, tmp_top;

		// 계산
		if(width.screen > width.element) left = Math.round(width.screen / 2) - Math.round(width.element / 2);
		//else left = 0; // 윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
		if(height.screen > height.element) top = Math.round(height.screen / 2) - Math.round(height.element / 2);
		//else top = 0; // 윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우

		// top값 + div높이 > body(window) 전체 높이보다 클경우 (div가 페이지보다 더 아래로 내려가지 않도록함.)
		tmp_height = height.screen;
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
	Popup.prototype.event = function() {
		var that = this;
		// 팝업내부 close 버튼 클릭시 닫기
		$(that.element.popup).find('.' + that.settings.class_close).on('click', function(event) {
			that.close();
		});
		// esc 클릭시 닫기
		$(document).on('keyup', function(event) {
			if(that.element.container.css('display') === 'block' && event.keyCode == 27) {
				that.close();
			}
		});
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
		var html_title = options.html_title || that.settings.html_title;
		var callback_open = options.callback_open || that.settings.callback_open;
		var position;
		var setOpen = function() { // popup 실행
			// title 유동적 변경
			if(typeof html_title === 'string' && html_title !== '') {
				that.element.popup.find('.' + that.settings.css_title).html(html_title);
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
		$(window).on('resize.api_popup', function() {
			window.clearTimeout(time);
			time = window.setTimeout(function() { 
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
		$(window).off('.api_popup');
	};

	global.api.popup = Popup;

}(window);