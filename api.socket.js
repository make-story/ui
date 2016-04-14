/*
socket

@date
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
	'url': 'ws://www.makestory.net:3000'
});
socket.send(데이터);
socket.message(콜백설정);
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

	/*
	-
	socket.readyState
	CONNECTING	0	연결이 수립되지 않은 상태입니다.
	OPEN	1	연결이 수립되어 데이터가 오고갈 수 있는 상태입니다.
	CLOSING	2	연결이 닫히는 중 입니다.
	CLOSED	3	연결이 종료되었거나, 연결에 실패한 경우입니다.
	*/
	// url 중복 인스턴스 생성 방지
	var connect = {};

	// 소켓
	var Socket = function Socket(settings) {
		var that = this;
		var key;

		// 기존 연결 url 여부
		if(!settings.url) {
			return false;
		}else if(typeof connect[settings.url] === 'object') {
			return connect[settings.url];
		}else if(!(this instanceof Socket)) {
			return connect[settings.url] = new Socket(settings);
		}

		// settings
		that.settings = {
			'url': '',
			'open': null,
			'close': null,
			'message': null,
			'error': null
		};
		for(key in settings) {
			if(settings.hasOwnProperty(key)) {
				that.settings[key] = settings[key];
			}
		}
		that.settings.url = /^ws:\/\//.test(that.settings.url) ? that.settings.url : 'ws://' + that.settings.url;

		// 연결
		that.queue = [];
		that.socket;
		that.open();
		if(typeof that.settings.message === 'function') {
			that.message(that.settings.message);
		}
	};
	Socket.prototype = {
		open: function() {
			var that = this;

			try {
				that.socket = new WebSocket(that.settings.url);
			}catch(e) {}
			that.socket.onopen = function() { // readyState changes to OPEN
				that.send();
				if(typeof that.settings.open === 'function') {
					that.settings.open.call(that, Array.prototype.slice.call(arguments));
				}
			};
			that.socket.onclose = function(event) { // readyState changes to CLOSED
				var code = event.code; // 연결이 종료되는 이유를 가리키는 숫자 값입니다. 지정되지 않을 경우 기본값은 1000으로 간주됩니다. (일반적인 경우의 "transaction complete" 종료를 나타내는 값).
				var reason = event.reason; // 연결이 왜 종료되는지를 사람이 읽을 수 있도록 나타내는 문자열입니다. 이 문자열은 UTF-8 포멧이며, 123 바이트를 넘을 수 없습니다.
				var wasClean = event.wasClean;
				if(typeof that.settings.close === 'function') {
					that.settings.close.call(that, Array.prototype.slice.call(arguments));
				}
			};
			that.socket.onerror = function() { // 에러
				if(typeof that.settings.error === 'function') {
					that.settings.error.call(that, Array.prototype.slice.call(arguments));
				}
			};

			return that;
		},
		send: function(data) { // 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
			var that = this;

			// send 데이터 추가
			if(data) {
				that.queue.push(data);
			}
			//console.log('bufferedAmount: ' + that.socket.bufferedAmount);

			// 실행
			switch(that.socket.readyState) {
				case 0: // 연결이 수립되지 않은 상태
				case 2: // 연결이 닫히는 중
				case 3: // 연결이 종료되었거나, 연결에 실패한 경우
					break;
				case 1: // 연결이 수립되어 데이터가 오고갈 수 있는 상태
					while(that.queue.length) {
						// 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
						that.socket.send(that.queue.shift()); // 서버로 메시지 전송
					}
					break;
			}

			return that;
		},
		message: function(callback) {
			var that = this;

			if(typeof callback === 'function') {
				that.socket.onmessage = function(event) { // 메시지가 도착할 시점
					callback.call(this, event['data']);
				}; 
			}

			return that;
		},
		close: function() {
			var that = this;

			if(typeof that.socket === 'object' && that.socket.readyState <= 1) {
				that.socket.close();
				delete connect[that.settings.url];
			}

			return that;
		}
	};

	// public return
	return Socket;

}, this);