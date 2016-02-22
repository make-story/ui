/*
유효성검사

@version
0.1 (2016.02.22)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
*/

;(function(global, undefined) {

	var validate = {
		// text
		isText : function(value) {
			return typeof value === 'string' && value.length > 0;
		},
		// number
		isNumber : function(value) {
			var pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
			return (typeof value === 'number' || typeof value === 'string') && pattern.test(value);
		},
		// data
		isDate : function(value) {
			var pattern = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;
			return this.isText(value) && pattern.test(value);
		},
		// e-mail
		isEmail : function(value) {
			var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
			return this.isText(value) && pattern.test(value);
		},
		// url 
		isUrl : function(value) {
			var pattern = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
			return this.isText(value) && pattern.test(value);
		},
		// 글자 포함여부
		isEqualTo : function(value, string) {
			return this.isText(value) && this.isText(string) && value.indexOf(string) != -1; //value에 string문자가 포함되었는지 검사
		},
		// 최소글자
		isMinlength : function(value, number) {
			return this.isText(value) && (typeof number === 'number' || typeof number === 'string') && value.replace(/<br>|\s/g, "").length >= parseInt(number);
		},
		// 최대글자
		isMaxlength : function(value, number) {
			return this.isText(value) && (typeof number === 'number' || typeof number === 'string') && value.replace(/<br>|\s/g, "").length <= parseInt(number);
		},
		// 최소값
		isMin : function(value, number) {
			if(this.isNumber(value) && this.isNumber(number)) {
				return value >= number;
			}
			return false;
		},
		// 최대값
		isMax : function(value, number) {
			if(this.isNumber(value) && this.isNumber(number)) {
				return value <= number;
			}
			return false;
		},
		// 전화번호
		isPhone : function(value) {
			var pattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
			return this.isText(value) && pattern.test(value);
		},
		// extension(확장자)
		isExtension : function(value, extension) {
			var extension = extension || 'jpg,jpeg,gif,png,pdf,hwp,exl'; //관리자 지정 확장자
			var value = value.substr(value.lastIndexOf(".") + 1).toLowerCase(); //첨부된 확장자
			return this.isText(value) && extension.indexOf(value) != -1;
		}
	};

	if(!global.api) {
		global.api = {};
	}

	// public return
	global.api.validate = validate;
})(this);