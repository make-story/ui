/*
socket

@date
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility


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
			'message': null,
			'error': null
		};
		for(key in settings) {
			if(settings.hasOwnProperty(key)) {
				that.settings[key] = settings[key];
			}
		}

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
				that.settings.url = /^ws:\/\//.test(that.settings.url) ? that.settings.url : 'ws://' + that.settings.url;
				that.socket = new WebSocket(that.settings.url);
			}catch(e) {
				if(typeof that.settings.error === 'function') {
					that.settings.error.call(this, Array.prototype.slice.call(arguments));
				}
			}
			that.socket.onopen = function() { // 연결 (소켓이 열리는 시점)
				that.send();
				if(typeof that.settings.open === 'function') {
					that.settings.open.call(this, Array.prototype.slice.call(arguments));
				}
			};
			that.socket.onerror = function() { // 에러
				if(typeof that.settings.error === 'function') {
					that.settings.error.call(this, Array.prototype.slice.call(arguments));
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

			if(typeof that.socket === 'object') {
				that.socket = that.socket.close();
				delete connect[that.settings.url];
			}

			return that;
		}
	};

	// public return
	return Socket;

}, this);