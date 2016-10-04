/*
worker

@date (버전관리)
2016.06.28

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API/basic_usage

-
사용예

*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.worker = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	return function(settings) {
		// private
		var worker;
		var order = 0; // worker 요청 순번 

		// public
		var APIWorker = function(settings) {
			var that = this;
			var setSettings;

			// settings
			that.settings = {
				'url': '',
				'callback': {
					'message': null,
					'error': null
				}
			};
			setSettings = function setSettings(settings, options) {
				var key;
				for(key in options) {
					if(!options.hasOwnProperty(key)) {
						continue;
					}else if(options[key] && options[key].constructor === Object && !options[key].nodeType) {
						settings[key] = settings[key] || {};
						settings[key] = setSettings(settings[key], options[key]);
					}else {
						settings[key] = options[key];
					}
				}
				return settings;
			};
			that.settings = setSettings(that.settings, settings);

			//
			worker = new Worker(that.settings.url);
			worker.onmessage = function(e) { // 응답
				var event = (typeof e === 'object' && e) || window.event;
				if(typeof that.settings.callback.message === 'function') {
					that.settings.callback.message.call(this, event['data'] || {});
				}
			};
			worker.onerror = function(e) { // 에러
				var event = (typeof e === 'object' && e) || window.event;
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(this, event);
				}
			};
		};
		APIWorker.prototype = {
			order: function() {
				return order;
			},
			send: function(data) { 
				var that = this;

				// 메시지 전송
				worker.postMessage({'order': ++order, 'message': data}); // JSON 혹은 기타 직렬화된 데이터를 전달할 수 있다.

				return that;
			},
			close: function() {
				var that = this;

				// 즉시 종료
				worker.terminate();

				return that;
			}
		};

		// public return
		return new APIWorker(settings);
	};

}, this);