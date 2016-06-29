/*
web socket

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility
https://developer.mozilla.org/ko/docs/Web/API/WebSocket

-
사용예
var socket = api.socket({
	'url': 'ws://www.makestory.net:3000',
	'callback': {
		'open': function() {
	
		},
		'message': function() {
	
		},
		'close': function() {
	
		},
		'error': function() {
	
		}
	}
});
socket.send(데이터);
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	global.api.socket = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	// url 중복 인스턴스 생성 방지
	var connect = {};
	return function(settings) {
		// 기존 연결 url 여부
		if(!settings.url) {
			return false;
		}else if(typeof connect[settings.url] === 'object') {
			//console.log('중복 instance');
			return connect[settings.url];
		}

		// private
		var socket;
		var queue = [];

		// public
		var APISocket = function(settings) {
			var that = this;
			var setSettings;

			// settings
			that.settings = {
				'url': '',
				'callback': {
					'open': null,
					'message': null,
					'close': null,
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
			that.settings.url = /^ws:\/\//.test(that.settings.url) ? that.settings.url : 'ws://' + that.settings.url;
			
			// private
			socket = new WebSocket(that.settings.url);
			socket.onopen = function() { // readyState changes to OPEN
				that.send();
				if(typeof that.settings.callback.open === 'function') {
					that.settings.callback.open.call(that, Array.prototype.slice.call(arguments));
				}
			};
			socket.onmessage = function(event) { // 메시지가 도착할 시점
				if(typeof that.settings.callback.message === 'function') {
					that.settings.callback.message.call(that, event['data']);
				}
			};
			socket.onclose = function(event) { // readyState changes to CLOSED
				var code = event.code; // 연결이 종료되는 이유를 가리키는 숫자 값입니다. 지정되지 않을 경우 기본값은 1000으로 간주됩니다. (일반적인 경우의 "transaction complete" 종료를 나타내는 값).
				var reason = event.reason; // 연결이 왜 종료되는지를 사람이 읽을 수 있도록 나타내는 문자열입니다. 이 문자열은 UTF-8 포멧이며, 123 바이트를 넘을 수 없습니다.
				var wasClean = event.wasClean;
				if(typeof that.settings.callback.close === 'function') {
					that.settings.callback.close.call(that, Array.prototype.slice.call(arguments));
				}
			};
			socket.onerror = function() { // 에러
				if(typeof that.settings.callback.error === 'function') {
					that.settings.callback.error.call(that, Array.prototype.slice.call(arguments));
				}
			};
		};
		APISocket.prototype = {
			send: function(data) { // 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
				var that = this;

				// send 데이터 추가
				if(data) {
					queue.push(data);
				}
				//console.log('bufferedAmount: ' + socket.bufferedAmount);

				// 실행
				/*
				-
				socket.readyState
				CONNECTING	0	연결이 수립되지 않은 상태입니다.
				OPEN	1	연결이 수립되어 데이터가 오고갈 수 있는 상태입니다.
				CLOSING	2	연결이 닫히는 중 입니다.
				CLOSED	3	연결이 종료되었거나, 연결에 실패한 경우입니다.
				*/
				switch(socket.readyState) {
					case 0: // 연결이 수립되지 않은 상태
					case 2: // 연결이 닫히는 중
					case 3: // 연결이 종료되었거나, 연결에 실패한 경우
						break;
					case 1: // 연결이 수립되어 데이터가 오고갈 수 있는 상태
						while(queue.length) {
							// 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
							socket.send(queue.shift()); // 서버로 메시지 전송
						}
						break;
				}

				return that;
			},
			close: function() {
				var that = this;

				if(typeof socket === 'object' && socket.readyState <= 1) {
					socket.close(); // 소켓종료
					delete connect[that.settings.url];
				}

				return that;
			}
		};

		// public return
		return connect[settings.url] = new APISocket(settings);
	};

}, this);