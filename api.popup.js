



// jQuery || api.dom 존재여부 확인
// var $ = jQuery || api.dom.$;


void function(global) {
	'use strict'; // ES5
	if(typeof global === 'undefined') return false;

	// jQuery || api.dom 구분
	var $;
	if(typeof jQuery !== 'undefined') {
		$ = jQuery;
	}else if(typeof api !== 'undefined' && typeof api.dom !== 'undefined') {
		$ = api.dom.Dom;
	}else {
		return false;
	}

	global.api.popup = (function() {

		return {

		};
	})();

}(window);