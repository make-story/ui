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
	'listeners': {
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
socket.state();
socket.send(데이터);
socket.close(); // 소켓 연결 종료
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
				'listeners': {
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

			// connection
			that.open();
		};
		APISocket.prototype = {
			state: function() {
				var that = this;
				var result = null;

				if(typeof socket === 'object' && socket instanceof WebSocket) {
					/*
					-
					socket.readyState
					0: CONNECTING 연결이 수립되지 않은 상태입니다.
					1: OPEN 연결이 수립되어 데이터가 오고갈 수 있는 상태입니다.
					2: CLOSING 연결이 닫히는 중 입니다.
					3: CLOSED 연결이 종료되었거나, 연결에 실패한 경우입니다.
					*/
					result = socket.readyState;
				}

				return result;
			},
			open: function() {
				var that = this;

				// 기존 연결여부 확인 
				if(that.settings.url in connect) {
					that.close();
				}

				// WebSocket
				try {
					socket = new WebSocket(that.settings.url);
					socket.onopen = function() { // readyState changes to OPEN
						that.send();
						if(typeof that.settings.listeners.open === 'function') {
							that.settings.listeners.open.apply(that, Array.prototype.slice.call(arguments));
						}
					};
					socket.onmessage = function(e) { // 메시지가 도착할 시점
						var event = (typeof e === 'object' && e) || window.event || {};
						
						if(typeof that.settings.listeners.message === 'function') {
							that.settings.listeners.message.call(that, event['data']);
						}
					};
					socket.onclose = function(e) { // readyState changes to CLOSED
						var event = (typeof e === 'object' && e) || window.event || {};
						var code = event.code; // 연결이 종료되는 이유를 가리키는 숫자 값입니다. 지정되지 않을 경우 기본값은 1000으로 간주됩니다. (일반적인 경우의 "transaction complete" 종료를 나타내는 값).
						var reason = event.reason; // 연결이 왜 종료되는지를 사람이 읽을 수 있도록 나타내는 문자열입니다. 이 문자열은 UTF-8 포멧이며, 123 바이트를 넘을 수 없습니다.
						var wasClean = event.wasClean;

						if(typeof that.settings.listeners.close === 'function') {
							that.settings.listeners.close.apply(that, Array.prototype.slice.call(arguments));
						}
					};
					socket.onerror = function() { // 에러
						if(typeof that.settings.listeners.error === 'function') {
							that.settings.listeners.error.apply(that, Array.prototype.slice.call(arguments));
						}
					};
				}catch(e) { 
					throw e; 
				};

				return that;
			},
			send: function(data) { // 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
				var that = this;

				// send()네트워크에 대한 호출을 사용하여 대기 중이지만 아직 네트워크에 전송되지 않은 데이터의 바이트 수
				//console.log('bufferedAmount: ' + socket.bufferedAmount);

				// send 데이터 추가
				if(data) {
					queue.push(data);
				}

				// 실행
				if(typeof socket === 'object' && socket instanceof WebSocket) {
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