/**
 * WebSocket Client
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 * https://javascript.info/websocket
 */

// url 중복 인스턴스 생성 방지
const connect = {};
const setSocketCheck = function() {
	// 기존 연결이력이 있고, 자동 재연결로 설정된 것 
	for(let key in connect) {
		let state = connect[key].state();
		if(connect[key].options.reconnect.auto === true && state !== null && !isNaN(parseFloat(state)) && isFinite(state) && 2 <= state) {
			connect[key].open();
		}
	}
};
const setConnectDelete = function(url) {
	return url && connect[url] && delete connect[url];
};
class WebSocketAPI /*extends WebSocket*/ {
	/**
	 * constructor
	 * @param {String} url 
	 * @param {Object} options 
	 */
	constructor(url="", options={}) {
		const { reconnect, listeners } = options;
		this.URL = url; // this.open(url) 에서 값을 새로 입력할 수 있습니다.
		this.options = options;
		this.reconnect = reconnect;
		this.listeners = listeners;
		this.socket = null;
		this.queue = [];

		//super(this.url);
	}

	/**
	 * setter url
	 * this.URL = url;
	 */
	set URL(url="") {
		// 유효성 검사
		if(typeof url !== 'string') {
			return "";
		}

		/*
		WS는 HTTP와 는 별도의 프로토콜을 사용하지만, HTTP와 같은 방식으로 TCP 기반에서 통신합니다.
		또한 WSS 역시 HTTPS와 는 별도의 프로토콜을 사용하지만, HTTPS와 같은 방식으로 TCP 기반에서 TLS를 이용하여 통신합니다. 
		URL로 사용되는 것을 보면, "ws://~~"로 사용되고, 보안 통신을 위해서는 "wss://~~"로 사용됩니다.
		*/
		this.url = url;
		this.url = this.url.replace(/^http(s?):\/\//i, ""); // http:// 또는 https:// 제거
		this.url = /^ws:\/\//i.test(this.url) || /^wss:\/\//i.test(this.url) ? this.url : (() => {
			return window.location.protocol === 'https:' ? `wss://${this.url}` : `ws://${this.url}`;
		})();
	}

	/**
	 * WebSocketAPI.connect()
	 */
	/*static connect() {
		return connect;
	}*/

	/**
	 * 연결 상태 
	 */
	state() {
		/*
		-
		this.socket.readyState
		0: CONNECTING 연결이 수립되지 않은 상태입니다.
		1: OPEN 연결이 수립되어 데이터가 오고갈 수 있는 상태입니다.
		2: CLOSING 연결이 닫히는 중 입니다.
		3: CLOSED 연결이 종료되었거나, 연결에 실패한 경우입니다.
		*/
		return typeof this.socket === 'object' && this.socket instanceof WebSocket ? this.socket.readyState : null;
	}

	/**
	 * 소켓 연결
	 */
	open(url="") {
		// 기존 연결여부 확인 
		if(typeof this.socket === 'object' && this.socket instanceof WebSocket && this.socket.readyState === 1) {
			this.socket.close(); // 소켓종료 - 사용자 close 콜백이 있을 경우 실행된다.
			this.socket = null;
		}

		// 새로운 연결여부 확인
		if(url) {
			this.URL = url;
		}

		// url 필수값 확인 
		if(!this.url || typeof this.url !== 'string') {
			throw "URL 값이 없습니다!";
		}

		// WebSocket
		try {
			this.socket = new WebSocket(this.url);
			this.socket.onopen = () => { // readyState changes to OPEN
				this.reconnect.count = 0;
				this.send();
				if(typeof this.listeners.open === 'function') {
					this.listeners.open.apply(this, Array.prototype.slice.call(arguments));
				}
			};
			this.socket.onmessage = e => { // 메시지가 도착할 시점
				const event = (typeof e === 'object' && e) || window.event || {};

				if(typeof this.listeners.message === 'function') {
					this.listeners.message.call(this, event.data);
				}
			};
			this.socket.onclose = e => { // readyState changes to CLOSED
				const event = (typeof e === 'object' && e) || window.event || {};
				//const { code, reason, wasClean, } = event;
				const code = event.code; // 연결이 종료되는 이유를 가리키는 숫자 값입니다. 지정되지 않을 경우 기본값은 1000으로 간주됩니다. (일반적인 경우의 "transaction complete" 종료를 나타내는 값).
				const reason = event.reason; // 연결이 왜 종료되는지를 사람이 읽을 수 있도록 나타내는 문자열입니다. 이 문자열은 UTF-8 포멧이며, 123 바이트를 넘을 수 없습니다.
				const wasClean = event.wasClean;

				if(typeof this.listeners.close === 'function') {
					this.listeners.close.apply(this, Array.prototype.slice.call(arguments));
				}

				// 자동 재연결 
				if(this.options.reconnect.auto === true) {
					this.reconnect.count += 1;
					this.open();
				}
			};
			this.socket.onerror = () => { // 에러
				if(typeof this.listeners.error === 'function') {
					this.listeners.error.apply(this, Array.prototype.slice.call(arguments));
				}
			};
		}catch(e) { 
			throw e; 
		};

		return this;
	}

	/**
	 * 데이터 전달 
	 * @param {String, Blob, ArrayBuffer} data 
	 */
	send(data) { 
		// data: 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
		// send()네트워크에 대한 호출을 사용하여 대기 중이지만 아직 네트워크에 전송되지 않은 데이터의 바이트 수
		//console.log('bufferedAmount: ' + this.socket.bufferedAmount);

		// send 데이터 추가 (소켓 커넥션 되기 전에 데이터 send 요청건 등 대응)
		if(data) {
			this.queue.push(data);
		}

		// 실행
		if(typeof this.socket === 'object' && this.socket instanceof WebSocket) {
			switch(this.socket.readyState) {
				case 0: // 연결이 수립되지 않은 상태
				case 2: // 연결이 닫히는 중
				case 3: // 연결이 종료되었거나, 연결에 실패한 경우
					break;
				case 1: // 연결이 수립되어 데이터가 오고갈 수 있는 상태
					while(this.queue.length) {
						// 보낼 수 있는 데이터는 String, Blob, 또는 ArrayBuffer
						this.socket.send(this.queue.shift()); // 서버로 메시지 전송
					}
					break;
			}
		}

		return this;
	}

	/**
	 * 소켓 종료 
	 */
	close() {
		if(typeof this.socket === 'object' && this.socket instanceof WebSocket/* && this.socket.readyState === 1*/) {
			this.options.reconnect.auto = false; // 자동 재연결 정지 
			this.socket.close(); // 소켓종료
		}

		return this;
	}
}

