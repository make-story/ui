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
	var visibility = {
		'hidden': '',
		'event': ''
	};
	var isNetwork;
	var setSocketCheck = function() {
		var key, state;

		// 기존 연결이력이 있고, 자동 재연결로 설정된 것 
		for(key in connect) {
			state = connect[key].state();
			if(connect[key].settings.automatic === true && state !== null && !isNaN(parseFloat(state)) && isFinite(state) && 2 <= state) {
				connect[key].open();
			}
		}
	};

	// IOS등에서는 화면노출여부에 따라 socket이 자동 종료됨 
	if(typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		visibility.hidden = "hidden";
		visibility.event = "visibilitychange";
	}else if (typeof document.msHidden !== "undefined") {
		visibility.hidden = "msHidden";
		visibility.event = "msvisibilitychange";
	}else if (typeof document.webkitHidden !== "undefined") {
		visibility.hidden = "webkitHidden";
		visibility.event = "webkitvisibilitychange";
	}
	if(visibility.hidden && visibility.event && typeof document[visibility.hidden] === 'boolean' && typeof document.addEventListener === 'function') {
		document.addEventListener(visibility.event, function(event) {
			/*
			-
			document.visibilityState
			'visible' : 페이지 내용은 적어도 부분적으로 보일 수 있습니다. 실제로 이는 페이지가 최소화 되지 않은 창(브라우저)에서의 선택된 탭 을 의미 합니다.
			'hidden' : 페이지 내용은 사용자에게 표시되지 않습니다. 실제로 이는 document가 background-tap(다른 탭)이거나, 최소화 된 창의 일부이거나, OS 화면 잠금이 활성 상태임을 의미합니다.
			'prerender' : 페이지 내용이 pre-rendering되어 사용자에게 보이지 않습니다 (document.hidden 목적으로 숨겨진 것으로 간주 합니다.). document는이 상태에서 시작될 수 있지만, 절대로 다른 값에서 이 값으로 전환되지는 않습니다. 참고 : 브라우저 지원은 선택 사항입니다.
			'unloaded' : 페이지가 메모리에서 로드되지 않았습니다. 참고 : 브라우저 지원은 선택 사항입니다.
			*/
			//console.log('document.visibilityState', document.visibilityState);
			if(document.visibilityState === 'visible') {
				setSocketCheck();
			}
		}, false);
	}

	// network 여부 확인 
	if(window.navigator && 'onLine' in window.navigator && typeof document.addEventListener === 'function') {
		isNetwork = function(event) {
			if(window.navigator.onLine === true) {
				setSocketCheck();
			}
		};
		// window, document, document.body
		window.addEventListener('online', isNetwork, false);
		window.addEventListener('offline', isNetwork, false);
	}

	return function(settings) {
		if(typeof settings !== 'object' || !settings.url) {
			return false;
		}

		// private
		var socket;
		var queue = [];

		// public
		var APISocket;

		/*
		WS는 HTTP와 는 별도의 프로토콜을 사용하지만, HTTP와 같은 방식으로 TCP 기반에서 통신합니다.
		또한 WSS 역시 HTTPS와 는 별도의 프로토콜을 사용하지만, HTTPS와 같은 방식으로 TCP 기반에서 TLS를 이용하여 통신합니다. 
		URL로 사용되는 것을 보면, "ws://~~"로 사용되고, 보안 통신을 위해서는 "wss://~~"로 사용됩니다.
		*/
		settings.url = settings.url.replace(/^http(s?):\/\//i, ""); // http:// 또는 https:// 제거
		settings.url = /^ws:\/\//i.test(settings.url) || /^wss:\/\//i.test(settings.url) ? settings.url : (function() {
			if(window.location.protocol === 'https:') {
				return 'wss://' + settings.url;
			}else {
				return 'ws://' + settings.url;
			}
		})();

		// 기존 연결 url 여부
		if(typeof connect[settings.url] === 'object') {
			//console.log('중복 instance');
			return connect[settings.url];
		}
		APISocket = function(settings) {
			var that = this;
			var setSettings;

			// settings
			that.settings = {
				'url': '',
				'automatic': true, // 자동연결 여부 (수동으로 close를 호출하지 않으면 다시 재연결시도)
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

			// connection
			if(that.settings.automatic === true) {
				that.open();
			}
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
				if(typeof socket === 'object' && socket instanceof WebSocket && socket.readyState === 1) {
					socket.close(); // 소켓종료
					// delete 는 단순히 객체와 속성과의 연결을 끊을 뿐 실제로 메모리에서 제거하는 것은 아니다
					//delete socket;
					socket = undefined;
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

						// 자동 재연결 
						if(that.settings.automatic === true) {
							that.open();
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

				if(typeof socket === 'object' && socket instanceof WebSocket/* && socket.readyState === 1*/) {
					that.settings.automatic = false; // 자동 재연결 정지 
					socket.close(); // 소켓종료
				}

				return that;
			}
		};

		// public return
		return connect[settings.url] = new APISocket(settings);
	};

}, this);