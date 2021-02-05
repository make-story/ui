/**
 * WebWorker
 */
// url 중복 인스턴스 생성 방지
const connect = {};

export class WebWorkerAPI /*extends Worker*/ {
	constructor(url="", options={}) {
		const { listeners, } = options;
		this.options = options;
		this.listeners = listeners;

		this.url = url;
		this.worker = null;
		this.order = 0;

		//super(this.url);
	}

	open(url=this.url) {
		// 인스턴스 
		this.worker = new Worker(url);

		// 응답
		this.worker.onmessage = (event) => { 
			if(typeof this.listeners.message === 'function') {
				this.listeners.message.call(this, event['data'] || {});
			}
		};

		// 에러
		this.worker.onerror = (event) => { 
			if(typeof this.listeners.error === 'function') {
				this.listeners.error.call(this, event);
			}
		};

		// 콜백
		if(typeof this.listeners.open === 'function') {
			this.listeners.open.call(this, this.worker);
		}
	}

	send(data='') { 
		// 메시지 전송
		return this.worker.postMessage({'order': ++this.order, 'message': data}); // JSON 혹은 기타 직렬화된 데이터를 전달할 수 있다.
	}

	close() {
		// 즉시 종료
		this.worker.terminate();

		// 콜백
		if(typeof this.listeners.close === 'function') {
			this.listeners.close.call(this, this.worker);
		}
	}

	get order() {
		return this.order;
	}

	get worker() {
		return this.worker;
	}
}

export default (url="", options={}) => { 
	options = Object.assign({}, { listeners: {} }, options);
	options.listeners = Object.assign({}, { open: null, message: null, close: null, error: null }, options.listeners);

	// url 값이 null 이거나 "" 빈값일 수 있다.
	// open(url="") 을 통해 새로운 워커 url 로 호출가능하기 때문이다.
	// connect[null] = 값; null 도 하나의 값으로 취급된다.
	if(!url || typeof url !== 'string') {
		return new WebWorkerAPI(url, options);
	}else if(typeof connect[url] === 'object') { 
		return connect[url];
	}else {
		return connect[url] = new WebWorkerAPI(url, options);
	}
};