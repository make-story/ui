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
			'open': null, // .class
			'close': 'close', // .class
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

		// init
		that.init();
	};

	// prototype
	var fn = Popup.prototype;

	// init
	fn.init = function() {
		var that = this;

		// element 생성 
		var selector = $('#' + that.settings.selector);
		var fragment = $(document.createDocumentFragment());
		var container, popup, header, content;
		

		container = api.$('<div>').attr({'style': 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto;'});
		popup = api.$('<div>').attr({'class': that.settings.css_selector, 'style': 'position: relative; z-index: 10000; width: ' + selector.width() + 'px;'});
		// header
		if(that.settings.header === 'Y') {
			header = api.$('<div>').attr({'class': that.settings.css_header});
			// title
			if(typeof that.settings.title === 'string' && that.settings.title !== '') {
				header.append(api.$('<div>').attr({'class': that.settings.css_title}).text(that.settings.title));
			}
			// close btn
			if(typeof that.settings.img_close === 'string' && that.settings.img_close !== '') {
				header.append(api.$('<div>').attr({'class': that.settings.css_close}).html('<img src="' + that.settings.img_close + '" class="' + that.settings.close + '" style="cursor: pointer;" />'));	
			}else {
				header.append(api.$('<div>').attr({'class': that.settings.css_close}).html('<a href="#none" class="' + that.settings.close + '">닫기</a>'));	
			}
			popup.append(header);
		}


		var html = '';
		// container
		html += '<div style="position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; overflow: auto;">';
			// popup
			html += '<div class="' + that.settings.css_selector + '" style="position: relative; z-index: 10000; width: ' + selector.width() + '">';
				// header
				html += header.join('');
				// content
				html += (function() {
					if(selector[0].outerHTML) {
						return selector[0].outerHTML;
					}else {
						var dummy = document.createElement("div");
						dummy.appendChild(selector[0].cloneNode(true));
						return dummy.innerHTML;
					}
				})();
			html += '</div>';
		html += '</div>';

		selector.replaceWith(html);

		// mask
		var mask = null;
		if($('body').find('#MKmask').length > 0) {
			mask = $('body').find('#MKmask');
		}else {
			mask = '<div id="MKmask" class="' + that.settings.css_mask + '" style="position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 90000;"></div>';
			//$('body').prepend(mask);
		}

		/*
		//event
		if(that.settings.open !== null && typeof that.settings.open === 'string') {
			$(document).find(that.popup).on('click', '.'+that.settings.open, function(event) {
				that.open();
			});
		}
		$(document).find(that.popup).on('click', '.'+that.settings.close, function(event) {
			that.close({'callback': that.settings.callback_close});
		});
		$(document).on('keyup', function(event){
			if(event.keyCode == 27){
				that.close();
			}
		});
		*/
	};

	fn.open = function() {

	};

	fn.close = function() {

	};

	fn.event = function() {

	};

	global.api.popup = Popup;

}(window);