// IOS등에서는 화면노출여부에 따라 socket이 자동 종료됨 
document.addEventListener("visibilitychange", function(event) {
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
// network 여부 확인 
const isNetwork = (event) => {
	if(window.navigator.onLine === true) {
		setSocketCheck();
	}
};
// window, document, document.body
window.addEventListener('online', isNetwork, false);
window.addEventListener('offline', isNetwork, false);

export default (url="", options={}) => { 
	options = Object.assign({}, { protocols: ''/*하나의 서버가 두 개 이상의 커뮤니케이션 방식을 가지고 싶도록 하고 싶을 때, 여러개의 웹 소켓 서브 프로토콜을 구현할 수 있도록 설정가능*/, reconnect: {}, listeners: {} }, options);
	options.reconnect = Object.assign({}, { auto: true, count: 0, maxCount: 10 }, options.reconnect);
	options.listeners = Object.assign({}, { open: null, message: null, close: null, error: null }, options.listeners);

	// url 값이 null 이거나 "" 빈값일 수 있다.
	// open(url="") 을 통해 새로운 소켓 url 로 호출가능하기 때문이다.
	// connect[null] = 값; null 도 하나의 값으로 취급된다.
	if(!url || typeof url !== 'string') {
		return new WebSocketAPI(url, options);
	}else if(typeof connect[url] === 'object') { 
		return connect[url];
	}else {
		return connect[url] = new WebSocketAPI(url, options);
	}
};