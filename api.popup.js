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
		
		// settings
		var parameter = parameter || {}; // 사용자 설정값
		that.settings = { // 기본 설정값
			'selector': null, // #id
			'open': null, // .class (버튼 event)
			'close': 'close', // .class (버튼 event)
			'header': 'Y',
			'title': null,
			'mask': 'Y',
			// css
			'css_selector': 'popup_selector',
			'css_header': 'popup_header',
			'css_title': 'popup_title',
			'css_close': 'popup_close',
			'css_mask': 'popup_mask',	
			// img
			'img_close': null,
			// callback
			'callback_close': null
		};
		for(var key in that.settings) {
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
			'transparent': null
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

	// prototype
	var fn = Popup.prototype;

	// init
	fn.init = function() {
		var that = this;

		// element
		var selector = $('#' + that.settings.selector);
		//var fragment = $(document.createDocumentFragment());

		// popup
		that.element.popup = $('<div>').attr({'class': that.settings.css_selector, 'style': 'position: relative; z-index: 10000; width: ' + selector.outerWidth(true) + 'px; display: none;'});
	
		// content
		that.element.content = $(selector.clone());
		that.element.popup.append(that.element.content);
		/*
		that.element.popup.html((function() {
			if(selector[0].outerHTML) {
				return selector[0].outerHTML;
			}else {
				var dummy = document.createElement("div");
				dummy.appendChild(selector[0].cloneNode(true));
				return dummy.innerHTML;
			}
		})());
		*/

		// header
		if(that.settings.header === 'Y') {
			that.element.header = $('<div>').attr({'class': that.settings.css_header});
			// title
			if(typeof that.settings.title === 'string' && that.settings.title !== '') {
				that.element.header.append($('<div>').attr({'class': that.settings.css_title}).html(that.settings.title));	
			}
			// close btn
			if(typeof that.settings.img_close === 'string' && that.settings.img_close !== '') {
				that.element.header.append($('<div>').attr({'class': that.settings.css_close}).html('<img src="' + that.settings.img_close + '" class="' + that.settings.close + '" style="cursor: pointer;" />'));	
			}else {
				that.element.header.append($('<div>').attr({'class': that.settings.css_close}).html('<a href="#none" class="' + that.settings.close + '">닫기</a>'));	
			}
			that.element.popup.prepend(that.element.header);
		}

		// container
		that.element.container = $('<div>').attr({'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto; display: none;'});
		that.element.container.append(that.element.popup);

		// selector 요소 위치 <-> container 바꿔치기
		selector.replaceWith(that.element.container);

		// mask
		if($('body').find('#api_transparent').length > 0) {
			that.element.transparent = $('body').find('#api_transparent');
		}else {
			that.element.transparent = $('<div>').attr({'id': 'api_transparent', 'class': that.settings.css_mask, 'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 90000; display: none;'});
			$('body').prepend(that.element.transparent);
		}
	};

	// scrollbar
	fn.scrollbar = function() {
		var div = document.createElement("div");
		var scrollbar;
		div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.body.appendChild(div);
		scrollbar = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);

		window.scrollbarSize = scrollbar;
	};

	// 위치값
	fn.loc = function(element) {
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

		// 계산
		if(width.screen > width.element) left = Math.round(width.screen / 2) - Math.round(width.element / 2);
		//else left = 0; // 윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
		if(height.screen > height.element) top = Math.round(height.screen / 2) - Math.round(height.element / 2);
		//else top = 0; // 윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우

		// top값 + div높이 > body(window) 전체 높이보다 클경우 (div가 페이지보다 더 아래로 내려가지 않도록함.)
		var tmpHeight = height.screen;
		var tmpTop = Math.round(top + height.element);
		if(tmpTop > tmpHeight) {
			top = top - Math.round(tmpTop - tmpHeight);
		}

		// 위치값이 0보다 작지않도록 제어
		if(left < 0) left = 0;
		if(top < 0) top = 0;

		return {'top': top, 'left': left};
	};

	// 이벤트
	fn.event = function() {
		var that = this;
		// 팝업내부 close 버튼 클릭시 닫기
		$(that.element.popup).find('.' + that.settings.close).on('click', function(event) {
			that.close({'callback': that.settings.callback_close});
		});
		// esc 클릭시 닫기
		$(document).on('keyup', function(event){
			if(that.element.container.css('display') === 'block' && event.keyCode == 27){
				that.close({'callback': that.settings.callback_close});
			}
		});
	};

	// 열기
	fn.open = function(options) {
		var that = this;
		var options = options || {};
		var title = options['title'] || null;
		var callback = options['callback'] || null;
		var setPopup = function() { // popup 실행
			// title 유동적 변경
			if(title !== null) {
				that.element.popup.find('.' + that.settings.css_title).html(title);
			}else if(typeof that.settings.title === 'string' && that.settings.title !== '') {
				that.element.popup.find('.' + that.settings.css_title).html(that.settings.title);
			}

			// 스크롤바 사이즈만큼 여백
			if(document.documentElement.clientHeight < document.body.offsetHeight) {
				$('html').css({'margin-right': scrollbarSize + 'px', 'overflow': 'hidden'});
			}

			// container
			that.element.container.css({'display': 'block'});

			// popup
			var loc = that.loc(that.element.popup);
			that.element.popup.css({'left': loc.left + 'px', 'top': (loc.top - 20) + 'px'});
			that.element.popup.animate({'top': loc.top + 'px', 'opacity': 'show'}, {'duration': 500, 'complete': function() { // popup
				if(callback && typeof callback === 'function') { // 콜백
					callback.call(that.element.popup);
				}
			}});

			// focus (접근성)
			active_element = document.activeElement;
			that.element.popup.attr('tabindex', -1)[0].focus();
		};

		// mask 에 따른 실행
		if(that.element.transparent) {
			// mask 실행
			that.element.transparent.animate({'opacity': 'show'}, {'complete': function() {
				setPopup();
			}});
		}else {
			setPopup();
		}

		//resize on
		var time = null;
		$(window).on('resize.api_popup', function() {
			that.close();
			window.clearTimeout(time);
			time = window.setTimeout(function(){ 
				that.open();
			}, 500);
		});
	};

	fn.close = function() {
		var that = this,
			options = options || {},
			callback = options['callback'] || '';

		that.element.popup.animate({'top': '-=20px', 'opacity': 'hide'}, {'duration': 500, 'complete': function() {
			that.element.container.css({'display': 'none'});

			//mask
			if(that.element.transparent) {
				that.element.transparent.animate({'opacity': 'hide'}, {'duration': 500, 'complete': function() {
					$('html').css({'margin-right':'', 'overflow':''});
				}});
			}else {
				$('html').css({'margin-right':'', 'overflow':''});
			}

			//focus (접근성)
			if(active_element) {
				active_element.focus();
			}

			//콜백
			if(callback && typeof callback === 'function') { 
				callback.call(that.element.popup);
			}
		}});

		//resize off
		$(window).off('resize.api_popup');
	};

	global.api.popup = Popup;

}(window);