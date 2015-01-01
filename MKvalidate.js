/**
 * MKvalidate (유효성 검사)
 * @author ysm
 * @since 14.04.10
 */

//유효성 검사
var MKvalidate = {
	getElement : function(element) {
		var type = $.type(element);
		if(type == 'object') {
			return $.trim($(element).val());
		}else if(type == 'string'){
			return $.trim(element);
		}else {
			return false;
		}
	},
	//select
	isSelect : function(element) {
		var 
			type = $.type(element);
		if(type == 'object') {
			return $.trim($(element).has('option:selected').val()); //value 값 반환
		}else {
			return false;
		}
	},
	//text (element 파라미터 string 입력 가능)
	isText : function(element) {
		var value = this.getElement(element);
		return value && value.length > 0;
	},
	//check
	isCheck : function(element) {
		var 
			type = $.type(element);
		if(type == 'object') {
			return $(element).is(':checked');
		}else {
			return false;
		}
	},
	//e-mail (element 파라미터 string 입력 가능)
	isEmail : function(element) {
		var 
			pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
			value = this.getElement(element);
		return value && pattern.test(value);
	},
	//url (element 파라미터 string 입력 가능)
	isUrl : function(element) {
		var 
			pattern = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
			value = this.getElement(element);
		return value && pattern.test(value);
	},
	//data (element 파라미터 string 입력 가능)
	isDate : function(element) {
		var 
			pattern = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,
			value = this.getElement(element);
		return value && pattern.test(value);
	},
	//number (element 파라미터 string 입력 가능)
	isNumber : function(element) {
		var 
			pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
			value = this.getElement(element);
		return value && pattern.test(value);
	},
	//글자 포함여부 (element 파라미터 string 입력 가능)
	isEqualTo : function(element, string) {
		var 
			value1 = this.getElement(element), //element object (검사 타겟)
			value2 = $.trim(string); //string (검사 문자)
		return value1 && value1.indexOf(value2) != -1; //value1에 value2문자가 포함되었는지 검사
	},
	//최소글자
	isMinlength : function(element, number) {
		var 
			value1 = $(element).val().replace(/<br>|\s/g,""), //element object (검사 타겟)
			value2 = parseInt($.trim(number)); //number (검사 숫자)
		return this.isText(element) && value1.length >= value2;
	},
	//최대글자
	isMaxlength : function(element, number) {
		var 
			value1 = $(element).val().replace(/<br>|\s/g,""), //element object (검사 타겟)
			value2 = parseInt($.trim(number)); //number (검사 숫자)
		return this.isText(element) && value1.length <= value2;
	},
	//최소값
	isMin : function(element, number) {
		var 
			value1 = parseInt($(element).val(), 10), //element object (검사 타겟)
			value2 = parseInt(number); //number (검사 숫자)
		return value1 >= value2;
	},
	//최대값
	isMax : function(element, number) {
		var 
			value1 = parseInt($(element).val(), 10), //element object (검사 타겟)
			value2 = parseInt(number); //number (검사 숫자)
		return value1 <= value2;
	},
	//전화번호 (element 파라미터 string 입력 가능)
	isPhone : function(element) {
		var 
			pattern = /^\d{2,3}-\d{3,4}-\d{4}$/,
			value = this.getElement(element);
		return value && pattern.test(value);
	},
	//extension(확장자)
	isExtension : function(element, extension) {
		var 
			extension = extension || 'jpg,jpeg,gif,png,pdf,hwp,exl',
			str = $.trim($(element).val()),
			index = str.lastIndexOf("."),
			value1 = str.substr(index + 1).toLowerCase(), //첨부된 확장자
			value2 = $.trim(extension); //관리자 지정 확장자
		return value1 && value2.indexOf(value1) != -1; //value2에 value1문자가 포함되었는지 검사
	}
};