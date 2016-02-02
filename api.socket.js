/*
socket

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

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
	if(typeof global === 'undefined' || global != window || !('api' in global)) {
		return false;	
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
	var Socket = function(parameter) {
		var that = this;

		// parameter
		var parameter = parameter || {};
		var url = parameter['url'];
		var open = parameter['open'];
		var send = parameter['send'];
		var message = parameter['message'];
		var error = parameter['error'];

		// 
		if(!url) {
			return false;
		}else if(typeof connect[url] === 'object') {
			return connect[url];
		}else if(!(this instanceof Socket)) {
			// return instance
			return connect[url] = new Socket(parameter);
		}

		//
		that.queue = [];
		//that.storage = {};
		that.socket = new WebSocket(url);
		that.socket.onopen = function() { // 연결 (소켓이 열리는 시점)
			while(that.queue.length) {
				that.socket.send(that.queue.shift()); // 서버로 메시지 전송
			}
			if(typeof open === 'function') {
				open.call(this, Array.prototype.slice.call(arguments));
			}
		};
		that.socket.onerror = function(error) { // 에러
			if(typeof error === 'function') {
				error.call(this, Array.prototype.slice.call(arguments));
			}
		};

		//
		if(send) {
			that.send(send);
		}
		if(typeof message === 'function') {
			that.message(message);
		}
	};
	Socket.prototype = {
		send: function(data) { // 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
			var that = this;

			if(!data) {
				return false;
			}

			// send 데이터 추가
			that.queue.push(data);
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
		},
		message: function(callback) {
			var that = this;

			if(typeof callback === 'function') {
				that.socket.onmessage = function(event) { // 메시지가 도착할 시점
					callback.call(this, event['data']);
				}; 
				return true;
			}

			return false;
		},
		close: function(callback) {
			var that = this;

			if(typeof callback === 'function') {
				that.socket.close = callback; // 소켓이 닫히는 시점
			}
			that.socket.close();
		}
	};

	// public return
	return Socket;

}, this);