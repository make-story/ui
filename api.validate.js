/*
유효성검사

@date (버전관리)
2016.02.22

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
all
*/

;(function(global, undefined) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}

	// 좌우 공백 제거 
	var trim = function(text) {
		return String(text).replace(/(^\s*)|(\s*$)/g, "");
	};

	// element
	var getElement = function(element, index) {
		if((jQuery && element instanceof jQuery) || (api && api.dom && element instanceof api.dom)) {
			return index === -1 ? element.get() : element.get(index || 0); // jQuery 대응 
		}else {
			return element;
		}
	};

	// element value 값
	var getValue = function(element) {
		if(typeof element === 'object') {
			element = getElement(element);
			return trim(element.value);
		}else if(typeof element === 'string' || typeof element === 'number') {
			return trim(element);
		}
	};

	global.api.validate = {
		// text
		isText : function(value) {
			var value = getValue(value);
			return typeof value === 'string' && value.length > 0;
		},
		// number
		isNumber : function(value) {
			var pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
			var value = getValue(value);
			return (typeof value === 'number' || typeof value === 'string') && pattern.test(value);
		},
		// data
		isDate : function(value) {
			var pattern = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// e-mail
		isEmail : function(value) {
			var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// url 
		isUrl : function(value) {
			var pattern = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// 글자 포함여부
		isEqualTo : function(value, string) {
			var value = getValue(value);
			return this.isText(value) && this.isText(string) && value.indexOf(string) !== -1; //value에 string문자가 포함되었는지 검사
		},
		// 최소글자
		isMinlength : function(value, number) {
			var value = getValue(value);
			return this.isText(value) && (typeof number === 'number' || typeof number === 'string') && value.replace(/<br>|\s/g, "").length >= parseInt(number);
		},
		// 최대글자
		isMaxlength : function(value, number) {
			var value = getValue(value);
			return this.isText(value) && (typeof number === 'number' || typeof number === 'string') && value.replace(/<br>|\s/g, "").length <= parseInt(number);
		},
		// 최소값
		isMin : function(value, number) {
			var value = getValue(value);
			if(this.isNumber(value) && this.isNumber(number)) {
				return value >= number;
			}
			return false;
		},
		// 최대값
		isMax : function(value, number) {
			var value = getValue(value);
			if(this.isNumber(value) && this.isNumber(number)) {
				return value <= number;
			}
			return false;
		},
		// 전화번호
		isPhone : function(value) {
			var pattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
			var value = getValue(value);
			return this.isText(value) && pattern.test(value);
		},
		// extension(확장자)
		isExtension : function(value, extension) {
			var extension = extension || 'jpg,jpeg,gif,png,pdf,hwp,exl'; //관리자 지정 확장자
			var value = getValue(value);
			value = value.substr(value.lastIndexOf(".") + 1).toLowerCase(); //첨부된 확장자
			return this.isText(value) && extension.indexOf(value) !== -1;
		},
		// select
		isSelect: function(element) {
			element = getElement(element);
			if(typeof element === 'object') {
				return this.isText(element.options[element.selectedIndex].value);
			}else {
				return this.isText(element);
			}
		},
		// check
		isCheck: function(element) {
			var is = false;
			var i = 0;
			element = getElement(element, -1);
			if(typeof element === 'object') {
				while(!is && i < element.length) {
			    	if(element[i].checked && this.isText(element[i])) {
			        	is = true;
			        }
			        i++;
				}
				return is;
			}else {
				return this.isText(element);
			}
		}
	};

})(this);